import { Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { Booking } from '../models/Booking';
import { Trip } from '../models/Trip';
import { User } from '../models/User';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { newTicketCode } from '../utils/ticketCode';
import {
  PAYHERE_CURRENCY,
  PAYHERE_SUCCESS,
  checkoutHash,
  checkoutUrl,
  formatAmount,
  isValidNotifySignature,
} from '../utils/payhere';

/** GET /api/payments/config — tells the client whether to send the passenger to PayHere */
export function paymentConfig(_req: Request, res: Response) {
  res.json({ provider: env.payhere.enabled ? 'payhere' : 'demo', sandbox: env.payhere.sandbox });
}

/**
 * POST /api/payments/checkout — builds the PayHere checkout form for the user's held seats.
 * The amount is worked out here from the trip price, never taken from the browser.
 */
export async function createCheckout(req: Request, res: Response) {
  if (!env.payhere.enabled) throw new AppError(503, 'Online payment is not set up');
  const { bookingIds } = z.object({ bookingIds: z.array(z.string()).min(1).max(4) }).parse(req.body);
  const ids = [...new Set(bookingIds)];

  const bookings = await Booking.find({
    _id: { $in: ids },
    user: req.user!.id,
    status: 'held',
    holdExpiresAt: { $gt: new Date() },
  });
  if (bookings.length !== ids.length) {
    throw new AppError(410, 'Your seat hold has expired. Please select your seats again.');
  }
  if (new Set(bookings.map((b) => String(b.trip))).size !== 1) {
    throw new AppError(400, 'All seats must be on the same trip');
  }

  const [trip, user] = await Promise.all([
    Trip.findById(bookings[0].trip).populate<{ route: { from: string; to: string } }>('route'),
    User.findById(req.user!.id),
  ]);
  if (!trip || !user) throw new AppError(404, 'Trip not found');

  const amount = trip.price * bookings.length;

  // Reuse the order if the passenger comes back to pay for the same seats again.
  const existing = bookings[0].orderId;
  const orderId =
    existing && bookings.every((b) => b.orderId === existing)
      ? existing
      : `SLK${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  await Booking.updateMany({ _id: { $in: ids } }, { $set: { orderId } });

  const [firstName, ...rest] = user.name.split(' ');
  const seats = bookings.map((b) => b.seat).sort();

  res.json({
    actionUrl: checkoutUrl(),
    fields: {
      merchant_id: env.payhere.merchantId,
      return_url: `${env.clientUrl}/payment/return/${orderId}`,
      cancel_url: `${env.clientUrl}/payment/cancel/${orderId}`,
      notify_url: env.payhere.notifyUrl,
      order_id: orderId,
      items: `${trip.route.from} to ${trip.route.to} - Seat${seats.length === 1 ? '' : 's'} ${seats.join(', ')}`,
      currency: PAYHERE_CURRENCY,
      amount: formatAmount(amount),
      first_name: firstName,
      last_name: rest.join(' ') || firstName,
      email: user.email,
      // PayHere requires these, but SeatLanka does not collect them from passengers yet.
      phone: '0770000000',
      address: 'N/A',
      city: trip.route.from,
      country: 'Sri Lanka',
      hash: checkoutHash(orderId, amount),
    },
  });
}

const notifySchema = z.object({
  merchant_id: z.string(),
  order_id: z.string(),
  payment_id: z.string().optional(),
  payhere_amount: z.string(),
  payhere_currency: z.string(),
  status_code: z.string(),
  md5sig: z.string(),
});

/**
 * POST /api/payments/notify — PayHere calls this server-to-server after a payment.
 * It is the only thing that confirms a paid booking, so the signature and amount are both checked.
 */
export async function payhereNotify(req: Request, res: Response) {
  if (!env.payhere.enabled) throw new AppError(503, 'Online payment is not set up');
  const n = notifySchema.parse(req.body);
  if (n.merchant_id !== env.payhere.merchantId || !isValidNotifySignature(n)) {
    throw new AppError(400, 'Invalid signature');
  }

  if (n.status_code !== PAYHERE_SUCCESS) {
    // Pending, cancelled or failed: the hold simply runs out if the passenger does not try again.
    res.send('OK');
    return;
  }

  const bookings = await Booking.find({ orderId: n.order_id });
  if (bookings.length === 0) throw new AppError(404, 'Order not found');
  const trip = await Trip.findById(bookings[0].trip);
  if (!trip) throw new AppError(404, 'Trip not found');

  const expected = formatAmount(trip.price * bookings.length);
  if (n.payhere_currency !== PAYHERE_CURRENCY || formatAmount(Number(n.payhere_amount)) !== expected) {
    console.error(`PayHere order ${n.order_id}: paid ${n.payhere_amount} ${n.payhere_currency}, expected ${expected}`);
    throw new AppError(400, 'Amount does not match the order');
  }

  // PayHere may send the same notification more than once.
  if (bookings.every((b) => b.status === 'confirmed')) {
    res.send('OK');
    return;
  }
  if (!bookings.every((b) => b.status === 'held')) {
    // The hold ran out and the seats were released before the payment arrived.
    console.error(`PayHere order ${n.order_id} (payment ${n.payment_id}) was paid but its seats are gone. Refund needed.`);
    res.send('OK');
    return;
  }

  await Booking.updateMany(
    { orderId: n.order_id, status: 'held' },
    { $set: { status: 'confirmed', ticketCode: newTicketCode(), paymentId: n.payment_id }, $unset: { holdExpiresAt: 1 } },
  );
  res.send('OK');
}

/** GET /api/payments/orders/:orderId — the client polls this after coming back from PayHere */
export async function orderStatus(req: Request, res: Response) {
  const bookings = await Booking.find({ orderId: req.params.orderId, user: req.user!.id }).lean();
  if (bookings.length === 0) throw new AppError(404, 'Order not found');
  const trip = await Trip.findById(bookings[0].trip).populate('bus').populate('route').lean();

  const holdExpiresAt = bookings[0].holdExpiresAt;
  let status: 'confirmed' | 'pending' | 'expired';
  if (bookings.every((b) => b.status === 'confirmed')) status = 'confirmed';
  else if (bookings.every((b) => b.status === 'held') && holdExpiresAt && holdExpiresAt > new Date()) status = 'pending';
  else status = 'expired';

  res.json({
    status,
    trip,
    seats: bookings.map((b) => b.seat).sort(),
    bookingIds: bookings.map((b) => String(b._id)),
    holdExpiresAt,
    ticketCode: bookings[0].ticketCode,
  });
}
