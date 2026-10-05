import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-[600px] px-6 py-24 text-center">
        <h1 className="font-display text-[40px] font-bold">Page not found</h1>
        <p className="mt-2 text-muted">This bus doesn&apos;t stop here.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-amber px-6 py-4 font-extrabold text-ink no-underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
