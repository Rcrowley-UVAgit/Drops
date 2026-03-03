import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Comments({ comments = [], dropId }) {
  const { user } = useAuth()
  const [localComments, setLocalComments] = useState(comments)
  const [newComment, setNewComment] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    const comment = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      body: newComment.trim(),
      created_at: new Date().toISOString(),
      user: { display_name: user.display_name },
    }
    setLocalComments(prev => [...prev, comment])
    setNewComment('')
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  return (
    <div className="space-y-2 pt-1">
      {localComments.map((comment, i) => (
        <motion.div
          key={comment.id}
          initial={i >= comments.length ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
            {comment.user?.display_name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-semibold text-zinc-300">{comment.user?.display_name}</span>
              <span className="text-[10px] text-zinc-600">{timeAgo(comment.created_at)}</span>
            </div>
            <p className="text-xs text-zinc-400 break-words">{comment.body}</p>
          </div>
        </motion.div>
      ))}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-zinc-800 text-sm text-zinc-200 placeholder-zinc-600 rounded-full px-3 py-1.5 outline-none focus:ring-1 focus:ring-amber-500/50"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="text-amber-500 disabled:text-zinc-700 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
