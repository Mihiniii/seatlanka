import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const SeatIcon = (p: P) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="M7 4h7a3 3 0 0 1 3 3v7H9a2 2 0 0 1-2-2V4z" />
    <path d="M5 20h14" />
    <path d="M9 14v6" />
    <path d="M17 14v6" />
  </svg>
);
export const GridIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
export const TimerIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2.5" />
    <path d="M9 2h6" />
  </svg>
);
export const QrIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="6" height="6" />
    <rect x="15" y="3" width="6" height="6" />
    <rect x="3" y="15" width="6" height="6" />
    <path d="M15 15h2v2h-2z" />
    <path d="M19 19h2v2h-2z" />
    <path d="M15 19h2" />
    <path d="M19 15h2" />
  </svg>
);
export const SwapIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M7 7h13l-4-4" />
    <path d="M17 17H4l4 4" />
  </svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </svg>
);
export const ArrowRightIcon = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);
export const ChevronLeftIcon = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base} strokeWidth={3} {...p}>
    <path d="M5 12l5 5 9-10" />
  </svg>
);
export const WheelIcon = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <circle cx="12" cy="12" r="2" />
    <path d="M12 14v7" />
    <path d="M10 12H3" />
    <path d="M14 12h7" />
  </svg>
);
