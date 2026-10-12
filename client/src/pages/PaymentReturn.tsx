import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BookingSteps from '../components/BookingSteps';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { OrderStatus, PaymentState, TicketState } from '../types';

const POLL_MS = 2000;
// PayHere's notification usually lands within a few seconds of the redirect back.
const GIVE_UP_MS = 60000;

/** Where PayHere sends the passenger back to: /payment/return/:orderId or /payment/cancel/:orderId */
export default function PaymentReturn({ cancelled = false }: { cancelled?: boolean }) {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState('');
  const [gaveUp, setGaveUp] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true, state: { from: window.location.pathname } });
      return;
    }

    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const started = Date.now();

    async function check() {
      try {
        const o = await api.orderStatus(orderId);
        if (stopped) return;
        if (o.status === 'confirmed' && o.ticketCode) {
          const ticket: TicketState = { ticketCode: o.ticketCode, trip: o.trip, seats: o.seats, passengerName: user!.name };
          navigate('/ticket', { state: ticket, replace: true });
          return;
        }
        setOrder(o);
        if (cancelled || o.status !== 'pending') return;
        if (Date.now() - started > GIVE_UP_MS) setGaveUp(true);
        else timer = setTimeout(check, POLL_MS);
      } catch (e) {
        if (!stopped) setError((e as Error).message);
      }
    }
    check();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [orderId, cancelled, user, loading, navigate]);

  const seatsPath = order ? `/trips/${order.trip._id}/seats` : '/';
  const canRetry = order?.status === 'pending' && order.holdExpiresAt;

  function tryAgain() {
    if (!order?.holdExpiresAt) return;
    const payment: PaymentState = {
      trip: order.trip,
      seats: order.seats,
      bookingIds: order.bookingIds,
      holdExpiresAt: order.holdExpiresAt,
    };
    navigate('/payment', { state: payment, replace: true });
  }

  async function chooseAgain() {
    setBusy(true);
    // Free the held seats straight away instead of waiting for the hold to run out.
    if (order?.status === 'pending') await Promise.allSettled(order.bookingIds.map((id) => api.cancelBooking(id)));
    navigate(seatsPath, { replace: true });
  }

  let title = 'Confirming your payment…';
  let text = 'This usually takes a few seconds. Please keep this page open.';
  if (error) {
    title = 'We could not find this payment';
    text = error;
  } else if (order?.status === 'expired') {
    title = 'Your seat hold has expired';
    text = 'These seats were not booked. If you were charged, please contact support with your order number.';
  } else if (cancelled && order) {
    title = 'Payment cancelled';
    text = 'You have not been charged. Your seats are still held until the timer runs out.';
  } else if (gaveUp) {
    title = 'Still waiting for PayHere';
    text = 'We have not received the payment confirmation yet. Refresh this page in a minute to check again.';
  }

  const primary = 'cursor-pointer rounded-xl bg-amber px-5 py-4 text-[17px] font-extrabold text-ink no-underline disabled:opacity-50';
  const secondary =
    'cursor-pointer rounded-xl border-[1.5px] border-line px-5 py-4 text-[17px] font-extrabold text-navy no-underline disabled:opacity-50';

  return (
    <div className="min-h-screen">
      <Navbar>
        <BookingSteps active={2} />
      </Navbar>

      <div className="mx-auto max-w-[640px] px-6 pt-12 pb-16">
        <section className="flex flex-col gap-4 rounded-[22px] border border-line bg-white p-7" aria-live="polite">
          <h1 className="font-display text-[28px] font-bold tracking-tight">{title}</h1>
          <p className="text-[15px] leading-relaxed text-muted">{text}</p>
          <p className="text-[13px] font-bold tracking-[0.06em] text-muted">Order {orderId}</p>

          <div className="flex flex-wrap gap-3">
            {cancelled && canRetry && (
              <button type="button" disabled={busy} onClick={tryAgain} className={primary}>
                Try payment again
              </button>
            )}
            {order && (cancelled || order.status === 'expired') && (
              <button type="button" disabled={busy} onClick={chooseAgain} className={cancelled && canRetry ? secondary : primary}>
                Choose seats again
              </button>
            )}
            {error && (
              <Link to="/" className={primary}>
                Back to home
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
