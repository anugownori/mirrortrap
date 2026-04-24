import { Link } from 'react-router-dom';

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2 text-slate-100">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <defs>
          <linearGradient id="mt-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7F77DD" />
            <stop offset="1" stopColor="#EF9F27" />
          </linearGradient>
        </defs>
        <path
          d="M32 6 L54 14 V32 C54 46 44 56 32 58 C20 56 10 46 10 32 V14 Z"
          fill="none"
          stroke="url(#mt-g)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M22 32 L30 40 L44 24"
          fill="none"
          stroke="#7F77DD"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-semibold tracking-tight" style={{ fontSize: size * 0.82 }}>
        Mirror<span className="text-brand-purple">Trap</span>
      </span>
    </Link>
  );
}
