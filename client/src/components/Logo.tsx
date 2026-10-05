import { Link } from 'react-router-dom';
import { SeatIcon } from './Icons';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-white no-underline">
      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-amber text-navy">
        <SeatIcon />
      </span>
      <span className="font-display text-[22px] font-extrabold tracking-tight">SeatLanka</span>
    </Link>
  );
}
