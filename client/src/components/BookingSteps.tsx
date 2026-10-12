const STEPS = ['Trip', 'Seats', 'Payment'];

export default function BookingSteps({ active }: { active: number }) {
  return (
    <ol className="flex flex-wrap gap-2.5 text-sm font-bold">
      {STEPS.map((s, i) => (
        <li key={s} className={`rounded-full px-3.5 py-2 ${i === active ? 'bg-amber text-ink' : 'text-[#C9D6E6]'}`}>
          {i + 1} · {s}
        </li>
      ))}
    </ol>
  );
}
