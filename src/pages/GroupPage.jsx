import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Clock, Music, Search as SearchIcon, ExternalLink, Link2, Check, ChevronDown, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { demoGroups, demoPastDrops, getUser, getGroupMembers, getShotclock, formatTimeAgo, CURRENT_USER } from '../lib/demoData'
import DropCard from '../components/DropCard'

export default function GroupPage() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate() 
  const [shotclock, setShotclock] = useState(getShotclock())
  const [copied, setCopied] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)

  const group = demoGroups.find(g => g.id === groupId) || demoGroups[0]
  const members = getGroupMembers(group)
  const dropper = getUser(group.today_dropper)
  const pastDrops = demoPastDrops[group.id] || []
  const isMyTurn = group.today_dropper === user?.id

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
      {/* Group Header — name + streak on one line */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{group.name}</h1>
            {group.streak_count > 0 && (
              <span className="flex items-center gap-1 text-amber-500 font-bold text-base">
                <Flame size={16} />
                {group.streak_count}
              </span>
            )}
          </div>
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 text-base bg-white/[0.08] text-white px-4 py-1.5 rounded-full hover:bg-white/[0.12] transition-all"
          >
            {copied ? <Check size={14} /> : <Link2 size={14} />}
            {copied ? 'Copied!' : 'Invite'}
          </button>
        </div>
      </div>

      {/* Members dropdown */}
      <div className="px-6 pb-4">
        <button
          onClick={() => setMembersOpen(!membersOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] transition-colors"
        >
          <Users size={15} className="text-white/60" />
          <span className="text-base font-medium text-white">Members</span>
          <span className="text-base text-white/40">{members.length}</span>
          <ChevronDown
            size={15}
            className={`text-white/40 transition-transform duration-200 ${membersOpen ? 'rotate-180' : ''}`}
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
                    isDropper ? 'bg-amber-500/15 ring-1 ring-amber-500/30' : 'bg-white/[0.06]'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ backgroundColor: member.color, color: '#000' }}
                  >
                    {member.display_name[0]}
                  </div>
                  <span className={`text-base font-medium ${isDropper ? 'text-amber-400' : 'text-white'}`}>
                    {member.display_name}
                  </span>
                </div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Shotclock — only show when waiting or it's your turn, not after drop */}
      {group.drop_status !== 'dropped' && (
        <div className="px-6 mb-5">
          <ShotclockDisplay shotclock={shotclock} />
        </div>
      )}

      {/* Main content */}
      <div className="px-6 space-y-6">
        {group.drop_status === 'your_turn' && <YourTurnState group={group} navigate={navigate} shotclock={shotclock} user={user} />}
        {group.drop_status === 'dropped' && <DroppedState group={group} />}
        {group.drop_status === 'waiting' && <WaitingState group={group} dropper={dropper} shotclock={shotclock} />}

        {/* Past drops */}
        {pastDrops.length > 0 && (
          <div className="pb-8">
            <h3 className="text-base font-bold uppercase tracking-wider text-white mb-4">Previous Drops</h3>
            <div className="space-y-4">
              {pastDrops.map((drop, i) => (
                <DropCard key={drop.id} drop={drop} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shotclock Display ───────────────────────────────────────
function ShotclockDisplay({ shotclock }) {
  if (!shotclock.active) {
    return (
      <div className="bg-white/[0.04] rounded-xl p-4 text-center">
        <p className="text-base text-white/60">{shotclock.remaining}</p>
      </div>
    )
  }

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5">
      <div className="flex items-center justify-center gap-1 mb-2">
        <Clock size={14} className="text-white/50" />
        <span className="text-base font-semibold uppercase tracking-widest text-white/50">Time Remaining</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <TimeUnit value={pad(shotclock.hours)} label="HR" />
        <span className="text-2xl font-light text-white/30 -mt-3">:</span>
        <TimeUnit value={pad(shotclock.minutes)} label="MIN" />
        <span className="text-2xl font-light text-white/30 -mt-3">:</span>
        <TimeUnit value={pad(shotclock.seconds)} label="SEC" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-white font-mono tracking-wider">{value}</p>
      <p className="text-base font-semibold uppercase tracking-widest text-white/40 mt-0.5">{label}</p>
    </div>
  )
}

// ─── STATE: Your Turn ─────────────────────────────────────────
function YourTurnState({ group, navigate, shotclock, user }) {
  const displayName = user?.display_name || 'You'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-8 translate-x-8" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-base font-semibold text-amber-500 uppercase tracking-wider">Your Turn</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{displayName}, it's your day to drop</h2>
          <p className="text-base text-white/70 mb-5">
            Search for a song and share it with the group.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/group/${group.id}/drop`)}
            className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl py-3.5 text-base transition-colors"
          >
            <SearchIcon size={16} />
            Search & Drop
          </motion.button>
        </div>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-base font-semibold text-green-400 uppercase tracking-wider">Today's Drop</span>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${dropper.color}20 0%, ${dropper.color}08 30%, #1a1a1a 60%)`
        }}
      >
        {/* Top accent line in dropper's color */}
        <div className="absolute top-0 left-0 right-0 h-[2px] z-10" style={{ backgroundColor: dropper.color, opacity: 0.5 }} />

        <div className="relative aspect-square max-h-80 overflow-hidden">
          {song.album_art ? (
            <img src={song.album_art} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <Music size={64} className="text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-2xl font-bold text-white mb-0.5">{song.title}</h2>
            <p className="text-white/80">{song.artist}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold"
                style={{ backgroundColor: dropper.color, color: '#000' }}
              >
                {dropper.display_name[0]}
              </div>
              <div>
                <p className="text-base font-medium text-white">{dropper.display_name}</p>
                <p className="text-base text-white/50">{formatTimeAgo(drop.submitted_at)}</p>
              </div>
            </div>
          </div>

          {drop.caption && (
            <p className="text-base text-white/80 italic leading-relaxed">"{drop.caption}"</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {song.spotify_url && (
              <a
                href={song.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-base bg-[#1DB954] text-white px-6 py-3 rounded-full font-bold hover:bg-[#17a34a] transition-colors"
              >
                <ExternalLink size={14} />
                Play on Spotify
              </a>
            )}
            <a
              href={`https://music.apple.com/us/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-base bg-[#fc3c44] text-white px-6 py-3 rounded-full font-bold hover:bg-[#e0353d] transition-colors"
            >
              <ExternalLink size={14} />
              Apple Music
            </a>
          </div>

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
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${dropper.color}18 0%, ${dropper.color}08 40%, #1a1a1a 100%)`
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: dropper.color, opacity: 0.4 }} />
        <div className="relative">
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
          <p className="text-base text-white/60">
            {shotclock.active
              ? `${shotclock.remaining} left on the clock`
              : shotclock.remaining
            }
          </p>
        </div>
      </div>
    </motion.div>
  )
}
