import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchForm from '../components/SearchForm';
import { ArrowRightIcon, GridIcon, QrIcon, TimerIcon } from '../components/Icons';
import { todayYMD } from '../utils/format';

const FEATURES = [
  { icon: GridIcon, title: 'Live seat map', text: 'See seats change as others book' },
  { icon: TimerIcon, title: '5-minute seat hold', text: 'No one can take it while you pay' },
  { icon: QrIcon, title: 'QR e-ticket', text: 'Show it to the conductor, no printing' },
];

const POPULAR = [
  { from: 'Colombo', to: 'Kandy', note: '~3 h' },
  { from: 'Colombo', to: 'Galle', note: '~2 h · Expressway' },
  { from: 'Colombo', to: 'Jaffna', note: '~8 h · Night buses' },
  { from: 'Kandy', to: 'Ella', note: '~5 h · Hill country' },
];

const STEPS = [
  { title: 'Search your route', text: 'Compare departure times, bus types and fares for your date.' },
  { title: 'Pick your seat', text: 'Window or aisle, front or back — choose it on the live map.' },
  { title: 'Pay and board', text: 'Get a QR ticket instantly and show it when you board.' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative isolate overflow-hidden bg-navy pt-14 pb-[140px] text-white">
        <img
          src="/hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_40%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-dark/85 via-navy/60 to-navy/30" />
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-6">
          <div className="min-w-0 flex-[999_1_520px]">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-[#F2C27F]">
              <span className="h-2 w-2 rounded-full bg-amber" /> Live seat availability
            </p>
            <h1 className="font-display text-[44px] leading-[1.02] font-extrabold tracking-[-0.03em] md:text-[60px]">
              Your seat on every bus across Sri Lanka.
            </h1>
            <p className="mt-5 max-w-[560px] text-[19px] leading-relaxed text-[#C9D6E6]">
              Pick the exact seat you want on a live seat map, hold it while you pay, and board with a QR ticket on
              your phone.
            </p>
          </div>

          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-4 rounded-[18px] border border-white/20 bg-navy-dark/45 p-5 backdrop-blur-md">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-amber text-navy">
                  <Icon width={22} height={22} />
                </span>
                <div>
                  <div className="text-base font-bold">{title}</div>
                  <div className="mt-0.5 text-sm text-[#C9D6E6]">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-24 max-w-[1200px] px-6">
        <SearchForm />
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pt-[72px] pb-6">
        <h2 className="mb-6 font-display text-[34px] font-bold tracking-tight">Popular routes</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
          {POPULAR.map((r) => (
            <Link
              key={`${r.from}-${r.to}`}
              to={`/results?${new URLSearchParams({ from: r.from, to: r.to, date: todayYMD() }).toString()}`}
              className="flex flex-col gap-3.5 rounded-[18px] border border-line bg-white p-[22px] text-ink no-underline transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2.5 font-display text-[21px] font-bold">
                {r.from}
                <ArrowRightIcon width={18} height={18} className="text-amber" />
                {r.to}
              </div>
              <div className="text-sm text-muted">{r.note}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pt-12 pb-[72px]">
        <h2 className="mb-6 font-display text-[34px] font-bold tracking-tight">Booking in three steps</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[18px]">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-[18px] border border-line bg-white p-[26px]">
              <div className="font-display text-[40px] leading-none font-extrabold text-amber">0{i + 1}</div>
              <h3 className="mt-3.5 mb-1.5 text-[19px] font-bold">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
