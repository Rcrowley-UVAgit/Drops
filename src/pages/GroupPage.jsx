import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Music, Search as SearchIcon, ExternalLink, Link2, Check, ChevronDown, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { demoGroups, demoPastDrops, getUser, getGroupMembers, getShotclock, formatTimeAgo, CURRENT_USER } from '../lib/demoData'
import DropCard from '../components/DropCard'
import { ResizableHandle } from '../components/Layout'

export default function GroupPage() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [shotclock, setShotclock] = useState(getShotclock())
  const [copied, setCopied] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [hasSpun, setHasSpun] = useState({})
  const [centerPct, setCenterPct] = useState(55)
  const containerRef = useRef(null)

  const group = demoGroups.find(g => g.id === groupId) || demoGroups[0]
  const members = getGroupMembers(group)
  const dropper = getUser(group.today_dropper)
  const pastDrops = demoPastDrops[group.id] || []
  const isMyTurn = group.today_dropper === user?.id
  const spunForGroup = hasSpun[group.id] || false

  /* Build allDrops: today's drop (if exists) + past drops */
  const allDrops = []
  if (group.today_drop) {
    allDrops.push(group.today_drop)
  }
  allDrops.push(...pastDrops)

  useEffect(() => {
    const timer = setInterval(() => setShotclock(getShotclock()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSpin = useCallback(() => {
    setHasSpun(prev => ({ ...prev, [group.id]: true }))
  }, [group.id])

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(`https://musicdrops.netlify.app/join/${group.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDrag = useCallback((deltaX) => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.offsetWidth
    const deltaPct = (deltaX / containerWidth) * 100
    setCenterPct(prev => Math.min(75, Math.max(35, prev + deltaPct)))
  }, [])

  const rightPct = 100 - centerPct

  return (
    <div ref={containerRef} className="flex h-full">
      {/* CENTER PANE */}
      <div
        className="overflow-y-auto flex-1 md:flex-none"
        style={{ width: window.innerWidth >= 768 ? `${centerPct}%` : '100%' }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Group Header */}
          <div className="px-5 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">{group.name}</h1>
              </div>
              <button
                onClick={handleCopyInvite}
                className="flex items-center gap-1.5 text-base bg-white/[0.06] text-white/70 px-4 py-1.5 rounded-full hover:bg-white/[0.10] transition-all border border-white/[0.06]"
              >
                {copied ? <Check size={16} /> : <Link2 size={16} />}
                {copied ? 'Copied!' : 'Invite'}
              </button>
            </div>
          </div>

          {/* Members dropdown */}
          <div className="px-5 pb-4">
            <button
              onClick={() => setMembersOpen(!membersOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors border border-white/[0.04]"
            >
              <Users size={16} className="text-white/40" />
              <span className="text-base font-medium text-white/70">Members</span>
              <span className="text-base text-white/30">{members.length}</span>
              <ChevronDown
                size={16}
                className={`text-white/30 transition-transform duration-200 ${membersOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {membersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
                className="mt-2 flex items-center gap-2 flex-wrap"
              >
                {members.map((member) => {
                  const isDropper = member.id === group.today_dropper
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                        isDropper
                          ? 'bg-accent-600/15 ring-1 ring-accent-500/30'
                          : 'bg-white/[0.04]'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-base font-bold"
                        style={{ backgroundColor: member.color, color: '#000' }}
                      >
                        {member.display_name[0]}
                      </div>
                      <span className={`text-base font-medium ${isDropper ? 'text-accent-400' : 'text-white/70'}`}>
                        {member.display_name}
                      </span>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </div>

          {/* Main content */}
          <div className="px-5 space-y-6 pb-8">
            {!spunForGroup ? (
              <SpinTheWheel members={members} dropper={dropper} onComplete={handleSpin} />
            ) : (
              <>
                {group.drop_status !== 'dropped' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ShotclockDisplay shotclock={shotclock} />
                  </motion.div>
                )}
                {group.drop_status === 'your_turn' && <YourTurnState group={group} navigate={navigate} shotclock={shotclock} user={user} />}
                {group.drop_status === 'dropped' && <DroppedState group={group} />}
                {group.drop_status === 'waiting' && <WaitingState group={group} dropper={dropper} shotclock={shotclock} />}
              </>
            )}

            {/* Vault mobile only */}
            <div className="md:hidden">
              {allDrops.length > 0 && <VaultPanel drops={allDrops} />}
            </div>
          </div>
        </div>
      </div>

      {/* DRAG HANDLE */}
      <ResizableHandle onDrag={handleDrag} />

      {/* RIGHT PANE: Vault desktop */}
      <div
        className="hidden md:block overflow-y-auto border-l border-white/[0.06] bg-[#0a0a0a]"
        style={{ width: `${rightPct}%` }}
      >
        <div className="p-5">
          <VaultPanel drops={allDrops} />
        </div>
      </div>
    </div>
  )
}

/* Vault Panel (replaces PreviousDropsPanel) */
function VaultPanel({ drops }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold tracking-tight text-white/50">Vault</h3>
        <span className="text-base text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-full">{drops.length}</span>
      </div>
      {drops.length > 0 ? (
        <div className="space-y-3">
          {drops.map((drop, i) => (
            <DropCard key={drop.id} drop={drop} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-base text-white/25 text-center py-8">No drops yet</p>
      )}
    </div>
  )
}

/* Spin the Wheel */
function SpinTheWheel({ members, dropper, onComplete }) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [landed, setLanded] = useState(false)
  const wheelRef = useRef(null)
  const segAngle = 360 / members.length

  const handleSpin = () => {
    if (spinning) return
    setSpinning(true)
    setLanded(false)

    const dropperIndex = members.findIndex(m => m.id === dropper.id)
    const fullSpins = 6 + Math.floor(Math.random() * 4)
    const targetOffset = -(dropperIndex * segAngle) - segAngle / 2
    const totalRotation = rotation + fullSpins * 360 + ((targetOffset - rotation % 360 + 720) % 360)
    setRotation(totalRotation)

    setTimeout(() => {
      setSpinning(false)
      setLanded(true)
      setTimeout(onComplete, 2000)
    }, 7200)
  }

  const wheelSize = 380
  const center = wheelSize / 2
  const radius = wheelSize / 2 - 6

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-6"
    >
      {/* Wheel container */}
      <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
        {/* Subtle outer glow */}
        <div
          className="absolute -inset-3 rounded-full opacity-40 blur-2xl transition-all duration-1000"
          style={{
            background: landed
              ? `radial-gradient(circle, ${dropper.color}30, transparent 70%)`
              : 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)'
          }}
        />

        {/* Spinning wheel */}
        <svg
          ref={wheelRef}
          width={wheelSize}
          height={wheelSize}
          className="absolute inset-0"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 7s cubic-bezier(0.15, 0.60, 0.08, 1.0)' : 'none'
          }}
        >
          {/* Definitions for gradients */}
          <defs>
            {members.map((member, i) => (
              <radialGradient key={`grad-${i}`} id={`seg-grad-${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="30%" stopColor={member.color} stopOpacity={i % 2 === 0 ? 0.28 : 0.18} />
                <stop offset="100%" stopColor={member.color} stopOpacity={i % 2 === 0 ? 0.12 : 0.06} />
              </radialGradient>
            ))}
          </defs>

          {members.map((member, i) => {
            const startAngle = i * segAngle - 90
            const endAngle = startAngle + segAngle
            const startRad = (startAngle * Math.PI) / 180
            const endRad = (endAngle * Math.PI) / 180
            const midRad = ((startAngle + endAngle) / 2 * Math.PI) / 180
            const innerRadius = 50

            const x1 = center + radius * Math.cos(startRad)
            const y1 = center + radius * Math.sin(startRad)
            const x2 = center + radius * Math.cos(endRad)
            const y2 = center + radius * Math.sin(endRad)
            const ix1 = center + innerRadius * Math.cos(startRad)
            const iy1 = center + innerRadius * Math.sin(startRad)
            const ix2 = center + innerRadius * Math.cos(endRad)
            const iy2 = center + innerRadius * Math.sin(endRad)

            const largeArc = segAngle > 180 ? 1 : 0
            const pathData = `M ${ix1} ${iy1} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`

            const nameRadius = radius * 0.62
            const nameX = center + nameRadius * Math.cos(midRad)
            const nameY = center + nameRadius * Math.sin(midRad)
            const midAngleDeg = (startAngle + endAngle) / 2

            /* Flip text that would be upside down */
            const textRotation = (midAngleDeg > 90 && midAngleDeg < 270)
              ? midAngleDeg + 180
              : midAngleDeg

            return (
              <g key={member.id}>
                <path
                  d={pathData}
                  fill={`url(#seg-grad-${i})`}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
                {/* Member name */}
                <text
                  x={nameX}
                  y={nameY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="15"
                  fontWeight="600"
                  fill={member.color}
                  fillOpacity="0.9"
                  transform={`rotate(${textRotation}, ${nameX}, ${nameY})`}
                >
                  {member.display_name}
                </text>
              </g>
            )
          })}

          {/* Center hub */}
          <circle cx={center} cy={center} r={48} fill="#0e0e0e" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <circle cx={center} cy={center} r={46} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
          <text x={center} y={center - 6} textAnchor="middle" dominantBaseline="central" fontSize="20" fill="rgba(139,92,246,0.5)">
            {'\u266B'}
          </text>
          <text x={center} y={center + 14} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="500" fill="rgba(255,255,255,0.2)">
            DROP
          </text>
        </svg>

        {/* Pointer at top */}
        <div className="absolute left-1/2 -top-1 -translate-x-1/2 z-10">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '16px solid #7C3AED',
              filter: 'drop-shadow(0 2px 6px rgba(124,58,237,0.4))'
            }}
          />
        </div>
      </div>

      {/* Result / Button area */}
      <div className="mt-8 text-center">
        <AnimatePresence mode="wait">
          {landed ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="space-y-3"
            >
              <p className="text-base text-white/35 font-medium">Today's dropper</p>
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
                  style={{ backgroundColor: dropper.color, color: '#000' }}
                >
                  {dropper.display_name[0]}
                </div>
                <span className="text-2xl font-bold" style={{ color: dropper.color }}>
                  {dropper.display_name}
                </span>
              </div>
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
              disabled={spinning}
              className={`px-10 py-3.5 rounded-full font-semibold text-base transition-all ${
                spinning
                  ? 'bg-white/[0.04] text-white/30 cursor-not-allowed border border-white/[0.06]'
                  : 'bg-accent-600 hover:bg-accent-500 text-white shadow-lg shadow-accent-600/20 border border-accent-500/20'
              }`}
            >
              {spinning ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  Spinning{'\u2026'}
                </span>
              ) : 'Spin the Wheel'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* Shotclock Display */
function ShotclockDisplay({ shotclock }) {
  if (!shotclock.active) {
    return (
      <div className="bg-white/[0.03] rounded-xl p-4 text-center border border-white/[0.04]">
        <p className="text-base text-white/40">{shotclock.remaining}</p>
      </div>
    )
  }

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/[0.04]">
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <Clock size={16} className="text-white/30" />
        <span className="text-base font-medium text-white/30">Time Remaining</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <TimeUnit value={pad(shotclock.hours)} label="HR" />
        <span className="text-2xl font-light text-white/15 -mt-3">:</span>
        <TimeUnit value={pad(shotclock.minutes)} label="MIN" />
        <span className="text-2xl font-light text-white/15 -mt-3">:</span>
        <TimeUnit value={pad(shotclock.seconds)} label="SEC" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-white/90 font-mono tracking-wider">{value}</p>
      <p className="text-base font-medium text-white/25 mt-0.5">{label}</p>
    </div>
  )
}

/* STATE: Your Turn */
function YourTurnState({ group, navigate, shotclock, user }) {
  const displayName = user?.display_name || 'You'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-600/15 via-accent-600/5 to-transparent p-6 border border-accent-600/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-600/8 rounded-full blur-3xl -translate-y-8 translate-x-8" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
            <span className="text-base font-semibold text-accent-400">Your Turn</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">{displayName}, it's your day to drop</h2>
          <p className="text-base text-white/50 mb-5">
            Search for a song and share it with the group.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/group/${group.id}/drop`)}
            className="flex items-center justify-center gap-2 w-full bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-xl py-3.5 text-base transition-colors"
          >
            <SearchIcon size={16} />
            Search & Drop
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* STATE: Someone Dropped */
function DroppedState({ group }) {
  const drop = group.today_drop
  if (!drop) return null
  const dropper = getUser(drop.user_id)
  const song = drop.song
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-base font-semibold text-emerald-400">Today's Drop</span>
      </div>
      <div
        className="relative overflow-hidden rounded-2xl border border-white/[0.06]"
        style={{ background: `linear-gradient(135deg, ${dropper.color}12 0%, ${dropper.color}06 30%, #0a0a0a 60%)` }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: dropper.color, opacity: 0.3 }} />
        <div className="relative aspect-square max-h-80 overflow-hidden">
          {song.album_art ? (
            <img src={song.album_art} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <Music size={64} className="text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-2xl font-bold text-white mb-0.5">{song.title}</h2>
            <p className="text-base text-white/60">{song.artist}</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-base font-bold"
              style={{ backgroundColor: dropper.color, color: '#000' }}
            >
              {dropper.display_name[0]}
            </div>
            <div>
              <p className="text-base font-medium text-white/80">{dropper.display_name}</p>
              <p className="text-base text-white/35">{formatTimeAgo(drop.submitted_at)}</p>
            </div>
          </div>
          {drop.caption && (
            <p className="text-base text-white/50 italic leading-relaxed">{'"'}{drop.caption}{'"'}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {song.spotify_url && (
              <a
                href={song.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-base bg-white/[0.06] text-white/60 px-4 py-2 rounded-lg font-medium hover:bg-white/[0.10] transition-colors border border-white/[0.06]"
              >
                <ExternalLink size={16} />
                Spotify
              </a>
            )}
            <a
              href={`https://music.apple.com/us/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-base bg-white/[0.06] text-white/60 px-4 py-2 rounded-lg font-medium hover:bg-white/[0.10] transition-colors border border-white/[0.06]"
            >
              <ExternalLink size={16} />
              Apple Music
            </a>
          </div>
          <DropCard drop={drop} reactionsOnly />
        </div>
      </div>
    </motion.div>
  )
}

/* STATE: Waiting for Drop */
function WaitingState({ group, dropper, shotclock }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-center border border-white/[0.04]"
        style={{ background: `linear-gradient(135deg, ${dropper.color}10 0%, ${dropper.color}05 40%, #0a0a0a 100%)` }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: dropper.color, opacity: 0.25 }} />
        <div className="relative">
          <div className="relative inline-block mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: dropper.color, color: '#000' }}
            >
              {dropper.display_name[0]}
            </div>
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-15"
              style={{ backgroundColor: dropper.color }}
            />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">
            Waiting for {dropper.display_name}
          </h2>
          <p className="text-base text-white/40">
            {shotclock.active ? `${shotclock.remaining} left on the clock` : shotclock.remaining}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
