import { useState, useEffect, useCallback } from 'react'
import { Search, Music, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDuration } from '../lib/demoData'
import { searchSpotify } from '../lib/spotify'

export default function SongSearch({ onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchSongs = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      setError(null)
      return
    }
    setLoading(true)
    setError(null)

    try {
      const tracks = await searchSpotify(searchQuery)
      if (tracks) {
        setResults(tracks)
      } else {
        setError('Spotify is not connected. Add VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET to your .env file.')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Search failed. Check your Spotify credentials.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => { if (query) searchSongs(query) }, 300)
    return () => clearTimeout(timer)
  }, [query, searchSongs])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#060606]/95 backdrop-blur-xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Search Songs</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any song..."
            autoFocus
            className="w-full bg-white/[0.06] text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white/[0.08] text-sm transition-all"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No results for "{query}"
          </div>
        )}

        <AnimatePresence>
          {results.map((song, i) => (
            <motion.button
              key={song.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect(song)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.08] transition-colors text-left group"
            >
              {song.album_art ? (
                <img src={song.album_art} alt={song.title} className="w-12 h-12 rounded-lg object-cover shadow-lg" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/[0.04] flex items-center justify-center">
                  <Music size={20} className="text-zinc-700" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">{song.title}</p>
                <p className="text-xs text-zinc-500 truncate">{song.artist} · {song.album}</p>
              </div>
              <span className="text-xs text-zinc-600 font-mono shrink-0">
                {song.duration_ms ? formatDuration(song.duration_ms) : ''}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>

        {!query && !loading && (
          <div className="text-center py-16 text-zinc-600">
            <Music size={36} className="mx-auto mb-3 text-zinc-700" />
            <p className="text-sm">Search for a song to drop</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
