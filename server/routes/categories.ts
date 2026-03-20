import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { getCategoryCountsFromCache, setCategoryCount } from '../services/cacheLayer';

const router = Router();

const CATEGORIES = ['Tech', 'Sports', 'Gaming', 'Music', 'Science', 'Culture'] as const;

router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Try cache first
      const cached = await getCategoryCountsFromCache();
      if (cached) {
        const result = CATEGORIES.map((name) => ({ name, count: cached[name] ?? 0 }));
        res.json(result);
        return;
      }

      // DB query
      const { rows } = await query<{ category: string; count: string }>(
        'SELECT category, COUNT(*)::int AS count FROM posts GROUP BY category'
      );

      const countMap: Record<string, number> = {};
      for (const row of rows) { countMap[row.category] = Number(row.count); }

      // Prime cache
      for (const cat of CATEGORIES) {
        await setCategoryCount(cat, countMap[cat] ?? 0);
      }

      const result = CATEGORIES.map((name) => ({ name, count: countMap[name] ?? 0 }));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
