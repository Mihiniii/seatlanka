import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout, { fieldInput, fieldLabel, primaryButton } from './AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const redirectTo = (useLocation().state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to book and manage your seats.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={fieldLabel}>Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldInput} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className={fieldLabel}>Password</label>
          <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldInput} />
        </div>
        {error && <p role="alert" className="font-semibold text-[#9B1C1C]">{error}</p>}
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-[15px] text-muted">
        New to SeatLanka?{' '}
        <Link to="/register" state={{ from: redirectTo }} className="font-bold text-navy">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
