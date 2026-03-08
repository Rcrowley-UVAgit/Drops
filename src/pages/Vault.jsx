import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Music, ExternalLink, X } from 'lucide-react'
import { demoPastDrops, demoGroups, getUser, formatTimeAgo } from '../lib/demoData'

export default function Vault() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDrop, setSelectedDrop] = useState(null)
  const [activeGroup, setActiveGroup] = useState('all')

  const allDrops = useMemo(() => {
    const drops = []
    for (const [groupId, groupDrops] of Object.entries(demoPastDrops)) {
      const group = demoGroups.find(g => g.id === groupId)
      groupDrops.forEach(d => drops.push({ ...d, groupId, groupName: group?.name }))
    }
    const famGroup = demoGroups.find(g => g.id === 'fam')
    if (famGroup?.today_drop) {
      drops.push({ ...famGroup.today_drop, groupId: 'fam', groupName: 'Fam' })
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
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-5"
      style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif", color: 'var(--charcoal)' }}>
          The Vault
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Every drop, archived</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, artists, or members..."
          className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm transition-all"
          style={{
            background: 'var(--bg-subtle)',
            color: 'var(--charcoal)',
            border: '1px solid var(--border)',
          }}
        />
      </div>

      {/* Group filter pills */}
      <div className="flex gap-2">
        <FilterPill label="All" active={activeGroup === 'all'} onClick={() => setActiveGroup('all')} />
        {demoGroups.map(g => (
          <FilterPill key={g.id} label={g.name} active={activeGroup === g.id} onClick={() => setActiveGroup(g.id)} />
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
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: 'var(--bg-subtle)' }}>
                <Music size={24} style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{drop.song.title}</p>
                <p className="text-xs text-white/60 truncate">{drop.song.artist}</p>
              </div>
            </div>
            {selectedDrop?.id === drop.id && (
              <div className="absolute inset-0 rounded-xl"
                style={{ boxShadow: 'inset 0 0 0 2px var(--terracotta)' }} />
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
            className="rounded-2xl p-5 space-y-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {selectedDrop.song.album_art && (
                  <img src={selectedDrop.song.album_art} alt="" className="w-14 h-14 rounded-lg object-cover shadow-lg" />
                )}
                <div className="min-w-0">
                  <h3 className="font-bold truncate" style={{ color: 'var(--charcoal)' }}>{selectedDrop.song.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedDrop.song.artist}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDrop(null)}
                className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm flex-wrap" style={{ color: 'var(--text-secondary)' }}>
              <DropperBadge userId={selectedDrop.user_id} />
              <span>·</span>
              <span>{formatTimeAgo(selectedDrop.submitted_at)}</span>
              {selectedDrop.groupName && (
                <>
                  <span>·</span>
                  <span>{selectedDrop.groupName}</span>
                </>
              )}
            </div>
            {selectedDrop.caption && (
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>"{selectedDrop.caption}"</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedDrop.song.spotify_url && (
                <a
                  href={selectedDrop.song.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm bg-[#1DB954] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#17a34a] transition-colors"
                >
                  <ExternalLink size={14} />
                  Spotify
                </a>
              )}
              <a
                href={`https://music.apple.com/us/search?term=${encodeURIComponent(selectedDrop.song.title + ' ' + selectedDrop.song.artist)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm bg-[#fc3c44] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#e0353d] transition-colors"
              >
                <ExternalLink size={14} />
                Apple Music
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredDrops.length === 0 && (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
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
      className="text-sm px-3 py-1.5 rounded-full font-medium transition-all"
      style={{
        background: active ? 'var(--charcoal)' : 'var(--bg-subtle)',
        color: active ? 'var(--bg)' : 'var(--text-secondary)',
      }}
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
        className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: user.color, color: '#fff' }}
      >
        {user.display_name[0]}
      </span>
      {user.display_name}
    </span>
  )
}
