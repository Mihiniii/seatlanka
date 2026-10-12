import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name} (see .env.example)`);
  }
  return value;
}

const port = Number(process.env.PORT ?? 5000);
const merchantId = process.env.PAYHERE_MERCHANT_ID ?? '';
const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET ?? '';

export const env = {
  port,
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  seatHoldMinutes: Number(process.env.SEAT_HOLD_MINUTES ?? 5),
  payhere: {
    // Without both values the app runs in demo mode: bookings confirm without a payment.
    enabled: Boolean(merchantId && merchantSecret),
    merchantId,
    merchantSecret,
    sandbox: process.env.PAYHERE_SANDBOX !== 'false',
    notifyUrl: process.env.PAYHERE_NOTIFY_URL ?? `http://localhost:${port}/api/payments/notify`,
  },
};
