import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Music, Search as SearchIcon, ExternalLink, ChevronDown, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useGroups } from '../context/GroupsContext'
import { getShotclock, formatTimeAgo } from '../lib/utils'
import { openLink } from '../lib/openLink'
import DropCard from '../components/DropCard'
import Turntable from '../components/Turntable'
import SongSearch from '../components/SongSearch'

export default function GroupPage() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const { groups, pastDrops: contextPastDrops, loading: groupsLoading } = useGroups()
  const [shotclock, setShotclock] = useState(getShotclock())
  const [membersOpen, setMembersOpen] = useState(false)
  const [phase, setPhase] = useState('turntable') // turntable | your-turn | waiting | dropped
  const [winner, setWinner] = useState(null)
  const [showSongSearch, setShowSongSearch] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [caption, setCaption] = useState('')

  const group = groups.find(g => g.id === groupId) || groups[0] || null
  const members = group?.members || []
  const todayDropper = members.find(m => m.id === group?.today_dropper)
  const pastDrops = contextPastDrops || []
  const spunAlready = group?.drop_status === 'dropped' || group?.drop_status === 'your_turn' || group?.drop_status === 'waiting'

  const allDrops = []
  if (group?.today_drop) allDrops.push(group.today_drop)
  allDrops.push(...pastDrops)

  useEffect(() => {
    const timer = setInterval(() => setShotclock(getShotclock()), 1000)
    return () => clearInterval(timer)
  }, [])

  // If already spun, skip turntable
  useEffect(() => {
    if (spunAlready) {
      if (group.drop_status === 'your_turn') {
        setPhase('your-turn')
        setWinner(user)
      } else if (group.drop_status === 'waiting') {
        setPhase('waiting')
        setWinner(todayDropper)
      } else if (group.drop_status === 'dropped') {
        setPhase('dropped')
      }
    }
  }, [spunAlready, group?.drop_status])

  const handleSpinComplete = useCallback((chosenWinner) => {
    setWinner(chosenWinner)
    if (chosenWinner.id === user?.id) {
      setPhase('your-turn')
    } else {
      setPhase('waiting')
    }
  }, [user])

  const handleSongSelect = (song) => {
    setSelectedSong(song)
    setShowSongSearch(false)
  }

  const handleDrop = () => {
    setPhase('dropped')
  }

  if (!group || groupsLoading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--terracotta)' }} />
          <p className="text-sm">Loading group...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-2xl mx-auto">
        {/* Group Header */}
        <div className="px-5 pt-6 pb-2">
          <h1 style={{ fontFamily: "'Instrument Serif', serif", color: 'var(--charcoal)' }}
            className="text-2xl tracking-tight">{group.name}</h1>
        </div>

        {/* Members chips */}
        <div className="px-5 pb-4">
          <button
            onClick={() => setMembersOpen(!membersOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors"
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Users size={16} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Members</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{members.length}</span>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }}
              className={`transition-transform duration-200 ${membersOpen ? 'rotate-180' : ''}`} />
          </button>
          {membersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="mt-2 flex items-center gap-2 flex-wrap"
            >
              {members.map((member) => {
                const isWinner = winner && member.id === winner.id
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                      background: isWinner ? 'var(--terracotta)' : 'var(--bg-subtle)',
                      color: isWinner ? '#fff' : 'var(--charcoal)',
                      border: `1px solid ${isWinner ? 'var(--terracotta)' : 'var(--border)'}`,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color }} />
                    <span className="text-sm font-medium">
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
          {phase === 'turntable' && !spunAlready && (
            <Turntable members={members} onSpinComplete={handleSpinComplete} disabled={false} />
          )}

          {phase === 'your-turn' && (
            <YourTurnInline
              user={user}
              shotclock={shotclock}
              showSongSearch={showSongSearch}
              setShowSongSearch={setShowSongSearch}
              selectedSong={selectedSong}
              onSongSelect={handleSongSelect}
              caption={caption}
              setCaption={setCaption}
              onDrop={handleDrop}
            />
          )}

          {phase === 'waiting' && winner && (
            <WaitingState dropper={winner} shotclock={shotclock} />
          )}

          {phase === 'dropped' && group.today_drop && (
            <DroppedState group={group} members={members} />
          )}

          {/* Previous drops */}
          {allDrops.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg tracking-tight" style={{ fontFamily: "'Instrument Serif', serif", color: 'var(--text-secondary)' }}>
                  Previous Drops
                </h3>
                <span className="text-sm px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                  {allDrops.length}
                </span>
              </div>
              <div className="space-y-3">
                {allDrops.map((drop, i) => (
                  <DropCard key={drop.id} drop={drop} index={i} members={members} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Song search overlay */}
      <AnimatePresence>
        {showSongSearch && (
          <SongSearch onSelect={handleSongSelect} onClose={() => setShowSongSearch(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* Your Turn — inline song search + drop */
function YourTurnInline({ user, shotclock, showSongSearch, setShowSongSearch, selectedSong, onSongSelect, caption, setCaption, onDrop }) {
  const displayName = user?.display_name || 'You'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {shotclock.active && (
        <ShotclockDisplay shotclock={shotclock} />
      )}

      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--terracotta)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--terracotta)' }}>Your Turn</span>
          </div>
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--charcoal)', fontFamily: "'Instrument Serif', serif" }}>
            {displayName}, it's your day to drop
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            Search for a song and share it with the group.
          </p>

          {selectedSong ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                {selectedSong.album_art ? (
                  <img src={selectedSong.album_art} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--bg-subtle)' }}>
                    <Music size={20} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--charcoal)' }}>{selectedSong.title}</p>
                  <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{selectedSong.artist}</p>
                </div>
                <button onClick={() => setShowSongSearch(true)}
                  className="text-sm font-medium px-3 py-1 rounded-lg"
                  style={{ color: 'var(--terracotta)', background: 'var(--bg)' }}>
                  Change
                </button>
              </div>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption (optional)"
                className="w-full rounded-xl px-4 py-3 outline-none text-sm transition-all"
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--charcoal)',
                  border: '1px solid var(--border)',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDrop}
                className="w-full font-semibold rounded-xl py-3.5 text-sm transition-colors"
                style={{ background: 'var(--terracotta)', color: '#fff' }}
              >
                Drop It
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSongSearch(true)}
              className="flex items-center justify-center gap-2 w-full font-semibold rounded-xl py-3.5 text-sm transition-colors"
              style={{
                background: 'var(--bg-subtle)',
                color: 'var(--charcoal)',
                border: '1px solid var(--border)',
              }}
            >
              <SearchIcon size={16} />
              Search & Drop
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* Shotclock */
function ShotclockDisplay({ shotclock }) {
  if (!shotclock.active) {
    return (
      <div className="rounded-xl p-4 text-center"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{shotclock.remaining}</p>
      </div>
    )
  }

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <Clock size={16} style={{ color: 'var(--text-muted)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Time Remaining</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <TimeUnit value={pad(shotclock.hours)} label="HR" />
        <span className="text-2xl font-light -mt-3" style={{ color: 'var(--border)' }}>:</span>
        <TimeUnit value={pad(shotclock.minutes)} label="MIN" />
        <span className="text-2xl font-light -mt-3" style={{ color: 'var(--border)' }}>:</span>
        <TimeUnit value={pad(shotclock.seconds)} label="SEC" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold font-mono tracking-wider" style={{ color: 'var(--charcoal)' }}>{value}</p>
      <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

/* Dropped state */
function DroppedState({ group, members }) {
  const drop = group.today_drop
  if (!drop) return null
  const dropper = members.find(m => m.id === drop.user_id) || { display_name: 'Unknown', color: '#6b7280' }
  const song = drop.song

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-sm font-semibold text-emerald-600">Today's Drop</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="relative aspect-square max-h-80 overflow-hidden">
          {song.album_art ? (
            <img src={song.album_art} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-subtle)' }}>
              <Music size={64} style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-2xl font-bold text-white mb-0.5">{song.title}</h2>
            <p className="text-sm text-white/80">{song.artist}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div>
              <p className="text-sm font-medium" style={{ color: dropper.color }}>{dropper.display_name}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(drop.submitted_at)}</p>
            </div>
          </div>
          {drop.caption && (
            <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {'"'}{drop.caption}{'"'}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {song.spotify_url && (
              <button onClick={() => openLink(song.spotify_url)}
                className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                <ExternalLink size={16} /> Spotify
              </button>
            )}
            <button onClick={() => openLink(`https://music.apple.com/us/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}`)}
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              <ExternalLink size={16} /> Apple Music
            </button>
          </div>
          <DropCard drop={drop} reactionsOnly members={members} />
        </div>
      </div>
    </motion.div>
  )
}

/* Waiting state */
function WaitingState({ dropper, shotclock }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {shotclock.active && (
        <ShotclockDisplay shotclock={shotclock} />
      )}

      <div className="relative overflow-hidden rounded-2xl p-8 text-center"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="relative">
          <div className="relative inline-block mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: dropper.color, color: '#fff' }}
            >
              {dropper.display_name[0]}
            </div>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: dropper.color,
                animation: 'ring-pulse 2s ease-out infinite',
              }}
            />
          </div>
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--charcoal)', fontFamily: "'Instrument Serif', serif" }}>
            Waiting for {dropper.display_name}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {shotclock.active ? `${shotclock.remaining} left on the clock` : shotclock.remaining}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
