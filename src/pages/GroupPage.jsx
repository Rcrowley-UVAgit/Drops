import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Users, Clock, Music, Search as SearchIcon, ExternalLink, Link2, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { demoGroups, demoPastDrops, getUser, getGroupMembers, getShotclock, formatTimeAgo, MOOD_COLORS, CURRENT_USER } from '../lib/demoData'
import DropCard from '../components/DropCard'

export default function GroupPage() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [shotclock, setShotclock] = useState(getShotclock())
  const [copied, setCopied] = useState(false)

  const group = demoGroups.find(g => g.id === groupId) || demoGroups[0]
  const members = getGroupMembers(group)
  const dropper = getUser(group.today_dropper)
  const pastDrops = demoPastDrops[group.id] || []
  const isMyTurn = group.today_dropper === user?.id

  // Live shotclock
  useEffect(() => {
    const timer = setInterval(() => setShotclock(getShotclock()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(`https://musicdrops.netlify.app/join/${group.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Group Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{group.emoji}</span>
              <h1 className="text-2xl font-bold text-white tracking-tight">{group.name}</h1>
            </div>
            <p className="text-sm text-zinc-500 mt-0.5 ml-10">{group.description}</p>
          </div>
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 text-xs bg-white/[0.06] text-zinc-400 px-3 py-1.5 rounded-full hover:bg-white/[0.1] hover:text-zinc-200 transition-all"
          >
            {copied ? <Check size={12} /> : <Link2 size={12} />}
            {copied ? 'Copied!' : 'Invite'}
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {members.length} members
          </span>
          {group.streak_count > 0 && (
            <span className="flex items-center gap-1 text-amber-500 font-semibold">
              <Flame size={12} />
              {group.streak_count} day streak
            </span>
          )}
          <span>Cycle {group.cycle_index}/{members.length}</span>
        </div>

        {/* Member avatars */}
        <div className="flex items-center gap-1 mt-3">
          {members.map((member, i) => {
            const isCurrent = member.id === group.today_dropper
            const hasGone = i < group.cycle_index
            return (
              <div
                key={member.id}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isCurrent
                    ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-[#060606] scale-110'
                    : ''
                }`}
                style={{
                  backgroundColor: isCurrent ? member.color : hasGone ? '#27272a' : '#18181b',
                  color: isCurrent ? '#000' : hasGone ? '#52525b' : '#a1a1aa',
                }}
                title={`${member.display_name}${isCurrent ? ' (today)' : ''}`}
              >
                {member.display_name[0]}
              </div>
            )
          })}
        </div>
      </div>

      {/* Shotclock bar */}
      <div className="px-6 mb-4">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {shotclock.active ? 'Shotclock' : shotclock.remaining}
          </span>
          {shotclock.active && (
            <span className="font-mono text-zinc-400">{shotclock.remaining}</span>
          )}
        </div>
        <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: shotclock.progress > 0.8
                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              width: `${Math.max(shotclock.progress * 100, 1)}%`,
            }}
            initial={false}
            animate={{ width: `${Math.max(shotclock.progress * 100, 1)}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Main content — different for each state */}
      <div className="px-6 space-y-6">
        {group.drop_status === 'your_turn' && <YourTurnState group={group} navigate={navigate} shotclock={shotclock} />}
        {group.drop_status === 'dropped' && <DroppedState group={group} />}
        {group.drop_status === 'waiting' && <WaitingState group={group} dropper={dropper} shotclock={shotclock} />}

        {/* Past drops */}
        {pastDrops.length > 0 && (
          <div className="space-y-3 pb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Previous Drops</h3>
            {pastDrops.map((drop, i) => (
              <DropCard key={drop.id} drop={drop} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── STATE: Your Turn ─────────────────────────────────────────
function YourTurnState({ group, navigate, shotclock }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent border border-amber-500/20 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-8 translate-x-8" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Your Turn</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">It's your day to drop</h2>
          <p className="text-sm text-zinc-400 mb-5">
            Search for a song and share it with the group{shotclock.active ? ` — ${shotclock.remaining} left` : ''}.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/group/${group.id}/drop`)}
            className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl py-3.5 text-sm transition-colors"
          >
            <SearchIcon size={16} />
            Search & Drop
          </motion.button>
        </div>
      </div>

      {/* How sharing works note */}
      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <span className="text-zinc-300 font-medium">How it works:</span> Search for a song on Spotify, add a caption and mood tag, then share it with your group. Everyone gets until midnight to react and comment.
        </p>
      </div>
    </motion.div>
  )
}

// ─── STATE: Someone Dropped ───────────────────────────────────
function DroppedState({ group }) {
  const drop = group.today_drop
  if (!drop) return null
  const dropper = getUser(drop.user_id)
  const song = drop.song
  const moodStyle = MOOD_COLORS[drop.mood_tag] || {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Today's drop label */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Today's Drop</span>
      </div>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f0f0f] border border-white/[0.06]">
        {/* Album art + gradient */}
        <div className="relative aspect-square max-h-80 overflow-hidden">
          {song.album_art ? (
            <img src={song.album_art} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <Music size={64} className="text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent" />

          {/* Song info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-2xl font-bold text-white mb-0.5">{song.title}</h2>
            <p className="text-zinc-300">{song.artist}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Dropper + mood */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: dropper.color, color: '#000' }}
              >
                {dropper.display_name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">{dropper.display_name}</p>
                <p className="text-[11px] text-zinc-500">{formatTimeAgo(drop.submitted_at)}</p>
              </div>
            </div>
            {drop.mood_tag && (
              <span
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ backgroundColor: moodStyle.bg, color: moodStyle.text, border: `1px solid ${moodStyle.border}` }}
              >
                {drop.mood_tag}
              </span>
            )}
          </div>

          {/* Caption */}
          {drop.caption && (
            <p className="text-sm text-zinc-300 italic leading-relaxed">"{drop.caption}"</p>
          )}

          {/* Spotify link */}
          {song.spotify_url && (
            <a
              href={song.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-[#1DB954]/15 text-[#1DB954] px-4 py-2 rounded-full font-medium hover:bg-[#1DB954]/25 transition-colors"
            >
              <ExternalLink size={14} />
              Play on Spotify
            </a>
          )}

          {/* Reactions */}
          <DropCard drop={drop} reactionsOnly />
        </div>
      </div>
    </motion.div>
  )
}

// ─── STATE: Waiting for Drop ──────────────────────────────────
function WaitingState({ group, dropper, shotclock }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#0f0f0f] border border-white/[0.06] p-8 text-center">
        <div className="absolute top-0 left-1/2 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-24" />
        <div className="relative">
          {/* Dropper avatar with pulse */}
          <div className="relative inline-block mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: dropper.color, color: '#000' }}
            >
              {dropper.display_name[0]}
            </div>
            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: dropper.color }} />
          </div>

          <h2 className="text-lg font-bold text-white mb-1">
            Waiting for {dropper.display_name}
          </h2>
          <p className="text-sm text-zinc-500 mb-4">
            {shotclock.active
              ? `${shotclock.remaining} left on the clock`
              : shotclock.remaining
            }
          </p>

          <div className="inline-flex items-center gap-1.5 text-xs text-zinc-600 bg-white/[0.03] px-3 py-1.5 rounded-full">
            <Clock size={10} />
            Chosen at 8:00 AM PST today
          </div>
        </div>
      </div>
    </motion.div>
  )
}
