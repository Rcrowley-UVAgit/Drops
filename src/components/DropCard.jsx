import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ExternalLink, Music } from 'lucide-react'
import { formatTimeAgo } from '../lib/utils'
import { openLink } from '../lib/openLink'
import { useGroups } from '../context/GroupsContext'
import Comments from './Comments'
import ReactionBar from './ReactionBar'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DropCard({ drop, index = 0, reactionsOnly = false, members: membersProp }) {
  const [showComments, setShowComments] = useState(false)
  const { members: contextMembers } = useGroups()
  const members = membersProp || contextMembers || []
  const { song, caption, comments = [] } = drop
  const dropper = members.find(m => m.id === drop.user_id) || { display_name: 'Unknown', color: '#6b7280' }

  if (reactionsOnly) {
    return (
      <div className="space-y-3">
        <ReactionBar reactions={drop.reactions} dropId={drop.id} />
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-base transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <MessageCircle size={16} />
          {comments.length > 0
            ? `${comments.length} comment${comments.length > 1 ? 's' : ''}`
            : 'Comment'}
        </button>
        {showComments && <Comments comments={comments} dropId={drop.id} members={members} />}
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
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex gap-3.5 p-4">
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0"
          style={{ background: 'var(--bg-subtle)' }}>
          {song.album_art ? (
            <img src={song.album_art} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold truncate" style={{ color: 'var(--charcoal)' }}>{song.title}</h4>
          <p className="text-base truncate" style={{ color: 'var(--text-secondary)' }}>{song.artist}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-base font-medium" style={{ color: dropper.color }}>{dropper.display_name}</span>
            <span className="text-base" style={{ color: 'var(--text-muted)' }}>{'\u00B7'}</span>
            <span className="text-base" style={{ color: 'var(--text-muted)' }}>{dateStr ? formatDate(dateStr) : formatTimeAgo(drop.submitted_at)}</span>
          </div>
        </div>
      </div>

      {caption && (
        <div className="px-4 pb-2">
          <p className="text-base italic" style={{ color: 'var(--text-secondary)' }}>{'"'}{caption}{'"'}</p>
        </div>
      )}

      <div className="px-4 pb-3.5 pt-2.5 space-y-2.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <ReactionBar reactions={drop.reactions} dropId={drop.id} />
        <div className="flex items-center gap-2 flex-wrap">
          {song.spotify_url && (
            <button
              onClick={() => openLink(song.spotify_url)}
              className="inline-flex items-center gap-1.5 text-base px-3 py-1.5 rounded-md font-medium transition-colors"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              <ExternalLink size={16} />
              Spotify
            </button>
          )}
          <button
            onClick={() => openLink(`https://music.apple.com/us/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}`)}
            className="inline-flex items-center gap-1.5 text-base px-3 py-1.5 rounded-md font-medium transition-colors"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <ExternalLink size={16} />
            Apple Music
          </button>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-base transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          <MessageCircle size={16} />
          {comments.length > 0
            ? `${comments.length} comment${comments.length > 1 ? 's' : ''}`
            : 'Comment'}
        </button>
        {showComments && <Comments comments={comments} dropId={drop.id} members={members} />}
      </div>
    </motion.div>
  )
}
