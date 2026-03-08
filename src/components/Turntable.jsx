import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MEMBER_COLORS = [
  '#BF6B4A', '#4A7BBF', '#6B4ABF', '#4ABF6B',
  '#BF4A6B', '#4ABFBF', '#BF9F4A', '#8B4ABF',
]

export default function Turntable({ members, onSpinComplete, disabled }) {
  const [phase, setPhase] = useState('idle') // idle | spinning | landed
  const [winner, setWinner] = useState(null)
  const tonearmRef = useRef(null)
  const platterRef = useRef(null)
  const animFrameRef = useRef(null)

  const size = 320
  const center = size / 2
  const radius = size / 2 - 8
  const innerRadius = 48
  const segAngle = 360 / members.length

  const handleSpin = useCallback(() => {
    if (phase !== 'idle' || disabled) return
    setPhase('spinning')

    // Pick random winner
    const winnerIndex = Math.floor(Math.random() * members.length)
    const chosenWinner = members[winnerIndex]
    setWinner(chosenWinner)

    // Animate tonearm: lift → sweep → settle
    const tonearm = tonearmRef.current
    const platter = platterRef.current
    if (!tonearm || !platter) return

    const startTime = performance.now()
    const liftDuration = 600
    const sweepDuration = 2600
    const settleDuration = 1300
    const totalDuration = liftDuration + sweepDuration + settleDuration

    // Start platter spinning
    platter.style.animation = 'idle-spin 2s linear infinite'

    const animate = (now) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / totalDuration, 1)

      if (elapsed < liftDuration) {
        // Phase 1: Lift tonearm up (rotate away from record)
        const liftT = elapsed / liftDuration
        const ease = liftT * liftT * (3 - 2 * liftT) // smoothstep
        const angle = -30 + ease * -10 // -30 to -40 degrees
        tonearm.style.transform = `rotate(${angle}deg)`
      } else if (elapsed < liftDuration + sweepDuration) {
        // Phase 2: Sweep across record
        const sweepT = (elapsed - liftDuration) / sweepDuration
        const ease = sweepT < 0.5
          ? 4 * sweepT * sweepT * sweepT
          : 1 - Math.pow(-2 * sweepT + 2, 3) / 2
        const angle = -40 + ease * 35 // -40 to -5 degrees
        tonearm.style.transform = `rotate(${angle}deg)`
      } else {
        // Phase 3: Settle — small bounce
        const settleT = (elapsed - liftDuration - sweepDuration) / settleDuration
        const bounce = Math.sin(settleT * Math.PI * 2) * (1 - settleT) * 3
        const angle = -5 + bounce
        tonearm.style.transform = `rotate(${angle}deg)`
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Done
        tonearm.style.transform = 'rotate(-5deg)'
        platter.style.animation = 'idle-spin 8s linear infinite' // slow idle
        setPhase('landed')
        setTimeout(() => {
          onSpinComplete(chosenWinner)
        }, 1500)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }, [phase, disabled, members, onSpinComplete])

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-4"
    >
      {/* 3D perspective wrapper */}
      <div style={{ perspective: '900px', perspectiveOrigin: '50% 40%' }}>
        <div style={{
          transform: 'rotateX(25deg) rotateZ(-2deg)',
          transformStyle: 'preserve-3d',
        }}>
          {/* Turntable base */}
          <div
            className="relative mx-auto"
            style={{
              width: size + 80,
              height: size + 80,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Wood base top surface */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, #C4956E 0%, #8B6340 40%, #6B4226 100%)',
                transform: 'translateZ(-14px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            />
            {/* Wood base front edge */}
            <div
              className="absolute left-0 right-0 bottom-0 rounded-b-2xl"
              style={{
                height: 28,
                background: 'linear-gradient(180deg, #7a5232 0%, #5a3322 100%)',
                transform: 'translateZ(-14px) rotateX(-90deg)',
                transformOrigin: 'bottom',
              }}
            />
            {/* Dark felt mat */}
            <div
              className="absolute rounded-full"
              style={{
                left: 40,
                top: 40,
                width: size,
                height: size,
                background: 'radial-gradient(circle, #1a1a1a 60%, #111 100%)',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
              }}
            />

            {/* Spinning platter + record */}
            <div
              ref={platterRef}
              className="absolute"
              style={{
                left: 40,
                top: 40,
                width: size,
                height: size,
              }}
            >
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <defs>
                  <radialGradient id="vinyl-shine" cx="35%" cy="35%" r="60%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                  <radialGradient id="label-grad" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#F5E6D3" />
                    <stop offset="100%" stopColor="#D4B896" />
                  </radialGradient>
                  {members.map((_, i) => {
                    const color = MEMBER_COLORS[i % MEMBER_COLORS.length]
                    return (
                      <radialGradient key={`seg-${i}`} id={`rv-seg-${i}`} cx="50%" cy="50%" r="50%">
                        <stop offset="20%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.10} />
                      </radialGradient>
                    )
                  })}
                </defs>

                {/* Vinyl disc */}
                <circle cx={center} cy={center} r={radius} fill="#111" />
                <circle cx={center} cy={center} r={radius} fill="none" stroke="#222" strokeWidth="1" />

                {/* Grooves */}
                {Array.from({ length: 22 }, (_, i) => {
                  const r = innerRadius + 6 + (radius - innerRadius - 10) * (i / 22)
                  return (
                    <circle key={`g-${i}`} cx={center} cy={center} r={r}
                      fill="none" stroke={i % 3 === 0 ? '#1e1e1e' : '#171717'} strokeWidth={i % 3 === 0 ? 0.8 : 0.4} />
                  )
                })}

                {/* Member segments */}
                {members.map((member, i) => {
                  const color = MEMBER_COLORS[i % MEMBER_COLORS.length]
                  const startAngle = (i * segAngle - 90) * Math.PI / 180
                  const endAngle = ((i + 1) * segAngle - 90) * Math.PI / 180
                  const midAngle = (startAngle + endAngle) / 2
                  const outerR = radius - 4
                  const largeArc = segAngle > 180 ? 1 : 0

                  const x1 = center + outerR * Math.cos(startAngle)
                  const y1 = center + outerR * Math.sin(startAngle)
                  const x2 = center + outerR * Math.cos(endAngle)
                  const y2 = center + outerR * Math.sin(endAngle)
                  const ix1 = center + innerRadius * Math.cos(startAngle)
                  const iy1 = center + innerRadius * Math.sin(startAngle)
                  const ix2 = center + innerRadius * Math.cos(endAngle)
                  const iy2 = center + innerRadius * Math.sin(endAngle)

                  const path = `M ${ix1} ${iy1} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`

                  const nameR = (outerR + innerRadius) / 2
                  const nameX = center + nameR * Math.cos(midAngle)
                  const nameY = center + nameR * Math.sin(midAngle)
                  const textDeg = midAngle * 180 / Math.PI
                  const flip = (textDeg > 90 && textDeg < 270) ? textDeg + 180 : textDeg

                  return (
                    <g key={member.id}>
                      <path d={path} fill={`url(#rv-seg-${i})`} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                      <text
                        x={nameX} y={nameY}
                        textAnchor="middle" dominantBaseline="central"
                        fontSize="13" fontWeight="600"
                        fill={color} fillOpacity="0.9"
                        transform={`rotate(${flip}, ${nameX}, ${nameY})`}
                      >
                        {member.display_name}
                      </text>
                    </g>
                  )
                })}

                {/* Shine */}
                <circle cx={center} cy={center} r={radius} fill="url(#vinyl-shine)" />

                {/* Center label */}
                <circle cx={center} cy={center} r={40} fill="url(#label-grad)" />
                <circle cx={center} cy={center} r={40} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                <text x={center} y={center - 4} textAnchor="middle" dominantBaseline="central"
                  fontSize="10" fontWeight="700" letterSpacing="2" fill="var(--walnut)" opacity="0.6">
                  REVINYL
                </text>
                <text x={center} y={center + 10} textAnchor="middle" dominantBaseline="central"
                  fontSize="8" fill="var(--walnut)" opacity="0.4">
                  {'\u266B'}
                </text>

                {/* Spindle */}
                <circle cx={center} cy={center} r={4} fill="#8B6340" stroke="#6B4226" strokeWidth="1" />
              </svg>
            </div>

            {/* Tonearm assembly */}
            <svg
              className="absolute"
              style={{
                top: 12, right: 12,
                width: 130, height: 210,
                overflow: 'visible',
              }}
              viewBox="0 0 130 210"
            >
              {/* Pivot base */}
              <circle cx="105" cy="22" r="14" fill="#8B6340" stroke="#6B4226" strokeWidth="1.5" />
              <circle cx="105" cy="22" r="7" fill="#A07850" />
              {/* Arm group — rotates around pivot */}
              <g
                ref={tonearmRef}
                style={{
                  transformOrigin: '105px 22px',
                  transform: 'rotate(-30deg)',
                  transition: phase === 'idle' ? 'transform 0.3s ease' : 'none',
                }}
              >
                {/* Arm shaft */}
                <line x1="105" y1="22" x2="32" y2="165" stroke="#A07850" strokeWidth="3" strokeLinecap="round" />
                {/* Counterweight */}
                <circle cx="118" cy="10" r="6" fill="#6B4226" />
                {/* Head shell */}
                <rect x="24" y="160" width="16" height="26" rx="3" fill="#6B4226" />
                {/* Stylus */}
                <line x1="32" y1="186" x2="32" y2="194" stroke="#A07850" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Button / Result */}
      <div className="text-center mt-6">
        <AnimatePresence mode="wait">
          {phase === 'landed' && winner ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Today's dropper</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--charcoal)', fontFamily: "'Instrument Serif', serif" }}>
                {winner.display_name}
              </p>
            </motion.div>
          ) : (
            <motion.button
              key="spin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSpin}
              disabled={phase !== 'idle' || disabled}
              className="px-10 py-3.5 rounded-full font-semibold text-base transition-all"
              style={{
                background: phase !== 'idle' ? 'var(--bg-subtle)' : 'var(--terracotta)',
                color: phase !== 'idle' ? 'var(--text-muted)' : '#fff',
                border: `1px solid ${phase !== 'idle' ? 'var(--border)' : 'var(--terracotta)'}`,
                cursor: phase !== 'idle' ? 'not-allowed' : 'pointer',
              }}
            >
              {phase === 'spinning' ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'var(--text-muted)', borderTopColor: 'var(--terracotta)' }} />
                  Spinning...
                </span>
              ) : 'Spin'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
