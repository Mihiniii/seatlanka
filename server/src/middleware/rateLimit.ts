import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function limiter(limit: number, message: string) {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Go through errorHandler so the response has the same shape as every other error.
    handler: (_req, _res, next) => next(new AppError(429, message)),
  });
}

/** General cap for the whole API. */
export const apiLimiter = limiter(300, 'Too many requests, please try again later');

/** Tighter cap for login and register, to slow down password guessing. */
export const authLimiter = limiter(10, 'Too many attempts, please try again in 15 minutes');
