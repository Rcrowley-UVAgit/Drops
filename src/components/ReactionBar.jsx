import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useGroups } from '../context/GroupsContext'
import { REACTION_TYPES } from '../lib/utils'

export default function ReactionBar({ reactions = [], dropId }) {
  const { user } = useAuth()
  const { toggleReaction, group } = useGroups()

  const reactionCounts = REACTION_TYPES.map(rt => ({
    ...rt,
    count: reactions.filter(r => r.reaction_type === rt.type).length,
  }))

  const handleReaction = async (type) => {
    if (group) {
      await toggleReaction(group.id, dropId, type)
    }
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {reactionCounts.map(({ type, label, count }) => {
        const isActive = user && reactions.some(r => r.reaction_type === type && r.user_id === user.id)
        return (
          <motion.button
            key={type}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReaction(type)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-base font-medium transition-all"
            style={
              isActive
                ? {
                    background: 'rgba(191, 107, 74, 0.15)',
                    color: 'var(--terracotta)',
                    boxShadow: 'inset 0 0 0 1px rgba(191, 107, 74, 0.3)',
                  }
                : count > 0
                  ? {
                      background: 'var(--bg-subtle)',
                      color: 'var(--charcoal)',
                    }
                  : {
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-muted)',
                    }
            }
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
