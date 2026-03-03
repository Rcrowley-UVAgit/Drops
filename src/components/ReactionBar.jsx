import { useState } from 'react'
import { motion } from 'framer-motion'
import { REACTION_TYPES, CURRENT_USER } from '../lib/demoData'

export default function ReactionBar({ reactions = [], dropId }) {
  const [localReactions, setLocalReactions] = useState(reactions)

  const reactionCounts = REACTION_TYPES.map(rt => ({
    ...rt,
    count: localReactions.filter(r => r.reaction_type === rt.type).length,
  }))

  const handleReaction = (type) => {
    const existing = localReactions.find(r => r.reaction_type === type && r.user_id === CURRENT_USER.id)
    if (existing) {
      setLocalReactions(prev => prev.filter(r => !(r.reaction_type === type && r.user_id === CURRENT_USER.id)))
    } else {
      setLocalReactions(prev => [...prev, {
        id: `temp-${Date.now()}`,
        user_id: CURRENT_USER.id,
        reaction_type: type,
      }])
    }
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {reactionCounts.map(({ type, label, count }) => {
        const isActive = localReactions.some(r => r.reaction_type === type && r.user_id === CURRENT_USER.id)
        return (
          <motion.button
            key={type}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReaction(type)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              isActive
                ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20'
                : count > 0
                  ? 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]'
                  : 'bg-white/[0.03] text-zinc-600 hover:bg-white/[0.06] hover:text-zinc-400'
            }`}
            title={label}
          >
            <span>{label}</span>
            {count > 0 && <span>{count}</span>}
          </motion.button>
        )
      })}
    </div>
  )
}
