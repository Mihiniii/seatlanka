import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { TicketState, Trip } from '../types';
import { formatDate, formatLKR, formatTime } from '../utils/format';

interface Ticket {
  ticketCode: string;
  trip: Trip;
  seats: string[];
}

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    api
      .myBookings()
      .then((r) => {
        // Bookings are stored one per seat; seats bought together share a ticket code.
        const byCode = new Map<string, Ticket>();
        for (const b of r.bookings) {
          if (b.status !== 'confirmed' || !b.trip || !b.ticketCode) continue;
          const t = byCode.get(b.ticketCode);
          if (t) t.seats.push(b.seat);
          else byCode.set(b.ticketCode, { ticketCode: b.ticketCode, trip: b.trip, seats: [b.seat] });
        }
        setTickets([...byCode.values()]);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const time = (t: Ticket) => new Date(t.trip.departureTime).getTime();
    return {
      upcoming: tickets.filter((t) => time(t) >= now).sort((a, b) => time(a) - time(b)),
      past: tickets.filter((t) => time(t) < now).sort((a, b) => time(b) - time(a)),
    };
  }, [tickets]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: '/bookings' }} />;

  function card(t: Ticket, isPast: boolean) {
    const state: TicketState = { ticketCode: t.ticketCode, trip: t.trip, seats: t.seats, passengerName: user!.name };
    const year = new Date(t.trip.departureTime).toLocaleDateString('en-GB', { year: 'numeric', timeZone: 'Asia/Colombo' });
    return (
      <article
        key={t.ticketCode}
        className={`flex flex-wrap items-center gap-5 rounded-[18px] border border-line bg-white px-6 py-[22px] ${isPast ? 'opacity-80' : ''}`}
      >
        <div className="min-w-0 flex-[2_1_260px]">
          <div className="font-display text-[22px] font-bold">
            {t.trip.route.from} → {t.trip.route.to}
          </div>
          <div className="mt-1 text-[15px] font-semibold text-muted">
            {formatDate(t.trip.departureTime)} {year} · {formatTime(t.trip.departureTime)} – {formatTime(t.trip.arrivalTime)}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-sky px-2.5 py-1 text-xs font-extrabold text-navy">{t.trip.bus.type}</span>
            <span className="rounded-full bg-ground px-2.5 py-1 text-xs font-bold text-muted">
              {t.trip.bus.operatorName} · {t.trip.bus.busNumber}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-[1_1_140px]">
          <div className="text-[11px] font-extrabold tracking-[0.06em] text-muted uppercase">
            Seat{t.seats.length === 1 ? '' : 's'}
          </div>
          <div className="mt-1 text-[15px] font-extrabold">{t.seats.join(', ')}</div>
          <div className="mt-2 text-[13px] font-bold tracking-[0.08em] text-muted">{t.ticketCode}</div>
        </div>

        <div className="flex flex-[1_1_200px] flex-wrap items-center justify-end gap-[18px]">
          <div className="font-display text-2xl font-extrabold text-navy">{formatLKR(t.trip.price * t.seats.length)}</div>
          <Link
            to="/ticket"
            state={state}
            className={`rounded-xl px-5 py-3.5 text-[15px] font-extrabold no-underline ${
              isPast ? 'border-[1.5px] border-field bg-white text-ink' : 'bg-amber text-ink'
            }`}
          >
            View ticket
          </Link>
        </div>
      </article>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-[1000px] flex-col gap-4 px-6 pt-8 pb-16">
        <h1 className="font-display text-[30px] font-bold tracking-tight">My bookings</h1>

        {error && (
          <p role="alert" className="rounded-xl bg-[#FDECEA] p-4 font-semibold text-[#9B1C1C]">
            {error}
          </p>
        )}
        {loading && !error && <p className="text-muted">Loading your bookings…</p>}
        {!loading && !error && tickets.length === 0 && (
          <div className="rounded-[18px] border border-line bg-white p-8 text-center text-muted">
            <p>You have no bookings yet.</p>
            <Link to="/" className="mt-4 inline-block rounded-xl bg-amber px-5 py-3.5 text-[15px] font-extrabold text-ink no-underline">
              Find a bus
            </Link>
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <h2 className="mt-2 text-[13px] font-bold uppercase tracking-[0.06em] text-muted">Upcoming</h2>
            {upcoming.map((t) => card(t, false))}
          </>
        )}
        {past.length > 0 && (
          <>
            <h2 className="mt-4 text-[13px] font-bold uppercase tracking-[0.06em] text-muted">Past</h2>
            {past.map((t) => card(t, true))}
          </>
        )}
      </main>
    </div>
  );
}
