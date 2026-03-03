import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Clock, Music, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isDemoMode } from '../lib/supabase'
import { demoGroup, demoDrops, demoUsers } from '../lib/demoData'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [todayDrop, setTodayDrop] = useState(null)
  const [currentDropper, setCurrentDropper] = useState(null)
  const [isMyTurn, setIsMyTurn] = useState(false)

  useEffect(() => {
    if (isDemoMode) {
      setGroup(demoGroup)
      const today = new Date().toISOString().split('T')[0]
      const todaysDrop = demoDrops.find(d => d.drop_date === today)
      setTodayDrop(todaysDrop || null)

      const currentIndex = demoGroup.cycle_index
      const currentUserId = demoGroup.cycle_order[currentIndex]
      const dropper = demoUsers.find(u => u.id === currentUserId)
      setCurrentDropper(dropper)
      setIsMyTurn(currentUserId === user?.id)
    }
  }, [user])

  if (!group) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const hoursLeft = () => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const diff = midnight - now
    const hrs = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    return `${hrs}h ${mins}m`
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-zinc-100">Home</h1>
        <p className="text-sm text-zinc-500">What's dropping today?</p>
      </div>

      {/* Drop day banner */}
      {isMyTurn && !todayDrop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/drop')}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Music size={20} className="text-zinc-900" />
            </div>
            <div>
              <p className="font-bold text-zinc-900">It's your Drop today!</p>
              <p className="text-sm text-zinc-800">Share your song before midnight</p>
            </div>
            <ChevronRight size={20} className="text-zinc-900 ml-auto" />
          </div>
        </motion.button>
      )}

      {/* Group card */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/group/${group.id}`)}
        className="w-full bg-zinc-900 rounded-2xl p-4 text-left space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-zinc-100">{group.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {group.streak_count > 0 && (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                  <Flame size={12} />
                  {group.streak_count}
                </span>
              )}
              <span className="text-xs text-zinc-500">
                {group.cycle_index}/{group.cycle_order.length} this cycle
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-600" />
        </div>

        {/* Today's drop or waiting state */}
        {todayDrop ? (
          <div className="flex items-center gap-3 bg-zinc-800/50 rounded-xl p-3">
            {todayDrop.song.album_art_url && (
              <img src={todayDrop.song.album_art_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{todayDrop.song.title}</p>
              <p className="text-xs text-zinc-500 truncate">{todayDrop.song.artist} · dropped by {todayDrop.user.display_name}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-zinc-800/50 rounded-xl p-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              isMyTurn ? 'bg-amber-500 text-zinc-900 animate-pulse' : 'bg-zinc-700 text-zinc-300'
            }`}>
              {currentDropper?.display_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-zinc-300">
                Waiting for <span className="font-semibold">{isMyTurn ? 'you' : currentDropper?.display_name}</span>
              </p>
              <p className="flex items-center gap-1 text-xs text-zinc-600">
                <Clock size={10} />
                {hoursLeft()} left
              </p>
            </div>
          </div>
        )}

        {/* Cycle progress bar */}
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${(group.cycle_index / group.cycle_order.length) * 100}%` }}
          />
        </div>
      </motion.button>

      {/* Recent drops */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-400">Recent Drops</h3>
        {demoDrops.slice(0, 5).map((drop) => (
          <button
            key={drop.id}
            onClick={() => navigate(`/group/${group.id}`)}
            className="w-full flex items-center gap-3 bg-zinc-900/50 rounded-xl p-3 text-left hover:bg-zinc-900 transition-colors"
          >
            {drop.song.album_art_url && (
              <img src={drop.song.album_art_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200 truncate">{drop.song.title}</p>
              <p className="text-xs text-zinc-500 truncate">{drop.song.artist}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-zinc-500">{drop.user.display_name}</p>
              <p className="text-[10px] text-zinc-600">{drop.mood_tag}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
