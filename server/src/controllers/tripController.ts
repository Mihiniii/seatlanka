import { Request, Response } from 'express';
import { z } from 'zod';
import { Trip } from '../models/Trip';
import { Route } from '../models/Route';
import { Booking } from '../models/Booking';
import { seatIdsFor } from '../models/Bus';
import { AppError } from '../utils/AppError';

const searchSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
});

/** GET /api/trips?from=Colombo&to=Kandy&date=2026-10-10 */
export async function searchTrips(req: Request, res: Response) {
  const { from, to, date } = searchSchema.parse(req.query);
  const route = await Route.findOne({
    from: new RegExp(`^${escapeRegex(from)}`, 'i'),
    to: new RegExp(`^${escapeRegex(to)}`, 'i'),
  });
  if (!route) return res.json({ trips: [] });

  const start = new Date(`${date}T00:00:00+05:30`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const trips = await Trip.find({ route: route._id, departureTime: { $gte: start, $lt: end } })
    .populate('bus')
    .sort({ departureTime: 1 })
    .lean();

  const withSeats = await Promise.all(
    trips.map(async (t) => {
      const bus = t.bus as unknown as { rows: number; layout: string };
      const taken = await activeBookingCount(String(t._id));
      return { ...t, route, seatsLeft: seatIdsFor(bus).length - taken };
    }),
  );
  res.json({ trips: withSeats });
}

/** GET /api/trips/:id/seats — seat map with status for each seat */
export async function getSeatMap(req: Request, res: Response) {
  const trip = await Trip.findById(req.params.id).populate('bus').populate('route').lean();
  if (!trip) throw new AppError(404, 'Trip not found');

  const bus = trip.bus as unknown as { rows: number; layout: string };
  const bookings = await Booking.find({
    trip: trip._id,
    $or: [{ status: 'confirmed' }, { status: 'held', holdExpiresAt: { $gt: new Date() } }],
  }).lean();

  const statusBySeat = new Map(bookings.map((b) => [b.seat, b.status]));
  const seats = seatIdsFor(bus).map((id) => ({
    id,
    status: statusBySeat.get(id) === 'confirmed' ? 'booked' : statusBySeat.get(id) === 'held' ? 'held' : 'available',
  }));

  res.json({ trip, seats });
}

async function activeBookingCount(tripId: string) {
  return Booking.countDocuments({
    trip: tripId,
    $or: [{ status: 'confirmed' }, { status: 'held', holdExpiresAt: { $gt: new Date() } }],
  });
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
