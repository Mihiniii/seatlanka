import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import tripRoutes from './routes/tripRoutes';
import bookingRoutes from './routes/bookingRoutes';
import { notFound, errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);

app.use(notFound);
app.use(errorHandler);
