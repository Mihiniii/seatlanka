import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

/** Top bar. Pass `children` to replace the default nav (e.g. a search summary or step list). */
export default function Navbar({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();

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
                <span className="text-[#DCE6F2]">Hi, {user.name.split(' ')[0]}</span>
                <button
                  type="button"
                  onClick={logout}
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
    </header>
  );
}
