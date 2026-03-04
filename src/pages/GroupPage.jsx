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
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">{group.name}</h1>
                {group.streak_count > 0 && (
                  <span className="flex items-center gap-1.5 text-accent-400 font-semibold text-sm bg-accent-600/10 px-2.5 py-0.5 rounded-full">
                    {group.streak_count} streak
                  </span>
                )}
              </div>
              <button
                onClick={handleCopyInvite}
                className="flex items-center gap-1.5 text-sm bg-white/[0.06] text-white/70 px-4 py-1.5 rounded-full hover:bg-white/[0.10] transition-all border border-white/[0.06]"
              >
                {copied ? <Check size={13} /> : <Link2 size={13} />}
                {copied ? 'Copied!' : 'Invite'}
              </button>
            </div>
          </div>

          {/* Members dropdown */}
          <div className="px-6 pb-4">
            <button
              onClick={() => setMembersOpen(!membersOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors border border-white/[0.04]"
            >
              <Users size={14} className="text-white/40" />
              <span className="text-sm font-medium text-white/70">Members</span>
              <span className="text-sm text-white/30">{members.length}</span>
              <ChevronDown size={14} className={`text-white/30 transition-transform duration-200 ${membersOpen ? 'rotate-180' : ''}`} />
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
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: member.color, color: '#000' }}
                      >
                        {member.display_name[0]}
                      </div>
                      <span className={`text-sm font-medium ${isDropper ? 'text-accent-400' : 'text-white/70'}`}>
                        {member.display_name}
                      </span>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </div>

          {/* Main content */}
          <div className="px-6 space-y-6 pb-8">
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

            {/* Previous Drops mobile only */}
            <div className="md:hidden">
              {pastDrops.length > 0 && <PreviousDropsPanel pastDrops={pastDrops} />}
            </div>
          </div>
        </div>
      </div>

      {/* DRAG HANDLE */}
      <ResizableHandle onDrag={handleDrag} />

      {/* RIGHT PANE: Previous Drops desktop */}
      <div
        className="hidden md:block overflow-y-auto border-l border-white/[0.06]"
        style={{ width: `${rightPct}%` }}
      >
        <div className="p-5">
          <PreviousDropsPanel pastDrops={pastDrops} />
        </div>
      </div>
    </div>
  )
}

/* Previous Drops Panel */
function PreviousDropsPanel({ pastDrops }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">Previous Drops</h3>
        <span className="text-xs text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-full">{pastDrops.length}</span>
      </div>
      {pastDrops.length > 0 ? (
        <div className="space-y-3">
          {pastDrops.map((drop, i) => (
            <DropCard key={drop.id} drop={drop} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/25 text-center py-8">No drops yet</p>
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

        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-white/[0.06]" />

        {/* Tick marks around the wheel */}
        <svg className="absolute inset-0" width={wheelSize} height={wheelSize}>
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i * 6 - 90) * Math.PI / 180
            const isMajor = i % 5 === 0
            const outerR = radius + 4
            const innerR = radius - (isMajor ? 8 : 4)
            return (
              <line
                key={i}
                x1={center + outerR * Math.cos(angle)}
                y1={center + outerR * Math.sin(angle)}
                x2={center + innerR * Math.cos(angle)}
                y2={center + innerR * Math.sin(angle)}
                stroke={isMajor ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
                strokeWidth={isMajor ? 1.5 : 0.5}
              />
            )
          })}
        </svg>

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
          {members.map((member, i) => {
            const startAngle = i * segAngle - 90
            const endAngle = startAngle + segAngle
            const startRad = (startAngle * Math.PI) / 180
            const endRad = (endAngle * Math.PI) / 180
            const midRad = ((startAngle + endAngle) / 2 * Math.PI) / 180

            const innerRadius = 44
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

            const labelRadius = radius * 0.62
            const labelX = center + labelRadius * Math.cos(midRad)
            const labelY = center + labelRadius * Math.sin(midRad)

            const nameRadius = radius * 0.42
            const nameX = center + nameRadius * Math.cos(midRad)
            const nameY = center + nameRadius * Math.sin(midRad)

            const segOpacity = i % 2 === 0 ? 0.18 : 0.10

            return (
              <g key={member.id}>
                <path
                  d={pathData}
                  fill={member.color}
                  fillOpacity={segOpacity}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="0.5"
                />
                {/* Segment divider line */}
                <line
                  x1={center + innerRadius * Math.cos(startRad)}
                  y1={center + innerRadius * Math.sin(startRad)}
                  x2={center + radius * Math.cos(startRad)}
                  y2={center + radius * Math.sin(startRad)}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="0.5"
                />
                {/* Member initial */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="18"
                  fontWeight="700"
                  fill={member.color}
                  fillOpacity="0.9"
                >
                  {member.display_name[0]}
                </text>
                {/* Name */}
                {segAngle > 25 && (
                  <text
                    x={nameX}
                    y={nameY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="9"
                    fontWeight="500"
                    fill="rgba(255,255,255,0.35)"
                    transform={`rotate(${(startAngle + endAngle) / 2}, ${nameX}, ${nameY})`}
                  >
                    {member.display_name.length > 8 ? member.display_name.slice(0, 7) + '\u2026' : member.display_name}
                  </text>
                )}
              </g>
            )
          })}
          {/* Center hub */}
          <circle cx={center} cy={center} r={42} fill="#0a0a0a" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <circle cx={center} cy={center} r={40} fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="0.5" />
          <circle cx={center} cy={center} r={3} fill="rgba(139,92,246,0.6)" />
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
              <p className="text-[11px] text-white/35 uppercase tracking-[0.2em] font-medium">Today's dropper</p>
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
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
              className={`px-10 py-3.5 rounded-full font-semibold text-sm transition-all ${
                spinning
                  ? 'bg-white/[0.04] text-white/30 cursor-not-allowed border border-white/[0.06]'
                  : 'bg-accent-600 hover:bg-accent-500 text-white shadow-lg shadow-accent-600/20 border border-accent-500/20'
              }`}
            >
              {spinning ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  Spinning\u2026
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
        <p className="text-sm text-white/40">{shotclock.remaining}</p>
      </div>
    )
  }

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/[0.04]">
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <Clock size={12} className="text-white/30" />
        <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">Time Remaining</span>
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
      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/25 mt-0.5">{label}</p>
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
            <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-accent-400 uppercase tracking-[0.15em]">Your Turn</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">{displayName}, it's your day to drop</h2>
          <p className="text-sm text-white/50 mb-5">
            Search for a song and share it with the group.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/group/${group.id}/drop`)}
            className="flex items-center justify-center gap-2 w-full bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-xl py-3.5 text-sm transition-colors"
          >
            <SearchIcon size={15} />
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
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-[0.15em]">Today's Drop</span>
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
            <p className="text-white/60">{song.artist}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ backgroundColor: dropper.color, color: '#000' }}
            >
              {dropper.display_name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">{dropper.display_name}</p>
              <p className="text-xs text-white/35">{formatTimeAgo(drop.submitted_at)}</p>
            </div>
          </div>

          {drop.caption && (
            <p className="text-sm text-white/50 italic leading-relaxed">"{drop.caption}"</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {song.spotify_url && (
              <a
                href={song.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-white/[0.06] text-white/60 px-4 py-2 rounded-lg font-medium hover:bg-white/[0.10] transition-colors border border-white/[0.06]"
              >
                <ExternalLink size={11} />
                Spotify
              </a>
            )}
            <a
              href={`https://music.apple.com/us/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs bg-white/[0.06] text-white/60 px-4 py-2 rounded-lg font-medium hover:bg-white/[0.10] transition-colors border border-white/[0.06]"
            >
              <ExternalLink size={11} />
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
          <p className="text-sm text-white/40">
            {shotclock.active ? `${shotclock.remaining} left on the clock` : shotclock.remaining}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
