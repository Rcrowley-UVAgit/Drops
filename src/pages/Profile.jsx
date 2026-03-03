import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Music, Heart, Hash, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { demoPastDrops, demoGroups, CURRENT_USER, getUser, MOOD_COLORS, formatTimeAgo } from '../lib/demoData'

export default function Profile() {
  const { user, signOut, updateDisplayName } = useAuth()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(user?.display_name || '')

  // Gather all drops by this user across all groups
  const myDrops = useMemo(() => {
    const drops = []
    for (const [groupId, groupDrops] of Object.entries(demoPastDrops)) {
      groupDrops.filter(d => d.user_id === user?.id).forEach(d => {
        const group = demoGroups.find(g => g.id === groupId)
        drops.push({ ...d, groupName: group?.name })
      })
    }
    return drops.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
  }, [user])

  const totalReactions = myDrops.reduce((sum, d) => sum + (d.reactions?.length || 0), 0)
  const groupCount = demoGroups.filter(g => g.members.includes(user?.id)).length
  const moodCounts = {}
  myDrops.forEach(d => { if (d.mood_tag) moodCounts[d.mood_tag] = (moodCounts[d.mood_tag] || 0) + 1 })
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  const handleSaveName = () => {
    if (nameInput.trim()) updateDisplayName(nameInput.trim())
    setEditing(false)
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>

      {/* Avatar + name */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 py-6"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
          style={{ backgroundColor: CURRENT_USER.color + '33', color: CURRENT_USER.color }}
        >
          {user?.display_name?.[0]?.toUpperCase()}
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="bg-white/[0.06] text-white rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-amber-500/30 text-base text-center border border-white/[0.06]"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <button onClick={handleSaveName} className="text-base bg-amber-500 text-black px-3 py-1.5 rounded-lg font-bold">
              Save
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="group text-center">
            <p className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
              {user?.display_name}
            </p>
            <p className="text-base text-white/40 mt-0.5">Tap to edit</p>
          </button>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Music, label: 'Drops', value: myDrops.length },
          { icon: Heart, label: 'Reactions', value: totalReactions },
          { icon: Users, label: 'Groups', value: groupCount },
          { icon: Hash, label: 'Top Mood', value: topMood },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-[#0f0f0f] rounded-xl p-3 text-center border border-white/[0.04]">
            <Icon size={14} className="text-amber-500 mx-auto mb-1.5" />
            <p className="text-base font-bold text-white">{value}</p>
            <p className="text-base text-white/50 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* My drops */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold uppercase tracking-wider text-white/50">My Drops</h3>
        {myDrops.length > 0 ? myDrops.map((drop, i) => {
          const moodStyle = MOOD_COLORS[drop.mood_tag] || {}
          return (
            <motion.div
              key={drop.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 bg-[#0f0f0f] rounded-xl p-3 border border-white/[0.04]"
            >
              {drop.song.album_art ? (
                <img src={drop.song.album_art} alt="" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center">
                  <Music size={16} className="text-white/20" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-white truncate">{drop.song.title}</p>
                <p className="text-base text-white/60 truncate">{drop.song.artist} · {drop.groupName}</p>
              </div>
              {drop.mood_tag && (
                <span
                  className="text-base px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{ backgroundColor: moodStyle.bg, color: moodStyle.text }}
                >
                  {drop.mood_tag}
                </span>
              )}
            </motion.div>
          )
        }) : (
          <p className="text-base text-white/30 py-8 text-center">No drops yet</p>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 text-base text-red-400/80 hover:text-red-400 py-3 transition-colors"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  )
}
