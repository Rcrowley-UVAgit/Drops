import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ExternalLink, Music } from 'lucide-react'
import ReactionBar from './ReactionBar'
import Comments from './Comments'

const MOOD_COLORS = {
  'Hype': 'bg-red-500/20 text-red-400',
  'Reflective': 'bg-blue-500/20 text-blue-400',
  'Late Night': 'bg-purple-500/20 text-purple-400',
  'Feel Good': 'bg-yellow-500/20 text-yellow-400',
  'Heartbreak': 'bg-pink-500/20 text-pink-400',
  'Energy': 'bg-orange-500/20 text-orange-400',
}

export default function DropCard({ drop, compact = false }) {
  const [showComments, setShowComments] = useState(false)
  const { song, user, caption, mood_tag, reactions = [], comments = [] } = drop

  const spotifyUrl = song.spotify_track_id
    ? `https://open.spotify.com/track/${song.spotify_track_id}`
    : null
  const appleMusicSearchUrl = `https://music.apple.com/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}`

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-2xl overflow-hidden"
    >
      {/* Album art header */}
      <div className="relative">
        <div className="aspect-square max-h-72 overflow-hidden">
          {song.album_art_url ? (
            <img src={song.album_art_url} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <Music size={48} className="text-zinc-600" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
        
        {/* Song info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white truncate">{song.title}</h3>
          <p className="text-zinc-300 text-sm">{song.artist}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Dropper info row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-xs font-bold">
              {user.display_name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-zinc-300">{user.display_name}</span>
            <span className="text-xs text-zinc-600">{timeAgo(drop.submitted_at)}</span>
          </div>
          {mood_tag && (
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${MOOD_COLORS[mood_tag] || 'bg-zinc-800 text-zinc-400'}`}>
              {mood_tag}
            </span>
          )}
        </div>

        {/* Caption */}
        {caption && (
          <p className="text-sm text-zinc-300 italic">"{caption}"</p>
        )}

        {/* Stream links */}
        <div className="flex gap-2">
          {spotifyUrl && (
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs bg-[#1DB954]/15 text-[#1DB954] px-3 py-1.5 rounded-full font-medium hover:bg-[#1DB954]/25 transition-colors"
            >
              <ExternalLink size={12} />
              Play on Spotify
            </a>
          )}
          <a
            href={appleMusicSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs bg-pink-500/15 text-pink-400 px-3 py-1.5 rounded-full font-medium hover:bg-pink-500/25 transition-colors"
          >
            <ExternalLink size={12} />
            Apple Music
          </a>
        </div>

        {/* Reactions */}
        <ReactionBar reactions={reactions} dropId={drop.id} />

        {/* Comments toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <MessageCircle size={14} />
          {comments.length > 0 ? `${comments.length} comment${comments.length > 1 ? 's' : ''}` : 'Add a comment'}
        </button>

        {/* Comments section */}
        {showComments && <Comments comments={comments} dropId={drop.id} />}
      </div>
    </motion.div>
  )
}
