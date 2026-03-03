import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ExternalLink, Music } from 'lucide-react'
import { getUser, formatTimeAgo } from '../lib/demoData'
import ReactionBar from './ReactionBar'
import Comments from './Comments'

// Convert hex color to rgba
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function DropCard({ drop, index = 0, reactionsOnly = false }) {
  const [showComments, setShowComments] = useState(false)
  const { song, caption, reactions = [], comments = [] } = drop
  const dropper = getUser(drop.user_id)
  const c = dropper.color // e.g. '#4CAF50'

  if (reactionsOnly) {
    return (
      <div className="space-y-3">
        <ReactionBar reactions={reactions} dropId={drop.id} />
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-base text-white/60 hover:text-white transition-colors"
        >
          <MessageCircle size={14} />
          {comments.length > 0 ? `${comments.length} comment${comments.length > 1 ? 's' : ''}` : 'Add a comment'}
        </button>
        {showComments && <Comments comments={comments} dropId={drop.id} />}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${hexToRgba(c, 0.25)}`,
        background: `linear-gradient(to bottom right, ${hexToRgba(c, 0.18)}, ${hexToRgba(c, 0.05)}, transparent)`
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-[3px]"
        style={{ background: `linear-gradient(to right, ${c}, ${hexToRgba(c, 0.6)}, transparent)` }}
      />

      <div className="flex gap-4 p-4">
        <div
          className="w-16 h-16 rounded-xl overflow-hidden shrink-0 ring-2 shadow-lg"
          style={{ '--tw-ring-color': hexToRgba(c, 0.35), '--tw-shadow-color': hexToRgba(c, 0.1) }}
        >
          {song.album_art ? (
            <img src={song.album_art} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/[0.06] flex items-center justify-center">
              <Music size={24} className="text-white/20" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="min-w-0">
            <h4 className="text-base font-bold text-white truncate">{song.title}</h4>
            <p className="text-base text-white/70 truncate">{song.artist}</p>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ backgroundColor: c, color: '#000' }}
            >
              {dropper.display_name[0]}
            </div>
            <span className="text-base font-medium" style={{ color: c }}>{dropper.display_name}</span>
            <span className="text-base text-white/30">·</span>
            <span className="text-base text-white/50">{formatTimeAgo(drop.submitted_at)}</span>
          </div>
        </div>
      </div>

      {caption && (
        <div className="px-4 pb-3">
          <p className="text-base text-white/70 italic">"{caption}"</p>
        </div>
      )}

      <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: `1px solid ${hexToRgba(c, 0.12)}` }}>
        <div className="flex items-center gap-2 flex-wrap">
          {song.spotify_url && (
            <a href={song.spotify_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-base bg-[#1DB954] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#17a34a] transition-colors">
              <ExternalLink size={14} /> Spotify
            </a>
          )}
          <a href={`https://music.apple.com/us/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-base bg-[#fc3c44] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#e0353d] transition-colors">
            <ExternalLink size={14} /> Apple Music
          </a>
        </div>
        <ReactionBar reactions={reactions} dropId={drop.id} />
        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-base text-white/60 hover:text-white transition-colors">
          <MessageCircle size={12} />
          {comments.length > 0 ? `${comments.length} comment${comments.length > 1 ? 's' : ''}` : 'Comment'}
        </button>
        {showComments && <Comments comments={comments} dropId={drop.id} />}
      </div>
    </motion.div>
  )
}
