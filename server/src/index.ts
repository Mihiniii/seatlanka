import { app } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`SeatLanka API running on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
