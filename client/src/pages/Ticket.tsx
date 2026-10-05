import { Link, Navigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CheckIcon, ChevronLeftIcon } from '../components/Icons';
import type { TicketState } from '../types';
import { cityCode, formatDate, formatLKR, formatTime } from '../utils/format';

export default function Ticket() {
  const ticket = useLocation().state as TicketState | null;
  if (!ticket) return <Navigate to="/" replace />;

  const { trip, seats, ticketCode, passengerName } = ticket;
  const details = [
    ['Date', formatDate(trip.departureTime)],
    ['Seat', seats.join(', ')],
    ['Bus', trip.bus.busNumber],
    ['Passenger', passengerName],
    ['Paid', formatLKR(trip.price * seats.length)],
    ['Type', trip.bus.type],
  ];

  return (
    <div className="flex min-h-screen justify-center bg-navy">
      <div className="flex w-full max-w-[420px] flex-col pb-8">
        <div className="flex items-center justify-between px-4 pt-5 pb-3 text-white">
          <Link to="/" aria-label="Back to home" className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
            <ChevronLeftIcon />
          </Link>
          <span className="text-[17px] font-extrabold">Your ticket</span>
          <span className="w-11" />
        </div>

        <div className="mx-4 mt-1 mb-4 flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-sm font-bold text-white">
          <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-[#3DBE7E] text-ink">
            <CheckIcon width={14} height={14} />
          </span>
          Booking confirmed
        </div>

        <div className="mx-4 flex flex-col overflow-hidden rounded-3xl bg-white">
          <div className="px-[22px] pt-[22px] pb-[18px]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-extrabold">{trip.bus.operatorName}</span>
              <span className="rounded-full bg-sky px-2.5 py-1 text-xs font-extrabold text-navy">{trip.bus.type}</span>
            </div>
            <div className="mt-[18px] flex items-center justify-between">
              <div>
                <div className="font-display text-[40px] leading-none font-extrabold tracking-tight">{cityCode(trip.route.from)}</div>
                <div className="mt-1 text-[13px] font-semibold text-muted">
                  {trip.route.from} · {formatTime(trip.departureTime)}
                </div>
              </div>
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="#F2A541" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12h34" />
                <path d="M30 6l6 6-6 6" />
              </svg>
              <div className="text-right">
                <div className="font-display text-[40px] leading-none font-extrabold tracking-tight">{cityCode(trip.route.to)}</div>
                <div className="mt-1 text-[13px] font-semibold text-muted">
                  {trip.route.to} · {formatTime(trip.arrivalTime)}
                </div>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-3">
              {details.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-extrabold tracking-[0.06em] text-muted uppercase">{k}</dt>
                  <dd className="mt-1 text-[15px] font-extrabold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative flex h-6 items-center">
            <span className="absolute -left-3 h-6 w-6 rounded-full bg-navy" />
            <span className="mx-5 flex-1 border-t-2 border-dashed border-field" />
            <span className="absolute -right-3 h-6 w-6 rounded-full bg-navy" />
          </div>

          <div className="flex flex-col items-center gap-2.5 px-[22px] pt-3.5 pb-[22px]">
            <div className="rounded-xl border border-line p-2">
              <QRCodeSVG value={ticketCode} size={168} fgColor="#0F1B2D" aria-label="Ticket QR code" />
            </div>
            <div className="text-[13px] font-bold tracking-[0.08em] text-muted">{ticketCode}</div>
          </div>
        </div>

        <div className="mx-4 mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[52px] flex-1 cursor-pointer rounded-2xl bg-amber text-[15px] font-extrabold text-ink"
          >
            Print / Save PDF
          </button>
          <Link
            to="/"
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-2xl border-[1.5px] border-white/40 text-[15px] font-extrabold text-white no-underline"
          >
            Book another
          </Link>
        </div>
      </div>
    </div>
  );
}
