import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Music, Heart, Hash, Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { demoDrops, MOOD_TAGS, REACTION_TYPES } from '../lib/demoData'

export default function Profile() {
  const { user, signOut, updateDisplayName } = useAuth()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(user?.display_name || '')

  // Compute stats from demo data
  const myDrops = demoDrops.filter(d => d.user_id === user?.id)
  const totalReactions = myDrops.reduce((sum, d) => sum + (d.reactions?.length || 0), 0)
  const moodCounts = {}
  myDrops.forEach(d => {
    if (d.mood_tag) moodCounts[d.mood_tag] = (moodCounts[d.mood_tag] || 0) + 1
  })
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateDisplayName(nameInput.trim())
    }
    setEditing(false)
  }

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-zinc-100">Profile</h1>
      </div>

      {/* Avatar & name */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 py-4"
      >
        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-3xl font-bold text-amber-500">
          {user?.display_name?.[0]?.toUpperCase()}
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="bg-zinc-800 text-zinc-100 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-amber-500/50 text-sm text-center"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <button
              onClick={handleSaveName}
              className="text-xs bg-amber-500 text-zinc-900 px-3 py-1.5 rounded-lg font-medium"
            >
              Save
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="group">
            <p className="text-xl font-bold text-zinc-100 group-hover:text-amber-500 transition-colors">
              {user?.display_name}
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">Tap to edit</p>
          </button>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Music, label: 'Drops', value: myDrops.length },
          { icon: Heart, label: 'Reactions', value: totalReactions },
          { icon: Hash, label: 'Top Mood', value: topMood },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-zinc-900 rounded-xl p-3 text-center">
            <Icon size={16} className="text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-zinc-100">{value}</p>
            <p className="text-[10px] text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* My drops list */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-400">My Drops</h3>
        {myDrops.length > 0 ? myDrops.map((drop) => (
          <div key={drop.id} className="flex items-center gap-3 bg-zinc-900/50 rounded-xl p-3">
            {drop.song.album_art_url && (
              <img src={drop.song.album_art_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200 truncate">{drop.song.title}</p>
              <p className="text-xs text-zinc-500">{drop.song.artist}</p>
            </div>
            {drop.mood_tag && (
              <span className="text-[10px] text-zinc-500">{drop.mood_tag}</span>
            )}
          </div>
        )) : (
          <p className="text-sm text-zinc-600 py-4 text-center">No drops yet</p>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 py-3 transition-colors"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  )
}
