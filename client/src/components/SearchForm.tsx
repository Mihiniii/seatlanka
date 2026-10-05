import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, SwapIcon } from './Icons';
import { todayYMD } from '../utils/format';

const CITIES = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Ella'];

const labelCls = 'text-[13px] font-bold uppercase tracking-[0.06em] text-muted';
const inputCls =
  'w-full rounded-xl border-[1.5px] border-field bg-[#F8FAFC] px-4 py-3.5 text-[17px] font-semibold text-ink outline-none focus:border-amber';

export default function SearchForm() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('Colombo');
  const [to, setTo] = useState('Kandy');
  const [date, setDate] = useState(todayYMD());

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    navigate(`/results?${new URLSearchParams({ from, to, date }).toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-wrap items-end gap-3.5 rounded-[22px] bg-white p-6 shadow-[0_18px_48px_rgba(15,27,45,0.14)]"
    >
      <datalist id="cities">
        {CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="flex flex-[1_1_200px] flex-col gap-2">
        <label htmlFor="from" className={labelCls}>From</label>
        <input id="from" list="cities" required value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
      </div>

      <button
        type="button"
        aria-label="Swap from and to"
        onClick={() => {
          setFrom(to);
          setTo(from);
        }}
        className="mb-0.5 flex h-12 w-12 flex-none cursor-pointer items-center justify-center rounded-full border-[1.5px] border-field bg-white text-navy"
      >
        <SwapIcon />
      </button>

      <div className="flex flex-[1_1_200px] flex-col gap-2">
        <label htmlFor="to" className={labelCls}>To</label>
        <input id="to" list="cities" required value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
      </div>

      <div className="flex flex-[1_1_170px] flex-col gap-2">
        <label htmlFor="date" className={labelCls}>Date</label>
        <input id="date" type="date" required min={todayYMD()} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
      </div>

      <button
        type="submit"
        className="flex flex-[1_1_160px] cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-amber px-6 py-4 text-[17px] font-extrabold text-ink"
      >
        <SearchIcon /> Search buses
      </button>
    </form>
  );
}
