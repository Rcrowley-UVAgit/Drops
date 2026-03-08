export default function Logo({ size = 120, showText = true, className = '' }) {
  const s = size
  const cx = s / 2
  const cy = s / 2
  const outerR = s / 2 - 2
  const grooveStart = s * 0.18
  const grooveEnd = outerR - 2
  const labelR = s * 0.17
  const spindleR = s * 0.025

  return (
    <div className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Vinyl body gradient */}
          <radialGradient id="logo-vinyl" cx="40%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#111111" />
          </radialGradient>

          {/* Subtle shine */}
          <radialGradient id="logo-shine" cx="32%" cy="30%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Label gradient — warm cream */}
          <radialGradient id="logo-label" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#F5E6D3" />
            <stop offset="100%" stopColor="#D4B896" />
          </radialGradient>

          {/* Terracotta accent arc gradient */}
          <linearGradient id="logo-accent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#BF6B4A" />
            <stop offset="100%" stopColor="#D4845F" />
          </linearGradient>
        </defs>

        {/* Outer disc */}
        <circle cx={cx} cy={cy} r={outerR} fill="url(#logo-vinyl)" />
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#333" strokeWidth="0.5" />

        {/* Grooves */}
        {Array.from({ length: 14 }, (_, i) => {
          const r = grooveStart + (grooveEnd - grooveStart) * (i / 14)
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={i % 3 === 0 ? '#222' : '#1a1a1a'}
              strokeWidth={i % 3 === 0 ? 0.7 : 0.35}
            />
          )
        })}

        {/* Terracotta accent — partial arc on the record */}
        {(() => {
          const arcR = grooveStart + (grooveEnd - grooveStart) * 0.55
          const startDeg = -60
          const endDeg = 30
          const startRad = (startDeg * Math.PI) / 180
          const endRad = (endDeg * Math.PI) / 180
          const x1 = cx + arcR * Math.cos(startRad)
          const y1 = cy + arcR * Math.sin(startRad)
          const x2 = cx + arcR * Math.cos(endRad)
          const y2 = cy + arcR * Math.sin(endRad)
          return (
            <path
              d={`M ${x1} ${y1} A ${arcR} ${arcR} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke="url(#logo-accent)"
              strokeWidth={s * 0.025}
              strokeLinecap="round"
              opacity="0.85"
            />
          )
        })()}

        {/* Shine overlay */}
        <circle cx={cx} cy={cy} r={outerR} fill="url(#logo-shine)" />

        {/* Center label */}
        <circle cx={cx} cy={cy} r={labelR} fill="url(#logo-label)" />
        <circle cx={cx} cy={cy} r={labelR} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />

        {/* "R" on the label */}
        <text
          x={cx}
          y={cy + s * 0.01}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={labelR * 0.9}
          fontFamily="'Instrument Serif', serif"
          fontStyle="italic"
          fontWeight="400"
          fill="#2C2825"
          opacity="0.7"
        >
          R
        </text>

        {/* Spindle dot */}
        <circle cx={cx} cy={cy + labelR * 0.38} r={spindleR} fill="#BF6B4A" opacity="0.5" />
      </svg>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col items-center" style={{ gap: 2 }}>
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic',
              fontSize: s * 0.22,
              lineHeight: 1,
              color: '#2C2825',
              letterSpacing: '-0.02em',
            }}
          >
            ReVinyl
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: s * 0.085,
              lineHeight: 1,
              color: '#BF6B4A',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            drops
          </span>
        </div>
      )}
    </div>
  )
}
