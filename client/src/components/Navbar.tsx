import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

/** Top bar. Pass `children` to replace the default nav (e.g. a search summary or step list). */
export default function Navbar({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  const [confirming, setConfirming] = useState(false);

  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-[18px]">
        <Logo />
        {children ?? (
          <nav className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link to="/results" className="text-[#DCE6F2] no-underline hover:text-white">
              Routes
            </Link>
            {user ? (
              <>
                <Link to="/bookings" className="text-[#DCE6F2] no-underline hover:text-white">
                  My bookings
                </Link>
                <span className="text-[#DCE6F2]">Hi, {user.name.split(' ')[0]}</span>
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="cursor-pointer rounded-full bg-white px-5 py-3 font-bold text-navy"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-full bg-white px-5 py-3 font-bold text-navy no-underline">
                Sign in
              </Link>
            )}
          </nav>
        )}
      </div>
      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
          onClick={() => setConfirming(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-[380px] rounded-2xl bg-white p-6 text-navy shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="logout-title" className="text-xl font-bold">Log out?</h2>
            <p className="mt-2 text-[15px] text-muted">Are you sure you want to log out of SeatLanka?</p>
            <div className="mt-6 flex justify-end gap-3 text-[15px]">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirming(false)}
                className="cursor-pointer rounded-full border border-[#C9D3E0] bg-white px-5 py-3 font-bold text-navy"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  logout();
                }}
                className="cursor-pointer rounded-full bg-navy px-5 py-3 font-bold text-white"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
