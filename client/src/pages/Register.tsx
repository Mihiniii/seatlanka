import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout, { fieldInput, fieldLabel, primaryButton } from './AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const redirectTo = (useLocation().state as { from?: string } | null)?.from ?? '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(name, email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className={fieldLabel}>Full name</label>
          <input id="name" required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={fieldInput} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={fieldLabel}>Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldInput} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className={fieldLabel}>Password</label>
          <input id="password" type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldInput} />
          <span className="text-sm text-muted">At least 6 characters</span>
        </div>
        {error && <p role="alert" className="font-semibold text-[#9B1C1C]">{error}</p>}
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-[15px] text-muted">
        Already have an account?{' '}
        <Link to="/login" state={{ from: redirectTo }} className="font-bold text-navy">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
