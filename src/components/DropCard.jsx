import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ExternalLink, Music } from 'lucide-react'
import { getUser, formatTimeAgo, MOOD_COLORS } from '../lib/demoData'
import ReactionBar from './ReactionBar'
import Comments from './Comments'

export default function DropCard({ drop, index = 0, reactionsOnly = false }) {
  const [showComments, setShowComments] = useState(false)
  const { song, caption, mood_tag, reactions = [], comments = [] } = drop
  const dropper = getUser(drop.user_id)
  const moodStyle = MOOD_COLORS[mood_tag] || {}

  // If reactionsOnly, just show reactions and comments inline (used in GroupPage DroppedState)
  if (reactionsOnly) {
    return (
      <div className="space-y-3">
        <ReactionBar reactions={reactions} dropId={drop.id} />
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
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
      className="bg-[#0f0f0f] rounded-xl border border-white/[0.06] overflow-hidden hover:border-white/[0.1] transition-colors"
    >
      <div className="flex gap-3.5 p-4">
        {/* Album art thumbnail */}
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
          {song.album_art ? (
            <img src={song.album_art} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <Music size={20} className="text-zinc-700" />
            </div>
          )}
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{song.title}</h4>
              <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
            </div>
            {mood_tag && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                style={{ backgroundColor: moodStyle.bg, color: moodStyle.text }}
              >
                {mood_tag}
              </span>
            )}
          </div>

          {/* Dropper + time */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
              style={{ backgroundColor: dropper.color, color: '#000' }}
            >
              {dropper.display_name[0]}
            </div>
            <span className="text-[11px] text-zinc-400">{dropper.display_name}</span>
            <span className="text-[11px] text-zinc-600">·</span>
            <span className="text-[11px] text-zinc-600">{formatTimeAgo(drop.submitted_at)}</span>
          </div>

          {/* Caption */}
          {caption && (
            <p className="text-xs text-zinc-400 italic mt-1.5 line-clamp-1">"{caption}"</p>
          )}
        </div>
      </div>

      {/* Footer: links, reactions, comments */}
      <div className="px-4 pb-3 space-y-2.5">
        {/* Stream link */}
        {song.spotify_url && (
          <a
            href={song.spotify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] bg-[#1DB954]/10 text-[#1DB954] px-2.5 py-1 rounded-full font-medium hover:bg-[#1DB954]/20 transition-colors"
          >
            <ExternalLink size={10} />
            Spotify
          </a>
        )}

        <ReactionBar reactions={reactions} dropId={drop.id} />

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <MessageCircle size={12} />
          {comments.length > 0 ? `${comments.length} comment${comments.length > 1 ? 's' : ''}` : 'Comment'}
        </button>

        {showComments && <Comments comments={comments} dropId={drop.id} />}
      </div>
    </motion.div>
  )
}
