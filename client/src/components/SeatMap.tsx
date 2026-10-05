import type { Seat } from '../types';
import { WheelIcon } from './Icons';

interface Props {
  seats: Seat[];
  layout: '2+2' | '2+3';
  selected: string[];
  onToggle: (seatId: string) => void;
}

const styles = {
  available: 'bg-white text-navy border-2 border-[#9FB0C4] hover:border-navy cursor-pointer',
  selected: 'bg-navy text-white cursor-pointer',
  held: 'bg-amber text-[#5C3A05] cursor-not-allowed',
  booked: 'bg-field text-[#7A8797] cursor-not-allowed',
};

const LEGEND = [
  { label: 'Available', cls: 'border-2 border-[#9FB0C4] bg-white' },
  { label: 'Your pick', cls: 'bg-navy' },
  { label: 'Held by others', cls: 'bg-amber' },
  { label: 'Booked', cls: 'bg-field' },
];

export default function SeatMap({ seats, layout, selected, onToggle }: Props) {
  const leftCount = 2;
  const perRow = layout === '2+3' ? 5 : 4;
  const columns = perRow + 1; // + aisle

  // Group seats into rows of `perRow`
  const rows: Seat[][] = [];
  for (let i = 0; i < seats.length; i += perRow) rows.push(seats.slice(i, i + perRow));

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-[18px] text-sm font-bold text-muted">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-2">
            <span className={`h-[18px] w-[18px] rounded-[5px] ${l.cls}`} />
            {l.label}
          </span>
        ))}
      </div>

      <div className="box-border w-full max-w-[380px] rounded-[48px_48px_24px_24px] border-2 border-field px-6 pt-7 pb-6">
        <div className="mb-[18px] flex items-center justify-between border-b-2 border-dashed border-line pb-[18px]">
          <span className="text-xs font-extrabold tracking-[0.08em] text-muted">FRONT</span>
          <span
            role="img"
            aria-label="Driver"
            className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#9FB0C4] text-muted"
          >
            <WheelIcon width={18} height={18} />
          </span>
        </div>

        <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {rows.map((row, r) => {
            const cells = [...row.slice(0, leftCount), null, ...row.slice(leftCount)];
            return cells.map((seat, i) => {
              if (!seat) {
                return (
                  <span key={`aisle-${r}`} className="flex items-center justify-center text-[11px] font-bold text-[#9FB0C4]">
                    {r + 1}
                  </span>
                );
              }
              const isSelected = selected.includes(seat.id);
              const state = seat.status !== 'available' ? seat.status : isSelected ? 'selected' : 'available';
              const disabled = seat.status !== 'available';
              return (
                <button
                  key={seat.id ?? i}
                  type="button"
                  disabled={disabled}
                  aria-pressed={isSelected}
                  aria-label={`Seat ${seat.id}, ${disabled ? (seat.status === 'held' ? 'held by another passenger' : 'booked') : isSelected ? 'selected' : 'available'}`}
                  onClick={() => onToggle(seat.id)}
                  className={`h-11 rounded-[10px_10px_6px_6px] text-[13px] font-extrabold transition-colors ${styles[state]}`}
                >
                  {seat.id}
                </button>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
