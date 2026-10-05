import { Link } from 'react-router-dom';
import type { Trip } from '../types';
import { formatDuration, formatLKR, formatTime } from '../utils/format';

export default function TripCard({ trip }: { trip: Trip }) {
  const seatsLeft = trip.seatsLeft ?? 0;
  const low = seatsLeft <= 5;

  return (
    <article className="flex flex-wrap items-center gap-5 rounded-[18px] border border-line bg-white px-6 py-[22px]">
      <div className="min-w-0 flex-[1_1_180px]">
        <div className="text-[17px] font-extrabold">{trip.bus.operatorName}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-sky px-2.5 py-1 text-xs font-extrabold text-navy">{trip.bus.type}</span>
          <span className="rounded-full bg-ground px-2.5 py-1 text-xs font-bold text-muted">
            {trip.bus.busNumber} · {trip.bus.layout}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-[2_1_280px] items-center gap-3.5">
        <div>
          <div className="font-display text-[26px] font-bold">{formatTime(trip.departureTime)}</div>
          <div className="text-[13px] font-semibold text-muted">{trip.route.from}</div>
        </div>
        <div className="flex min-w-20 flex-1 flex-col items-center gap-1">
          <span className="text-xs font-bold text-muted">{formatDuration(trip.departureTime, trip.arrivalTime)}</span>
          <span className="h-0.5 w-full bg-[repeating-linear-gradient(90deg,#B8C3D1_0_6px,transparent_6px_10px)]" />
        </div>
        <div>
          <div className="font-display text-[26px] font-bold">{formatTime(trip.arrivalTime)}</div>
          <div className="text-[13px] font-semibold text-muted">{trip.route.to}</div>
        </div>
      </div>

      <div className="flex flex-[1_1_200px] flex-wrap items-center justify-end gap-[18px]">
        <div className="text-right">
          <div className="font-display text-2xl font-extrabold text-navy">{formatLKR(trip.price)}</div>
          <div className={`text-[13px] font-bold ${low ? 'text-[#B4410E]' : 'text-[#1F7A4D]'}`}>
            {seatsLeft} seats left{low && seatsLeft > 0 ? ' — hurry' : ''}
          </div>
        </div>
        {seatsLeft > 0 ? (
          <Link
            to={`/trips/${trip._id}/seats`}
            className="rounded-xl bg-amber px-5 py-3.5 text-[15px] font-extrabold text-ink no-underline"
          >
            Select seats
          </Link>
        ) : (
          <span className="rounded-xl bg-field px-5 py-3.5 text-[15px] font-extrabold text-muted">Sold out</span>
        )}
      </div>
    </article>
  );
}
