import { query } from '../config/db';
import { TRENDING_CONFIG } from '../config/trending.config';
import { Post, TrendingBand } from '../types/post.types';

export function calculateScore(post: Pick<Post, 'views' | 'likes' | 'shares' | 'createdAt'>): {
  score: number;
  recencyDecay: number;
} {
  const { weights, decay } = TRENDING_CONFIG;
  const rawScore = post.views * weights.views + post.likes * weights.likes + post.shares * weights.shares;
  const hoursAge = (Date.now() - new Date(post.createdAt).getTime()) / 3_600_000;
  const decayFactor = 1 - Math.pow(0.5, hoursAge / decay.halfLifeHours);
  const recencyDecay = rawScore * decayFactor;
  const score = rawScore - recencyDecay;
  return { score, recencyDecay };
}

export function getBand(score: number): TrendingBand {
  const { bands } = TRENDING_CONFIG;
  if (score >= bands.hot)  return 'hot';
  if (score >= bands.warm) return 'warm';
  return 'cold';
}

export function mapRow(row: Record<string, unknown>): Post {
  return {
    id:           row['id'] as string,
    rank:         (row['rank'] as number) ?? 0,
    title:        row['title'] as string,
    category:     row['category'] as Post['category'],
    score:        Number(row['score']),
    likes:        row['likes'] as number,
    views:        row['views'] as number,
    shares:       row['shares'] as number,
    recencyDecay: Number(row['recency_decay']),
    isNew:        (row['is_new'] as boolean) ?? false,
    trending:     row['trending'] as TrendingBand,
    createdAt:    row['created_at'] as Date,
    updatedAt:    row['updated_at'] as Date,
  };
}

// Extended row type used during scoring / ranking
type ScoredRow = Record<string, unknown> & {
  score: number;
  recencyDecay: number;
  trending: TrendingBand;
};

type RankedRow = ScoredRow & {
  rank: number;
  is_new: boolean;
};

export async function computeAndRankAll(previousTop20Ids: Set<string>): Promise<Post[]> {
  // 1. Fetch all posts
  const { rows } = await query<Record<string, unknown>>(
    'SELECT * FROM posts ORDER BY created_at ASC'
  );

  if (rows.length === 0) return [];

  // 2. Recalculate score and recency decay for each post
  const scored: ScoredRow[] = rows.map((row) => {
    const createdAt = row['created_at'] as Date;
    const { score, recencyDecay } = calculateScore({
      views:     row['views'] as number,
      likes:     row['likes'] as number,
      shares:    row['shares'] as number,
      createdAt,
    });
    const result: ScoredRow = Object.assign({}, row, {
      score,
      recencyDecay,
      trending: getBand(score),
    });
    return result;
  });

  // 3. Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // 4. Assign rank + isNew flag
  const newTop20Ids = new Set(scored.slice(0, 20).map((p) => p['id'] as string));
  const ranked: RankedRow[] = scored.map((row, idx) => {
    const postId = row['id'] as string;
    return Object.assign({}, row, {
      rank:   idx + 1,
      is_new: !previousTop20Ids.has(postId) && newTop20Ids.has(postId),
    });
  });

  // 5. Bulk update PostgreSQL via UNNEST
  if (ranked.length > 0) {
    const ids       = ranked.map((p) => p['id'] as string);
    const scores    = ranked.map((p) => p.score);
    const decays    = ranked.map((p) => p.recencyDecay);
    const ranks     = ranked.map((p) => p.rank);
    const trendings = ranked.map((p) => p.trending);
    const isNews    = ranked.map((p) => p.is_new);

    await query(
      `UPDATE posts SET
         score         = data.score,
         recency_decay = data.recency_decay,
         rank          = data.rank,
         trending      = data.trending,
         is_new        = data.is_new
       FROM (
         SELECT
           UNNEST($1::uuid[])    AS id,
           UNNEST($2::numeric[]) AS score,
           UNNEST($3::numeric[]) AS recency_decay,
           UNNEST($4::int[])     AS rank,
           UNNEST($5::text[])    AS trending,
           UNNEST($6::bool[])    AS is_new
       ) AS data
       WHERE posts.id = data.id`,
      [ids, scores, decays, ranks, trendings, isNews]
    );
  }

  return ranked.map(mapRow);
}

export async function recalculateSinglePost(id: string): Promise<Post | null> {
  const { rows } = await query<Record<string, unknown>>(
    'SELECT * FROM posts WHERE id = $1',
    [id]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  const { score, recencyDecay } = calculateScore({
    views:     row['views'] as number,
    likes:     row['likes'] as number,
    shares:    row['shares'] as number,
    createdAt: row['created_at'] as Date,
  });
  const trending = getBand(score);
  await query(
    'UPDATE posts SET score = $1, recency_decay = $2, trending = $3 WHERE id = $4',
    [score, recencyDecay, trending, id]
  );
  return mapRow(Object.assign({}, row, { score, recency_decay: recencyDecay, trending }));
}
