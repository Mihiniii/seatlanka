import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import tripRoutes from './routes/tripRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import { notFound, errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';

export const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// PayHere's server-to-server callback must never be throttled, or paid bookings stay unconfirmed.
app.use('/api', (req, res, next) =>
  req.path === '/payments/notify' ? next() : apiLimiter(req, res, next),
);

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);
