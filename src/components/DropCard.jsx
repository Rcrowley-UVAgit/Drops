import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ExternalLink, Music } from 'lucide-react'
import { getUser, formatTimeAgo } from '../lib/demoData'
import Comments from './Comments'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DropCard({ drop, index = 0, reactionsOnly = false }) {
  const [showComments, setShowComments] = useState(false)
  const { song, caption, comments = [] } = drop
  const dropper = getUser(drop.user_id)

  if (reactionsOnly) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-base text-white/40 hover:text-white/60 transition-colors"
        >
          <MessageCircle size={16} />
          {comments.length > 0
            ? `${comments.length} comment${comments.length > 1 ? 's' : ''}`
            : 'Comment'}
        </button>
        {showComments && <Comments comments={comments} dropId={drop.id} />}
      </div>
    )
  }

  const dateStr = drop.submitted_at || drop.drop_date

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="relative rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex gap-3.5 p-4">
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white/[0.04]">
          {song.album_art ? (
            <img src={song.album_art} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music size={20} className="text-white/15" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-white truncate">{song.title}</h4>
          <p className="text-base text-white/45 truncate">{song.artist}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-base font-medium" style={{ color: dropper.color }}>{dropper.display_name}</span>
            <span className="text-base text-white/20">{'\u00B7'}</span>
            <span className="text-base text-white/30">{dateStr ? formatDate(dateStr) : formatTimeAgo(drop.submitted_at)}</span>
          </div>
        </div>
      </div>

      {caption && (
        <div className="px-4 pb-2">
          <p className="text-base text-white/40 italic">{'"'}{caption}{'"'}</p>
        </div>
      )}

      <div className="px-4 pb-3.5 pt-2.5 space-y-2.5 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 flex-wrap">
          {song.spotify_url && (
            <a
              href={song.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-base text-white/50 border border-white/[0.08] px-3 py-1.5 rounded-md font-medium hover:bg-white/[0.04] transition-colors">
              <ExternalLink size={16} />
              Spotify
            </a>
          )}
          <a
            href={`https://music.apple.com/us/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-base text-white/50 border border-white/[0.08] px-3 py-1.5 rounded-md font-medium hover:bg-white/[0.04] transition-colors">
            <ExternalLink size={16} />
            Apple Music
          </a>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-base text-white/35 hover:text-white/55 transition-colors">
          <MessageCircle size={16} />
          {comments.length > 0
            ? `${comments.length} comment${comments.length > 1 ? 's' : ''}`
            : 'Comment'}
        </button>
        {showComments && <Comments comments={comments} dropId={drop.id} />}
      </div>
    </motion.div>
  )
}
