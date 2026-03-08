import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Music, Heart, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { demoPastDrops, demoGroups, CURRENT_USER, getUser, formatTimeAgo } from '../lib/demoData'

export default function Profile() {
  const { user, signOut, updateDisplayName } = useAuth()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(user?.display_name || '')

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

  const handleSaveName = () => {
    if (nameInput.trim()) updateDisplayName(nameInput.trim())
    setEditing(false)
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-6 space-y-6"
      style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <h1 className="text-2xl font-bold tracking-tight"
        style={{ fontFamily: "'Instrument Serif', serif", color: 'var(--charcoal)' }}>
        Profile
      </h1>

      {/* Avatar + name */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 py-6"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
          style={{ backgroundColor: 'rgba(191, 107, 74, 0.15)', color: 'var(--terracotta)' }}
        >
          {user?.display_name?.[0]?.toUpperCase()}
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="rounded-lg px-3 py-1.5 outline-none text-sm text-center"
              style={{
                background: 'var(--bg-subtle)',
                color: 'var(--charcoal)',
                border: '1px solid var(--border)',
              }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <button onClick={handleSaveName}
              className="text-sm px-3 py-1.5 rounded-lg font-bold"
              style={{ background: 'var(--terracotta)', color: '#fff' }}>
              Save
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="group text-center">
            <p className="text-xl font-bold transition-colors"
              style={{ color: 'var(--charcoal)' }}>
              {user?.display_name}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Tap to edit</p>
          </button>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Music, label: 'Drops', value: myDrops.length },
          { icon: Heart, label: 'Reactions', value: totalReactions },
          { icon: Users, label: 'Groups', value: groupCount },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl p-3 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Icon size={14} className="mx-auto mb-1.5" style={{ color: 'var(--terracotta)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--charcoal)' }}>{value}</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* My drops */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}>My Drops</h3>
        {myDrops.length > 0 ? myDrops.map((drop, i) => (
          <motion.div
            key={drop.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {drop.song.album_art ? (
              <img src={drop.song.album_art} alt="" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--bg-subtle)' }}>
                <Music size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--charcoal)' }}>{drop.song.title}</p>
              <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{drop.song.artist} · {drop.groupName}</p>
            </div>
          </motion.div>
        )) : (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No drops yet</p>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 text-sm py-3 transition-colors"
        style={{ color: '#C0564A' }}
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  )
}
