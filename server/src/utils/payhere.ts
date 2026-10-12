import crypto from 'crypto';
import { env } from '../config/env';

export const PAYHERE_CURRENCY = 'LKR';

/** PayHere status_code for a successful payment (0 pending, -1 cancelled, -2 failed, -3 charged back) */
export const PAYHERE_SUCCESS = '2';

function md5Upper(value: string): string {
  return crypto.createHash('md5').update(value).digest('hex').toUpperCase();
}

/** PayHere wants amounts with exactly two decimals and no thousands separator, e.g. 2500.00 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export function checkoutUrl(): string {
  return env.payhere.sandbox ? 'https://sandbox.payhere.lk/pay/checkout' : 'https://www.payhere.lk/pay/checkout';
}

/**
 * Hash sent with the checkout form. Same formula as PayHere's PHP sample:
 * strtoupper(md5(merchant_id . order_id . amount . currency . strtoupper(md5(merchant_secret))))
 */
export function checkoutHash(orderId: string, amount: number): string {
  const { merchantId, merchantSecret } = env.payhere;
  return md5Upper(merchantId + orderId + formatAmount(amount) + PAYHERE_CURRENCY + md5Upper(merchantSecret));
}

/** True if the md5sig on a notify_url callback really came from PayHere. */
export function isValidNotifySignature(n: {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
}): boolean {
  const expected = md5Upper(
    n.merchant_id + n.order_id + n.payhere_amount + n.payhere_currency + n.status_code + md5Upper(env.payhere.merchantSecret),
  );
  const a = Buffer.from(expected);
  const b = Buffer.from(n.md5sig.toUpperCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
