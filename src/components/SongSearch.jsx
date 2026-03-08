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
      className="fixed inset-0 backdrop-blur-xl z-50 flex flex-col"
      style={{ background: 'rgba(255, 252, 246, 0.97)' }}
    >
      {/* Header */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--charcoal)', fontFamily: "'Instrument Serif', serif" }}>
            Search Songs
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any song..."
            autoFocus
            className="w-full rounded-xl pl-10 pr-4 py-3 outline-none text-sm transition-all"
            style={{
              background: 'var(--bg-subtle)',
              color: 'var(--charcoal)',
              border: '1px solid var(--border)',
            }}
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--terracotta)' }} />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
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
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left group"
              style={{ '--hover-bg': 'var(--bg-subtle)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {song.album_art ? (
                <img src={song.album_art} alt={song.title} className="w-12 h-12 rounded-lg object-cover shadow-lg" />
              ) : (
                <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--bg-subtle)' }}>
                  <Music size={20} style={{ color: 'var(--text-muted)' }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--charcoal)' }}>{song.title}</p>
                <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{song.artist} · {song.album}</p>
              </div>
              <span className="text-sm font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                {song.duration_ms ? formatDuration(song.duration_ms) : ''}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>

        {!query && !loading && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <Music size={36} className="mx-auto mb-3" style={{ color: 'var(--border)' }} />
            <p className="text-sm">Search for a song to drop</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
