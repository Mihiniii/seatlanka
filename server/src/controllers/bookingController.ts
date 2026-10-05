import { Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { Booking } from '../models/Booking';
import { Trip } from '../models/Trip';
import { seatIdsFor } from '../models/Bus';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const holdSchema = z.object({
  tripId: z.string().min(1),
  seats: z.array(z.string()).min(1).max(4),
});

/** Remove holds that have run out so the unique index frees those seats. */
async function releaseExpiredHolds(tripId: string) {
  await Booking.updateMany(
    { trip: tripId, status: 'held', holdExpiresAt: { $lte: new Date() } },
    { $set: { status: 'cancelled' } },
  );
}

/** POST /api/bookings/hold — holds seats for SEAT_HOLD_MINUTES */
export async function holdSeats(req: Request, res: Response) {
  const { tripId, seats } = holdSchema.parse(req.body);
  const trip = await Trip.findById(tripId).populate('bus');
  if (!trip) throw new AppError(404, 'Trip not found');

  const validSeats = new Set(seatIdsFor(trip.bus as unknown as { rows: number; layout: string }));
  const bad = seats.filter((s) => !validSeats.has(s));
  if (bad.length) throw new AppError(400, `Invalid seat(s): ${bad.join(', ')}`);

  await releaseExpiredHolds(tripId);

  const holdExpiresAt = new Date(Date.now() + env.seatHoldMinutes * 60 * 1000);
  const created: string[] = [];
  try {
    for (const seat of seats) {
      // The unique index throws E11000 here if someone else already has the seat.
      const b = await Booking.create({ user: req.user!.id, trip: tripId, seat, status: 'held', holdExpiresAt });
      created.push(String(b._id));
    }
  } catch (err) {
    // Roll back the seats we did get, so the user never ends up with half a booking.
    await Booking.deleteMany({ _id: { $in: created } });
    if ((err as { code?: number }).code === 11000) {
      throw new AppError(409, 'Sorry, one of those seats was just taken. Please pick another.');
    }
    throw err;
  }

  res.status(201).json({ bookingIds: created, holdExpiresAt });
}

/** POST /api/bookings/confirm — turns the user's held seats into a ticket (payment comes later) */
export async function confirmBooking(req: Request, res: Response) {
  const { bookingIds } = z.object({ bookingIds: z.array(z.string()).min(1) }).parse(req.body);
  const ticketCode = `SLK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  const result = await Booking.updateMany(
    { _id: { $in: bookingIds }, user: req.user!.id, status: 'held', holdExpiresAt: { $gt: new Date() } },
    { $set: { status: 'confirmed', ticketCode }, $unset: { holdExpiresAt: 1 } },
  );
  if (result.modifiedCount !== bookingIds.length) {
    throw new AppError(410, 'Your seat hold has expired. Please select your seats again.');
  }
  res.json({ ticketCode });
}

/** GET /api/bookings/mine */
export async function myBookings(req: Request, res: Response) {
  const bookings = await Booking.find({ user: req.user!.id, status: { $ne: 'cancelled' } })
    .populate({ path: 'trip', populate: [{ path: 'bus' }, { path: 'route' }] })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ bookings });
}

/** PATCH /api/bookings/:id/cancel */
export async function cancelBooking(req: Request, res: Response) {
  const booking = await Booking.findOneAndUpdate(
    { _id: req.params.id, user: req.user!.id, status: { $ne: 'cancelled' } },
    { $set: { status: 'cancelled' } },
    { new: true },
  );
  if (!booking) throw new AppError(404, 'Booking not found');
  res.json({ booking });
}
