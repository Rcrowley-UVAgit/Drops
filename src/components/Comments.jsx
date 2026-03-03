import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUser, formatTimeAgo } from '../lib/demoData'

export default function Comments({ comments = [], dropId }) {
  const { user } = useAuth()
  const [localComments, setLocalComments] = useState(comments)
  const [newComment, setNewComment] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setLocalComments(prev => [...prev, {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      body: newComment.trim(),
      created_at: new Date().toISOString(),
    }])
    setNewComment('')
  }

  return (
    <div className="space-y-2 pt-1">
      {localComments.map((comment, i) => {
        const commenter = getUser(comment.user_id)
        return (
          <motion.div
            key={comment.id}
            initial={i >= comments.length ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
              style={{ backgroundColor: commenter.color + '33', color: commenter.color }}
            >
              {commenter.display_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] font-semibold text-zinc-300">{commenter.display_name}</span>
                <span className="text-[10px] text-zinc-600">{formatTimeAgo(comment.created_at)}</span>
              </div>
              <p className="text-[11px] text-zinc-400 break-words">{comment.body}</p>
            </div>
          </motion.div>
        )
      })}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-white/[0.04] text-[11px] text-zinc-200 placeholder-zinc-600 rounded-full px-3 py-1.5 outline-none focus:ring-1 focus:ring-amber-500/30"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="text-amber-500 disabled:text-zinc-700 transition-colors"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
