import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Music } from 'lucide-react'
import { demoDrops } from '../lib/demoData'

export default function Vault() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDrop, setSelectedDrop] = useState(null)

  const filteredDrops = demoDrops.filter(d =>
    d.song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-zinc-100">The Vault</h1>
        <p className="text-sm text-zinc-500">Every drop, archived</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, artists, or members..."
          className="w-full bg-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-amber-500/50 text-sm"
        />
      </div>

      {/* Album art grid */}
      <div className="grid grid-cols-3 gap-2">
        {filteredDrops.map((drop, i) => (
          <motion.button
            key={drop.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedDrop(selectedDrop?.id === drop.id ? null : drop)}
            className="relative aspect-square rounded-xl overflow-hidden group"
          >
            {drop.song.album_art_url ? (
              <img src={drop.song.album_art_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <Music size={24} className="text-zinc-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-white truncate">{drop.song.title}</p>
                <p className="text-[9px] text-zinc-300 truncate">{drop.song.artist}</p>
              </div>
            </div>
            {selectedDrop?.id === drop.id && (
              <div className="absolute inset-0 ring-2 ring-amber-500 rounded-xl" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Expanded drop detail */}
      {selectedDrop && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 rounded-2xl p-4 space-y-2"
        >
          <div className="flex items-center gap-3">
            {selectedDrop.song.album_art_url && (
              <img src={selectedDrop.song.album_art_url} alt="" className="w-14 h-14 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-zinc-100 truncate">{selectedDrop.song.title}</h3>
              <p className="text-sm text-zinc-400">{selectedDrop.song.artist}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Dropped by {selectedDrop.user.display_name}</span>
            <span>·</span>
            <span>{formatDate(selectedDrop.drop_date)}</span>
            {selectedDrop.mood_tag && (
              <>
                <span>·</span>
                <span className="text-amber-500">{selectedDrop.mood_tag}</span>
              </>
            )}
          </div>
          {selectedDrop.caption && (
            <p className="text-sm text-zinc-300 italic">"{selectedDrop.caption}"</p>
          )}
          {selectedDrop.song.spotify_track_id && (
            <a
              href={`https://open.spotify.com/track/${selectedDrop.song.spotify_track_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs bg-[#1DB954]/15 text-[#1DB954] px-3 py-1.5 rounded-full font-medium"
            >
              Play on Spotify
            </a>
          )}
        </motion.div>
      )}

      {filteredDrops.length === 0 && (
        <div className="text-center py-12 text-zinc-600 text-sm">
          No drops match your search
        </div>
      )}
    </div>
  )
}
