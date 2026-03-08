import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useGroups } from '../context/GroupsContext'
import { formatTimeAgo } from '../lib/utils'

export default function Comments({ comments = [], dropId, members: membersProp }) {
  const { user } = useAuth()
  const { members: contextMembers, addComment, group } = useGroups()
  const members = membersProp || contextMembers || []
  const [newComment, setNewComment] = useState('')

  const getMember = (userId) => members.find(m => m.id === userId) || { display_name: 'Unknown', color: '#6b7280' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    await addComment(group?.id, dropId, newComment.trim())
    setNewComment('')
  }

  return (
    <div className="space-y-2 pt-1">
      {comments.map((comment, i) => {
        const commenter = getMember(comment.user_id)
        return (
          <motion.div
            key={comment.id}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-medium" style={{ color: commenter.color }}>{commenter.display_name}</span>
              <span className="text-base" style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(comment.created_at)}</span>
            </div>
            <p className="text-base break-words" style={{ color: 'var(--text-secondary)' }}>{comment.body}</p>
          </motion.div>
        )
      })}

      <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-base rounded-full px-3 py-1.5 outline-none transition-all"
          style={{
            background: 'var(--bg-subtle)',
            color: 'var(--charcoal)',
            border: '1px solid var(--border)',
          }}
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="transition-colors"
          style={{ color: newComment.trim() ? 'var(--terracotta)' : 'var(--text-muted)' }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
