import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Music, Search as SearchIcon, Check } from 'lucide-react'
import { useGroups } from '../context/GroupsContext'
import SongSearch from '../components/SongSearch'

export default function DropSubmission() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { submitDrop } = useGroups()
  const [selectedSong, setSelectedSong] = useState(null)
  const [caption, setCaption] = useState('')
  const [moodTag, setMoodTag] = useState(null)
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
    const { error } = await submitDrop(groupId, selectedSong, caption, moodTag)
    if (error) {
      console.error('Drop failed:', error)
      setSubmitting(false)
      return
    }
    setSubmitted(true)
    setTimeout(() => navigate(`/group/${groupId}`), 2500)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(34, 197, 94, 0.15)' }}
        >
          <Check size={32} className="text-green-500" />
        </motion.div>
        {selectedSong?.album_art && (
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            src={selectedSong.album_art}
            alt=""
            className="w-40 h-40 rounded-2xl shadow-2xl mb-5"
          />
        )}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-bold mb-1"
          style={{ color: 'var(--charcoal)' }}
        >
          Drop is live
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          {selectedSong?.title} by {selectedSong?.artist}
        </motion.p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      <AnimatePresence>
        {showSearch && (
          <SongSearch onSelect={handleSelectSong} onClose={() => setShowSearch(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <button onClick={() => navigate(`/group/${groupId}`)}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--charcoal)', fontFamily: "'Instrument Serif', serif" }}>
          Drop Your Song
        </h1>
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
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: 'var(--bg-subtle)' }}>
                    <Music size={48} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-2xl" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-lg font-bold text-white">{selectedSong.title}</p>
                <p className="text-base text-white/70">{selectedSong.artist} · {selectedSong.album}</p>
              </div>
              <div className="absolute top-3 right-3 backdrop-blur-sm rounded-full px-2.5 py-1 text-base text-white/70 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
                Change song
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-12 flex flex-col items-center gap-3 transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px dashed var(--border)',
              }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(191, 107, 74, 0.1)' }}>
                <SearchIcon size={20} style={{ color: 'var(--terracotta)' }} />
              </div>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Search Spotify for a song</p>
            </div>
          )}
        </button>

        {/* Caption */}
        <div className="space-y-1.5">
          <label className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 140))}
            placeholder="What does this song mean to you today?"
            rows={2}
            className="w-full rounded-xl px-4 py-3 outline-none text-base resize-none transition-all"
            style={{
              background: 'var(--bg-subtle)',
              color: 'var(--charcoal)',
              border: '1px solid var(--border)',
            }}
          />
          <p className="text-right text-base" style={{ color: 'var(--text-muted)' }}>{caption.length}/140</p>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!selectedSong || submitting}
          className="w-full font-bold rounded-xl py-3.5 text-base transition-all mt-2 disabled:opacity-50"
          style={{
            background: selectedSong && !submitting ? 'var(--terracotta)' : 'var(--bg-subtle)',
            color: selectedSong && !submitting ? '#fff' : 'var(--text-muted)',
          }}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--border)', borderTopColor: 'var(--terracotta)' }} />
              Dropping...
            </span>
          ) : 'Drop It'}
        </motion.button>
      </div>
    </div>
  )
}
