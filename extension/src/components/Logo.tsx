export function Logo() {
  return (
    <div className="scout-logo">
      <div className="scout-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="img">
          <defs>
            <linearGradient id="scoutLogoGradient" x1="8" y1="7" x2="57" y2="58">
              <stop stopColor="#a78bfa" />
              <stop offset="0.48" stopColor="#7c3aed" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="scoutGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.55 0 0 0 0 0.36 0 0 0 0 1 0 0 0 0.85 0"
              />
              <feBlend in="SourceGraphic" />
            </filter>
          </defs>
          <rect x="6" y="6" width="52" height="52" rx="17" fill="#07070b" />
          <path
            d="M43 17C35 12 22 14 18 22c-3 7 1 13 10 15l8 2c5 1 6 6 3 9-5 6-17 4-25-2"
            fill="none"
            stroke="url(#scoutLogoGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#scoutGlow)"
          />
          <path
            d="M42 16l7-5m-1 10 6-1m-13-8 1-7"
            stroke="#67e8f9"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="47" cy="18" r="4" fill="#38bdf8" />
        </svg>
      </div>
      <div className="scout-logo-copy">
        <div className="scout-logo-title">Micro-SaaS Scout</div>
        <div className="scout-logo-subtitle">AI opportunity scanner</div>
      </div>
    </div>
  );
}
