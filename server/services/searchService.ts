import { query } from '../config/db';
import { Post, TrendingBand } from '../types/post.types';

function sanitizeQuery(input: string): string {
  return input.replace(/[^a-zA-Z0-9\s\-']/g, '').trim();
}

function mapRow(row: Record<string, unknown>): Post {
  return {
    id:           row.id as string,
    rank:         (row.rank as number) ?? 0,
    title:        row.title as string,
    category:     row.category as Post['category'],
    score:        Number(row.score),
    likes:        row.likes as number,
    views:        row.views as number,
    shares:       row.shares as number,
    recencyDecay: Number(row.recency_decay),
    isNew:        row.is_new as boolean,
    trending:     row.trending as TrendingBand,
    createdAt:    row.created_at as Date,
    updatedAt:    row.updated_at as Date,
  };
}

export async function searchPosts(
  rawQuery: string,
  category?: string
): Promise<Post[]> {
  if (!rawQuery || rawQuery.trim().length < 2) return [];

  const clean = sanitizeQuery(rawQuery);
  if (!clean) return [];

  const { rows } = await query<Record<string, unknown>>(
    `SELECT *,
       ts_rank(to_tsvector('english', title), plainto_tsquery('english', $1)) AS relevance
     FROM posts
     WHERE to_tsvector('english', title) @@ plainto_tsquery('english', $1)
       AND ($2::text IS NULL OR category = $2)
     ORDER BY relevance DESC, score DESC
     LIMIT 20`,
    [clean, category ?? null]
  );

  return rows.map(mapRow);
}
