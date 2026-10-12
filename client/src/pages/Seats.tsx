import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SeatMap from '../components/SeatMap';
import BookingSteps from '../components/BookingSteps';
import { ChevronLeftIcon, TimerIcon } from '../components/Icons';
import { api, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { PaymentState, Seat, Trip } from '../types';
import { formatDate, formatLKR, formatTime } from '../utils/format';

const MAX_SEATS = 4;

export default function Seats() {
  const { tripId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function loadSeats() {
    return api
      .seatMap(tripId)
      .then((r) => {
        setTrip(r.trip);
        setSeats(r.seats);
      })
      .catch((e: Error) => setError(e.message));
  }

  useEffect(() => {
    loadSeats();
    // TODO (Week 4): replace this polling with Socket.IO live updates
    const id = setInterval(loadSeats, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  function toggle(id: string) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((s) => s !== id) : cur.length < MAX_SEATS ? [...cur, id] : cur));
  }

  async function continueToPayment() {
    if (!user) {
      navigate('/login', { state: { from: `/trips/${tripId}/seats` } });
      return;
    }
    if (!trip || selected.length === 0) return;
    setBusy(true);
    setError('');
    try {
      const hold = await api.holdSeats(tripId, selected);
      const payment: PaymentState = {
        trip,
        seats: selected,
        bookingIds: hold.bookingIds,
        holdExpiresAt: hold.holdExpiresAt,
      };
      navigate('/payment', { state: payment });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong');
      setSelected([]);
      loadSeats();
    } finally {
      setBusy(false);
    }
  }

  const total = trip ? trip.price * selected.length : 0;

  return (
    <div className="min-h-screen">
      <Navbar>
        <BookingSteps active={1} />
      </Navbar>

      <div className="mx-auto max-w-[1200px] px-6 pt-7 pb-16">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-[15px] font-bold text-navy"
        >
          <ChevronLeftIcon width={18} height={18} /> Back to buses
        </button>
        <h1 className="mt-1 mb-6 font-display text-[34px] font-bold tracking-tight">Choose your seats</h1>

        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-[#FDECEA] p-4 font-semibold text-[#9B1C1C]">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-start gap-7">
          <section className="min-w-0 flex-[999_1_520px] rounded-[22px] border border-line bg-white p-7">
            {trip ? (
              <SeatMap seats={seats} layout={trip.bus.layout} selected={selected} onToggle={toggle} />
            ) : (
              <p className="text-center text-muted">Loading seat map…</p>
            )}
          </section>

          <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
            {trip && (
              <div className="rounded-[22px] border border-line bg-white p-6">
                <div className="text-[17px] font-extrabold">
                  {trip.bus.operatorName} · {trip.bus.type}
                </div>
                <div className="mt-1 text-sm font-semibold text-muted">
                  {trip.bus.busNumber} · {formatDate(trip.departureTime)}
                </div>
                <div className="mt-[18px] flex items-center gap-3.5">
                  <div>
                    <div className="font-display text-2xl font-bold">{formatTime(trip.departureTime)}</div>
                    <div className="text-[13px] font-semibold text-muted">{trip.route.from}</div>
                  </div>
                  <span className="h-0.5 flex-1 bg-[repeating-linear-gradient(90deg,#B8C3D1_0_6px,transparent_6px_10px)]" />
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold">{formatTime(trip.arrivalTime)}</div>
                    <div className="text-[13px] font-semibold text-muted">{trip.route.to}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 rounded-[22px] border border-line bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold">Selected seats</h2>
                <span className="text-[13px] font-bold text-muted">max {MAX_SEATS}</span>
              </div>
              {selected.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selected.map((s) => (
                    <span key={s} className="rounded-[10px] bg-navy px-3.5 py-2 text-[15px] font-extrabold text-white">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[15px] text-muted">Tap a seat on the map to select it.</p>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <span className="text-[15px] font-semibold text-muted">
                  {selected.length} seat{selected.length === 1 ? '' : 's'} × {trip ? formatLKR(trip.price) : '—'}
                </span>
                <span className="font-display text-[28px] font-extrabold text-navy">{formatLKR(total)}</span>
              </div>
              {selected.length > 0 && (
                <div className="flex items-center gap-2.5 rounded-xl bg-amber-soft px-3.5 py-3 text-sm font-bold text-[#7A4A06]">
                  <TimerIcon width={18} height={18} /> Seats are held for 5 minutes once you continue
                </div>
              )}
              <button
                type="button"
                disabled={selected.length === 0 || busy}
                onClick={continueToPayment}
                className="cursor-pointer rounded-xl bg-amber px-5 py-4 text-[17px] font-extrabold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Holding seats…' : user ? 'Continue to payment' : 'Sign in to continue'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
