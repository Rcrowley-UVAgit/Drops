import { useState, useEffect, useCallback } from 'react'
import { Search, Music, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isDemoMode } from '../lib/supabase'
import { demoSearchResults } from '../lib/demoData'

export default function SongSearch({ onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const searchSongs = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)

    if (isDemoMode) {
      // Filter demo results by query
      await new Promise(r => setTimeout(r, 300)) // simulate latency
      const filtered = demoSearchResults.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setResults(filtered.length > 0 ? filtered : demoSearchResults)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('search-songs', {
        body: { query: searchQuery },
      })
      if (error) throw error
      setResults(data?.tracks || [])
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) searchSongs(query)
    }, 300) // debounce
    return () => clearTimeout(timer)
  }, [query, searchSongs])

  const formatDuration = (ms) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col">
      {/* Search header */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Search Songs</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={24} />
          </button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by song or artist..."
            autoFocus
            className="w-full bg-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-8 text-zinc-500 text-sm">
            No results found for "{query}"
          </div>
        )}

        <AnimatePresence>
          {results.map((song, i) => (
            <motion.button
              key={song.spotify_track_id || song.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(song)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/80 active:bg-zinc-800 transition-colors text-left"
            >
              {song.album_art_url ? (
                <img src={song.album_art_url} alt={song.title} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Music size={20} className="text-zinc-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">{song.title}</p>
                <p className="text-xs text-zinc-500 truncate">{song.artist} · {song.album}</p>
              </div>
              <span className="text-xs text-zinc-600 shrink-0">
                {song.duration_ms ? formatDuration(song.duration_ms) : ''}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>

        {!query && (
          <div className="text-center py-12 text-zinc-600 text-sm">
            <Music size={32} className="mx-auto mb-3 text-zinc-700" />
            Start typing to search for a song
          </div>
        )}
      </div>
    </div>
  )
}
