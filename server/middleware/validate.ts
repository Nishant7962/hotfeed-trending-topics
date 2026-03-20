import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type Target = 'query' | 'body' | 'params';

export function validate(schema: ZodSchema, target: Target = 'query') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = target === 'query' ? req.query : target === 'body' ? req.body : req.params;
      const parsed = schema.parse(data);
      if (target === 'query') req.query = parsed;
      else if (target === 'body') req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      next(err);
    }
  };
}
