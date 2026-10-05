/**
 * Fills the database with sample data so the app has something to show.
 * Run: npm run seed   (WARNING: clears existing buses, routes, trips and bookings)
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Bus } from '../models/Bus';
import { Route } from '../models/Route';
import { Trip } from '../models/Trip';
import { Booking } from '../models/Booking';

const DAYS_AHEAD = 14;

async function seed() {
  await connectDB();
  await Promise.all([Booking.deleteMany({}), Trip.deleteMany({}), Bus.deleteMany({}), Route.deleteMany({})]);

  let operator = await User.findOne({ email: 'operator@seatlanka.dev' });
  if (!operator) {
    operator = await User.create({
      name: 'Demo Operator',
      email: 'operator@seatlanka.dev',
      password: 'operator123',
      role: 'operator',
    });
  }

  const buses = await Bus.insertMany([
    { operator: operator._id, operatorName: 'Lanka Express', busNumber: 'NB-4521', type: 'Luxury AC', rows: 10, layout: '2+2', amenities: ['Wi-Fi', 'Charging ports'] },
    { operator: operator._id, operatorName: 'Hill Line Travels', busNumber: 'NC-1188', type: 'Semi-luxury', rows: 10, layout: '2+2', amenities: ['Charging ports'] },
    { operator: operator._id, operatorName: 'Kandy Comfort', busNumber: 'NB-7730', type: 'Luxury AC', rows: 10, layout: '2+2', amenities: ['Wi-Fi', 'Reclining seats'] },
  ]);

  const routes = await Route.insertMany([
    { from: 'Colombo', to: 'Kandy', distanceKm: 115 },
    { from: 'Colombo', to: 'Galle', distanceKm: 120 },
    { from: 'Colombo', to: 'Jaffna', distanceKm: 395 },
    { from: 'Kandy', to: 'Ella', distanceKm: 140 },
  ]);

  // [hour, minute, durationMinutes, busIndex, price]
  const timetable: Array<[number, number, number, number, number]> = [
    [6, 0, 185, 0, 1250],
    [7, 30, 200, 1, 950],
    [9, 15, 185, 2, 1300],
    [13, 45, 205, 1, 900],
  ];

  const trips = [];
  for (let d = 0; d < DAYS_AHEAD; d++) {
    const day = new Date();
    day.setDate(day.getDate() + d);
    const ymd = day.toISOString().slice(0, 10);
    for (const route of routes) {
      for (const [h, m, dur, busIdx, price] of timetable) {
        const dep = new Date(`${ymd}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+05:30`);
        trips.push({
          bus: buses[busIdx]._id,
          route: route._id,
          departureTime: dep,
          arrivalTime: new Date(dep.getTime() + dur * 60 * 1000),
          price,
        });
      }
    }
  }
  await Trip.insertMany(trips);

  console.log(`Seeded ${buses.length} buses, ${routes.length} routes, ${trips.length} trips.`);
  console.log('Operator login: operator@seatlanka.dev / operator123');
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
