import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BookingSteps from '../components/BookingSteps';
import { ChevronLeftIcon, TimerIcon } from '../components/Icons';
import { api, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { PaymentConfig, PaymentState, TicketState } from '../types';
import { formatCountdown, formatDate, formatLKR, formatTime } from '../utils/format';

/** Milliseconds left until the hold runs out, ticking once a second */
function useTimeLeft(expiresAt: string) {
  const [left, setLeft] = useState(() => new Date(expiresAt).getTime() - Date.now());

  useEffect(() => {
    const tick = () => setLeft(new Date(expiresAt).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return Math.max(0, left);
}

/** Sends the browser to PayHere with the signed checkout fields */
function postForm(action: string, fields: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export default function Payment() {
  const payment = useLocation().state as PaymentState | null;
  const { user, loading } = useAuth();
  // After a page refresh the user is still being loaded, so wait before deciding.
  if (loading) return null;
  if (!payment || !user) return <Navigate to="/" replace />
  return <PaymentView payment={payment} passengerName={user.name} />;
}

function PaymentView({ payment, passengerName }: { payment: PaymentState; passengerName: string }) {
  const { trip, seats, bookingIds, holdExpiresAt } = payment;
  const navigate = useNavigate();
  const timeLeft = useTimeLeft(holdExpiresAt);

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [holdLost, setHoldLost] = useState(false);
  const [config, setConfig] = useState<PaymentConfig | null>(null);

  useEffect(() => {
    api
      .paymentConfig()
      .then(setConfig)
      .catch((e: Error) => setError(e.message));
  }, []);

  const expired = holdLost || timeLeft === 0;
  const urgent = timeLeft <= 60000;
  const seatsPath = `/trips/${trip._id}/seats`;
  const total = trip.price * seats.length;

  async function pay() {
    setBusy(true);
    setError('');
    try {
      if (config?.provider === 'payhere') {
        // The server works out the amount and signs the form; the browser only posts it on to PayHere.
        const { actionUrl, fields } = await api.checkout(bookingIds);
        postForm(actionUrl, fields);
        return;
      }
      const { ticketCode } = await api.confirm(bookingIds);
      const ticket: TicketState = { ticketCode, trip, seats, passengerName };
      navigate('/ticket', { state: ticket, replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.status === 410) setHoldLost(true);
      else setError(e instanceof ApiError ? e.message : 'Something went wrong');
      setBusy(false);
    }
  }

  async function changeSeats() {
    setBusy(true);
    // Free the held seats straight away instead of waiting for the hold to run out.
    await Promise.allSettled(bookingIds.map((id) => api.cancelBooking(id)));
    navigate(seatsPath, { replace: true });
  }

  return (
    <div className="min-h-screen">
      <Navbar>
        <BookingSteps active={2} />
      </Navbar>

      <div className="mx-auto max-w-[1200px] px-6 pt-7 pb-16">
        <button
          type="button"
          disabled={busy}
          onClick={expired ? () => navigate(seatsPath, { replace: true }) : changeSeats}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-[15px] font-bold text-navy disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeftIcon width={18} height={18} /> Change seats
        </button>
        <h1 className="mt-1 mb-6 font-display text-[34px] font-bold tracking-tight">Payment</h1>

        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-[#FDECEA] p-4 font-semibold text-[#9B1C1C]">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-start gap-7">
          <section className="flex min-w-0 flex-[999_1_520px] flex-col gap-5 rounded-[22px] border border-line bg-white p-7">
            {expired ? (
              <>
                <div role="alert" className="rounded-xl bg-[#FDECEA] p-4 font-semibold text-[#9B1C1C]">
                  Your seat hold has expired. Please select your seats again.
                </div>
                <button
                  type="button"
                  onClick={() => navigate(seatsPath, { replace: true })}
                  className="cursor-pointer self-start rounded-xl bg-amber px-5 py-4 text-[17px] font-extrabold text-ink"
                >
                  Choose seats again
                </button>
              </>
            ) : (
              <>
                <div
                  className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 font-bold ${
                    urgent ? 'bg-[#FDECEA] text-[#9B1C1C]' : 'bg-amber-soft text-[#7A4A06]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 text-[15px]">
                    <TimerIcon width={20} height={20} /> Your seats are held for
                  </span>
                  <span
                    role="timer"
                    aria-label="Time left to pay"
                    className="font-display text-[28px] leading-none font-extrabold tabular-nums"
                  >
                    {formatCountdown(timeLeft)}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-extrabold">Payment method</h2>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                    {config?.provider === 'payhere'
                      ? `You will pay securely on PayHere${
                          config.sandbox ? ' (sandbox — test cards only, nothing is charged)' : ''
                        }. Your QR ticket is issued as soon as the payment goes through.`
                      : 'Demo payment — online payment is not connected yet, so no card details are needed and nothing is charged. Paying confirms your seats and issues your QR ticket.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={busy || !config}
                  onClick={pay}
                  className="cursor-pointer rounded-xl bg-amber px-5 py-4 text-[17px] font-extrabold text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? 'Please wait…' : `Pay ${formatLKR(total)}`}
                </button>
              </>
            )}
          </section>

          <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
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

            <div className="flex flex-col gap-4 rounded-[22px] border border-line bg-white p-6">
              <h2 className="text-lg font-extrabold">Your seats</h2>
              <div className="flex flex-wrap gap-2">
                {seats.map((s) => (
                  <span key={s} className="rounded-[10px] bg-navy px-3.5 py-2 text-[15px] font-extrabold text-white">
                    {s}
                  </span>
                ))}
              </div>
              <div className="text-[15px] font-semibold text-muted">Passenger · {passengerName}</div>
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <span className="text-[15px] font-semibold text-muted">
                  {seats.length} seat{seats.length === 1 ? '' : 's'} × {formatLKR(trip.price)}
                </span>
                <span className="font-display text-[28px] font-extrabold text-navy">{formatLKR(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
