import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Invalid input', errors: err.flatten().fieldErrors });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ message: 'Already exists or already taken' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
}
