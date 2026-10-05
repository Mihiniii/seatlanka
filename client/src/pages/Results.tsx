import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TripCard from '../components/TripCard';
import { api } from '../services/api';
import type { Trip } from '../types';
import { formatDate, todayYMD } from '../utils/format';

type Sort = 'earliest' | 'cheapest' | 'fastest';
const BUS_TYPES = ['Luxury AC', 'Semi-luxury', 'Normal'] as const;

export default function Results() {
  const [params] = useSearchParams();
  const from = params.get('from') ?? 'Colombo';
  const to = params.get('to') ?? 'Kandy';
  const date = params.get('date') ?? todayYMD();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<Sort>('earliest');
  const [types, setTypes] = useState<string[]>([...BUS_TYPES]);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .searchTrips(from, to, date)
      .then((r) => setTrips(r.trips))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [from, to, date]);

  const shown = useMemo(() => {
    const list = trips.filter((t) => types.includes(t.bus.type));
    const dur = (t: Trip) => new Date(t.arrivalTime).getTime() - new Date(t.departureTime).getTime();
    return [...list].sort((a, b) =>
      sort === 'cheapest'
        ? a.price - b.price
        : sort === 'fastest'
          ? dur(a) - dur(b)
          : new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
    );
  }, [trips, types, sort]);

  function toggleType(t: string) {
    setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  const pill = (active: boolean) =>
    `cursor-pointer rounded-full px-4 py-2.5 text-sm font-bold ${
      active ? 'bg-ink text-white' : 'border-[1.5px] border-field bg-white text-ink'
    }`;

  return (
    <div className="min-h-screen">
      <Navbar>
        <div className="flex flex-wrap items-center gap-3.5 rounded-full bg-white/10 py-2 pr-2 pl-5">
          <span className="text-[15px] font-bold">
            {from} → {to}
          </span>
          <span className="text-sm text-[#C9D6E6]">{formatDate(`${date}T12:00:00+05:30`)}</span>
          <Link to="/" className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy no-underline">
            Modify
          </Link>
        </div>
      </Navbar>

      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-7 px-6 pt-8 pb-16">
        <aside className="flex min-w-0 flex-[1_1_240px] flex-col gap-6 rounded-[18px] border border-line bg-white p-[22px]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Filters</h2>
            <button type="button" onClick={() => setTypes([...BUS_TYPES])} className="cursor-pointer text-sm font-bold text-navy">
              Reset
            </button>
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-muted">Bus type</legend>
            {BUS_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2.5 text-[15px] font-semibold">
                <input
                  type="checkbox"
                  checked={types.includes(t)}
                  onChange={() => toggleType(t)}
                  className="h-[18px] w-[18px] accent-navy"
                />
                {t}
              </label>
            ))}
          </fieldset>
        </aside>

        <main className="flex min-w-0 flex-[999_1_600px] flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-[30px] font-bold tracking-tight">
              {loading ? 'Searching…' : `${shown.length} bus${shown.length === 1 ? '' : 'es'} found`}
            </h1>
            <div className="flex flex-wrap gap-2">
              {(['earliest', 'cheapest', 'fastest'] as Sort[]).map((s) => (
                <button key={s} type="button" onClick={() => setSort(s)} className={pill(sort === s)}>
                  {s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-[#FDECEA] p-4 font-semibold text-[#9B1C1C]">
              {error}. Is the backend running?
            </p>
          )}
          {!loading && !error && shown.length === 0 && (
            <p className="rounded-[18px] border border-line bg-white p-8 text-center text-muted">
              No buses found for this route and date. Try another date.
            </p>
          )}
          {shown.map((t) => (
            <TripCard key={t._id} trip={t} />
          ))}
        </main>
      </div>
    </div>
  );
}
