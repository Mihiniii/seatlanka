import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar>
        <span />
      </Navbar>
      <div className="mx-auto flex max-w-[1200px] justify-center px-6 py-16">
        <div className="w-full max-w-[440px] rounded-[22px] border border-line bg-white p-8 shadow-[0_18px_48px_rgba(15,27,45,0.08)]">
          <h1 className="font-display text-[32px] font-bold tracking-tight">{title}</h1>
          <p className="mt-1 mb-6 text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export const fieldLabel = 'text-[13px] font-bold uppercase tracking-[0.06em] text-muted';
export const fieldInput =
  'w-full rounded-xl border-[1.5px] border-field bg-[#F8FAFC] px-4 py-3.5 text-base font-semibold text-ink outline-none focus:border-amber';
export const primaryButton =
  'w-full cursor-pointer rounded-xl bg-amber px-5 py-4 text-[17px] font-extrabold text-ink disabled:cursor-not-allowed disabled:opacity-60';
