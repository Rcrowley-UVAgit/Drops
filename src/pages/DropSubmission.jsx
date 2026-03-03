import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Music, Search as SearchIcon } from 'lucide-react'
import SongSearch from '../components/SongSearch'
import { MOOD_TAGS } from '../lib/demoData'
import { useAuth } from '../context/AuthContext'

export default function DropSubmission() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedSong, setSelectedSong] = useState(null)
  const [caption, setCaption] = useState('')
  const [moodTag, setMoodTag] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSelectSong = (song) => {
    setSelectedSong(song)
    setShowSearch(false)
  }

  const handleSubmit = async () => {
    if (!selectedSong) return
    setSubmitting(true)

    // In real app, this would insert into Supabase drops table
    await new Promise(r => setTimeout(r, 800))
    setSubmitted(true)

    setTimeout(() => navigate('/home'), 2000)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      >
        {selectedSong?.album_art_url && (
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            src={selectedSong.album_art_url}
            alt=""
            className="w-48 h-48 rounded-2xl shadow-2xl shadow-amber-500/20 mb-6"
          />
        )}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-zinc-100 mb-2"
        >
          Your Drop is live!
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-zinc-400 text-sm"
        >
          Your group has been notified.
        </motion.p>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {showSearch && (
        <SongSearch onSelect={handleSelectSong} onClose={() => setShowSearch(false)} />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-6">
        <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-zinc-200">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-zinc-100">Drop Your Song</h1>
      </div>

      <div className="flex-1 px-4 pb-4 space-y-5">
        {/* Song selection */}
        <button
          onClick={() => setShowSearch(true)}
          className="w-full rounded-2xl overflow-hidden text-left"
        >
          {selectedSong ? (
            <div className="relative">
              <div className="aspect-square max-h-64 overflow-hidden rounded-2xl">
                {selectedSong.album_art_url ? (
                  <img src={selectedSong.album_art_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <Music size={48} className="text-zinc-600" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-lg font-bold text-white">{selectedSong.title}</p>
                <p className="text-sm text-zinc-300">{selectedSong.artist}</p>
              </div>
              <div className="absolute top-3 right-3 bg-zinc-900/80 rounded-full px-2.5 py-1 text-[10px] text-zinc-300">
                Tap to change
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-2xl p-12 flex flex-col items-center gap-3">
              <SearchIcon size={32} className="text-zinc-600" />
              <p className="text-sm text-zinc-400">Search for a song</p>
            </div>
          )}
        </button>

        {/* Caption */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-500 font-medium">What does this song mean to you today?</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 140))}
            placeholder="Optional caption..."
            rows={2}
            className="w-full bg-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-amber-500/50 text-sm resize-none"
          />
          <p className="text-right text-[10px] text-zinc-600">{caption.length}/140</p>
        </div>

        {/* Mood tags */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-500 font-medium">Mood</label>
          <div className="flex flex-wrap gap-2">
            {MOOD_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setMoodTag(moodTag === tag ? '' : tag)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  moodTag === tag
                    ? 'bg-amber-500 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!selectedSong || submitting}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-900 font-bold rounded-xl py-3.5 text-sm transition-colors mt-4"
        >
          {submitting ? 'Dropping...' : 'Drop It'}
        </motion.button>
      </div>
    </div>
  )
}
