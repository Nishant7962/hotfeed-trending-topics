import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface AppError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors → 400
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  // PostgreSQL unique violation → 409
  if ((err as unknown as Record<string, unknown>)['code'] === '23505') {
    res.status(409).json({ error: 'Resource already exists', code: 'CONFLICT' });
    return;
  }

  const status = err.status ?? 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(status).json({
    error: isProd && status === 500 ? 'Internal server error' : (err.message || 'Internal server error'),
    code: err.code ?? 'INTERNAL_ERROR',
  });
}
