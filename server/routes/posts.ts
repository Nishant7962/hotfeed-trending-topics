import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { searchLimiter, viewLimiter } from '../middleware/rateLimiter';
import { getTopPostsFromCache, getCacheAge, invalidateCache } from '../services/cacheLayer';
import { recalculateSinglePost, mapRow } from '../services/trendingEngine';
import { searchPosts } from '../services/searchService';
import { query } from '../config/db';
import { redis } from '../config/redis';
import { Post, TrendingBand } from '../types/post.types';

const router = Router();

const VALID_CATEGORIES = ['Tech', 'Sports', 'Gaming', 'Music', 'Science', 'Culture'] as const;

const listSchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(50).default(20),
  category: z.enum(VALID_CATEGORIES).optional(),
});

const searchSchema = z.object({
  q:        z.string().min(2),
  category: z.enum(VALID_CATEGORIES).optional(),
});

const uuidSchema = z.object({
  id: z.string().uuid(),
});

// ---- Helper to map DB row ----
function mapDbRow(row: Record<string, unknown>): Post {
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
    isNew:        row.is_new as boolean ?? false,
    trending:     row.trending as TrendingBand,
    createdAt:    row.created_at as Date,
    updatedAt:    row.updated_at as Date,
  };
}

// ---- GET /api/posts/search — MUST be before /:id ----
router.get(
  '/search',
  searchLimiter,
  validate(searchSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { q, category } = req.query as z.infer<typeof searchSchema>;
      const results = await searchPosts(q, category);
      res.json(results);
    } catch (err) {
      next(err);
    }
  }
);

// ---- GET /api/posts ----
router.get(
  '/',
  validate(listSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, category } = req.query as unknown as z.infer<typeof listSchema>;

      // Try Redis cache on unfiltered page 1
      if (page === 1 && !category) {
        const cached = await getTopPostsFromCache();
        if (cached) {
          const cacheAge = await getCacheAge();
          res.json({
            data: cached,
            meta: { page: 1, limit, total: cached.length, hasNextPage: false, fromCache: true, cacheAge },
          });
          return;
        }
      }

      const offset = (page - 1) * limit;
      const countQuery = category
        ? query<{ count: string }>('SELECT COUNT(*)::int AS count FROM posts WHERE category = $1', [category])
        : query<{ count: string }>('SELECT COUNT(*)::int AS count FROM posts');

      const dataQuery = category
        ? query<Record<string, unknown>>(
            'SELECT * FROM posts WHERE category = $1 ORDER BY score DESC LIMIT $2 OFFSET $3',
            [category, limit, offset]
          )
        : query<Record<string, unknown>>(
            'SELECT * FROM posts ORDER BY score DESC LIMIT $1 OFFSET $2',
            [limit, offset]
          );

      const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);
      const total = Number(countResult.rows[0]?.count ?? 0);

      res.json({
        data: dataResult.rows.map(mapDbRow),
        meta: { page, limit, total, hasNextPage: offset + limit < total, fromCache: false },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---- POST /api/posts/:id/like ----
router.post(
  '/:id/like',
  validate(uuidSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await query('UPDATE posts SET likes = likes + 1 WHERE id = $1', [id]);
      const post = await recalculateSinglePost(id);
      if (!post) { res.status(404).json({ error: 'Post not found', code: 'NOT_FOUND' }); return; }
      await invalidateCache();
      res.json({ id: post.id, likes: post.likes, views: post.views, shares: post.shares, score: post.score, trending: post.trending });
    } catch (err) {
      next(err);
    }
  }
);

// ---- POST /api/posts/:id/view — rate limited by Redis TTL ----
router.post(
  '/:id/view',
  viewLimiter,
  validate(uuidSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const ip = req.ip ?? 'unknown';
      const dedupeKey = `view:${ip}:${id}`;

      // SET NX with 60s TTL — only count once per IP per post per minute
      let dedupOk = true;
      try {
        const set = await redis.set(dedupeKey, '1', 'EX', 60, 'NX');
        if (set === null) { dedupOk = false; }
      } catch {
        // Redis down → allow the view
      }

      if (dedupOk) {
        await query('UPDATE posts SET views = views + 1 WHERE id = $1', [id]);
        const post = await recalculateSinglePost(id);
        if (!post) { res.status(404).json({ error: 'Post not found', code: 'NOT_FOUND' }); return; }
        await invalidateCache();
        res.json({ id: post.id, likes: post.likes, views: post.views, shares: post.shares, score: post.score, trending: post.trending });
      } else {
        const { rows } = await query<Record<string, unknown>>('SELECT * FROM posts WHERE id = $1', [id]);
        if (rows.length === 0) { res.status(404).json({ error: 'Post not found', code: 'NOT_FOUND' }); return; }
        res.json(mapDbRow(rows[0]));
      }
    } catch (err) {
      next(err);
    }
  }
);

// ---- POST /api/posts/:id/share ----
router.post(
  '/:id/share',
  validate(uuidSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await query('UPDATE posts SET shares = shares + 1 WHERE id = $1', [id]);
      const post = await recalculateSinglePost(id);
      if (!post) { res.status(404).json({ error: 'Post not found', code: 'NOT_FOUND' }); return; }
      await invalidateCache();
      res.json({ id: post.id, likes: post.likes, views: post.views, shares: post.shares, score: post.score, trending: post.trending });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
