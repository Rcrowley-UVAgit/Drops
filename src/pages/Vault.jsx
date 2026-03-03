import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Music, ExternalLink, X } from 'lucide-react'
import { demoPastDrops, demoGroups, getUser, formatTimeAgo, MOOD_COLORS } from '../lib/demoData'

export default function Vault() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDrop, setSelectedDrop] = useState(null)
  const [activeGroup, setActiveGroup] = useState('all')

  // Flatten all drops from all groups
  const allDrops = useMemo(() => {
    const drops = []
    for (const [groupId, groupDrops] of Object.entries(demoPastDrops)) {
      const group = demoGroups.find(g => g.id === groupId)
      groupDrops.forEach(d => drops.push({ ...d, groupId, groupName: group?.name, groupEmoji: group?.emoji }))
    }
    // Also add today's drop from Fam
    const famGroup = demoGroups.find(g => g.id === 'fam')
    if (famGroup?.today_drop) {
      drops.push({ ...famGroup.today_drop, groupId: 'fam', groupName: 'Fam', groupEmoji: '🏠' })
    }
    return drops.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
  }, [])

  const filteredDrops = allDrops.filter(d => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q ||
      d.song.title.toLowerCase().includes(q) ||
      d.song.artist.toLowerCase().includes(q) ||
      getUser(d.user_id).display_name.toLowerCase().includes(q)
    const matchesGroup = activeGroup === 'all' || d.groupId === activeGroup
    return matchesSearch && matchesGroup
  })

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">The Vault</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Every drop, archived</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, artists, or members..."
          className="w-full bg-white/[0.04] text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-amber-500/30 text-sm border border-white/[0.06] transition-all"
        />
      </div>

      {/* Group filter pills */}
      <div className="flex gap-2">
        <FilterPill label="All" active={activeGroup === 'all'} onClick={() => setActiveGroup('all')} />
        {demoGroups.map(g => (
          <FilterPill key={g.id} label={`${g.emoji} ${g.name}`} active={activeGroup === g.id} onClick={() => setActiveGroup(g.id)} />
        ))}
      </div>

      {/* Album art grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {filteredDrops.map((drop, i) => (
          <motion.button
            key={drop.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedDrop(selectedDrop?.id === drop.id ? null : drop)}
            className="relative aspect-square rounded-xl overflow-hidden group"
          >
            {drop.song.album_art ? (
              <img src={drop.song.album_art} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                <Music size={24} className="text-zinc-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-white truncate">{drop.song.title}</p>
                <p className="text-[9px] text-zinc-400 truncate">{drop.song.artist}</p>
              </div>
            </div>
            {selectedDrop?.id === drop.id && (
              <div className="absolute inset-0 ring-2 ring-amber-500 rounded-xl" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {selectedDrop && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="bg-[#0f0f0f] rounded-2xl p-5 space-y-3 border border-white/[0.06]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {selectedDrop.song.album_art && (
                  <img src={selectedDrop.song.album_art} alt="" className="w-14 h-14 rounded-lg object-cover shadow-lg" />
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-white truncate">{selectedDrop.song.title}</h3>
                  <p className="text-sm text-zinc-400">{selectedDrop.song.artist}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDrop(null)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
              <DropperBadge userId={selectedDrop.user_id} />
              <span>·</span>
              <span>{formatTimeAgo(selectedDrop.submitted_at)}</span>
              {selectedDrop.groupEmoji && (
                <>
                  <span>·</span>
                  <span>{selectedDrop.groupEmoji} {selectedDrop.groupName}</span>
                </>
              )}
              {selectedDrop.mood_tag && (
                <>
                  <span>·</span>
                  <span style={{ color: MOOD_COLORS[selectedDrop.mood_tag]?.text }}>{selectedDrop.mood_tag}</span>
                </>
              )}
            </div>
            {selectedDrop.caption && (
              <p className="text-sm text-zinc-300 italic">"{selectedDrop.caption}"</p>
            )}
            {selectedDrop.song.spotify_url && (
              <a
                href={selectedDrop.song.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-[#1DB954]/10 text-[#1DB954] px-3 py-1.5 rounded-full font-medium hover:bg-[#1DB954]/20 transition-colors"
              >
                <ExternalLink size={12} />
                Play on Spotify
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {filteredDrops.length === 0 && (
        <div className="text-center py-16 text-zinc-600 text-sm">
          No drops match your search
        </div>
      )}
    </div>
  )
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
        active
          ? 'bg-white/[0.1] text-white'
          : 'bg-white/[0.03] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]'
      }`}
    >
      {label}
    </button>
  )
}

function DropperBadge({ userId }) {
  const user = getUser(userId)
  return (
    <span className="flex items-center gap-1">
      <span
        className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[7px] font-bold"
        style={{ backgroundColor: user.color, color: '#000' }}
      >
        {user.display_name[0]}
      </span>
      {user.display_name}
    </span>
  )
}
