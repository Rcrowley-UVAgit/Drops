import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Music, Search as SearchIcon, Check } from 'lucide-react'
import SongSearch from '../components/SongSearch'
import { MOOD_TAGS, MOOD_COLORS } from '../lib/demoData'

export default function DropSubmission() {
  const { groupId } = useParams()
  const navigate = useNavigate()
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
    await new Promise(r => setTimeout(r, 1000))
    setSubmitted(true)
    setTimeout(() => navigate(`/group/${groupId}`), 2500)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
        >
          <Check size={32} className="text-green-400" />
        </motion.div>
        {selectedSong?.album_art && (
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            src={selectedSong.album_art}
            alt=""
            className="w-40 h-40 rounded-2xl shadow-2xl shadow-amber-500/10 mb-5"
          />
        )}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-bold text-white mb-1"
        >
          Drop is live
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-zinc-500"
        >
          {selectedSong?.title} by {selectedSong?.artist}
        </motion.p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-screen">
      <AnimatePresence>
        {showSearch && (
          <SongSearch onSelect={handleSelectSong} onClose={() => setShowSearch(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <button onClick={() => navigate(`/group/${groupId}`)} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-all">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-white">Drop Your Song</h1>
      </div>

      <div className="flex-1 px-6 pb-6 space-y-5">
        {/* Song selection */}
        <button
          onClick={() => setShowSearch(true)}
          className="w-full rounded-2xl overflow-hidden text-left"
        >
          {selectedSong ? (
            <div className="relative group">
              <div className="aspect-video max-h-52 overflow-hidden rounded-2xl">
                {selectedSong.album_art ? (
                  <img src={selectedSong.album_art} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                    <Music size={48} className="text-zinc-700" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-2xl" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-lg font-bold text-white">{selectedSong.title}</p>
                <p className="text-sm text-zinc-300">{selectedSong.artist} · {selectedSong.album}</p>
              </div>
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                Change song
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-dashed border-white/[0.1] rounded-2xl p-12 flex flex-col items-center gap-3 hover:bg-white/[0.05] hover:border-amber-500/30 transition-all">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <SearchIcon size={20} className="text-amber-500" />
              </div>
              <p className="text-sm text-zinc-400">Search Spotify for a song</p>
            </div>
          )}
        </button>

        {/* Caption */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-500 font-medium">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 140))}
            placeholder="What does this song mean to you today?"
            rows={2}
            className="w-full bg-white/[0.04] text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white/[0.06] text-sm resize-none transition-all border border-white/[0.06]"
          />
          <p className="text-right text-[10px] text-zinc-600">{caption.length}/140</p>
        </div>

        {/* Mood tags */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-500 font-medium">Mood</label>
          <div className="flex flex-wrap gap-2">
            {MOOD_TAGS.map((tag) => {
              const isSelected = moodTag === tag
              const style = MOOD_COLORS[tag] || {}
              return (
                <button
                  key={tag}
                  onClick={() => setMoodTag(isSelected ? '' : tag)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={isSelected
                    ? { backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }
                    : { backgroundColor: 'rgba(255,255,255,0.04)', color: '#71717a', border: '1px solid rgba(255,255,255,0.06)' }
                  }
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!selectedSong || submitting}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-white/[0.06] disabled:text-zinc-600 text-black font-bold rounded-xl py-3.5 text-sm transition-all mt-2"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Dropping...
            </span>
          ) : 'Drop It'}
        </motion.button>
      </div>
    </div>
  )
}
