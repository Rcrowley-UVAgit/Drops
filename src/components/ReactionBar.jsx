import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { REACTION_TYPES } from '../lib/demoData'

export default function ReactionBar({ reactions = [], dropId }) {
  const [localReactions, setLocalReactions] = useState(reactions)

  const reactionCounts = REACTION_TYPES.map(rt => ({
    ...rt,
    count: localReactions.filter(r => r.reaction_type === rt.type).length,
  }))

  const handleReaction = (type) => {
    // Toggle reaction (in real app, this would call Supabase)
    const existing = localReactions.find(r => r.reaction_type === type && r.user_id === '1')
    if (existing) {
      setLocalReactions(prev => prev.filter(r => r.id !== existing.id))
    } else {
      setLocalReactions(prev => [...prev, {
        id: `temp-${Date.now()}`,
        user_id: '1',
        reaction_type: type,
      }])
    }
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {reactionCounts.map(({ type, emoji, label, count }) => {
        const isActive = localReactions.some(r => r.reaction_type === type && r.user_id === '1')
        return (
          <motion.button
            key={type}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReaction(type)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
              isActive
                ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                : count > 0
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'
            }`}
            title={label}
          >
            <span>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </motion.button>
        )
      })}
    </div>
  )
}
