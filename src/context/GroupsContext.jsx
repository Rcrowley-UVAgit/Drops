import { createContext, useContext, useState, useCallback } from 'react'
import { demoGroups, demoPastDrops, CURRENT_USER } from '../lib/demoData'

const GroupsContext = createContext({})

export function GroupsProvider({ children }) {
  const [groups, setGroups] = useState(demoGroups)
  const [pastDrops, setPastDrops] = useState(demoPastDrops)

  // Submit a drop for the current user in the given group
  const submitDrop = useCallback((groupId, song, caption, moodTag) => {
    const newDrop = {
      id: `drop-${groupId}-${Date.now()}`,
      user_id: CURRENT_USER.id,
      song,
      caption,
      mood_tag: moodTag || null,
      submitted_at: new Date().toISOString(),
      reactions: [],
      comments: [],
    }

    // Update group: set today_drop and flip status to 'dropped'
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? { ...g, today_drop: newDrop, drop_status: 'dropped' }
          : g
      )
    )

    // Note: We do NOT add to pastDrops here because GroupPage's allDrops
    // already includes today_drop at the top. The drop will move to
    // pastDrops when the day rolls over (in a real backend).

    return newDrop
  }, [])

  // Toggle a reaction on a drop
  const toggleReaction = useCallback((groupId, dropId, reactionType) => {
    const toggle = (drops) =>
      drops.map(d => {
        if (d.id !== dropId) return d
        const existing = d.reactions.find(
          r => r.user_id === CURRENT_USER.id && r.reaction_type === reactionType
        )
        return {
          ...d,
          reactions: existing
            ? d.reactions.filter(r => !(r.user_id === CURRENT_USER.id && r.reaction_type === reactionType))
            : [...d.reactions, { user_id: CURRENT_USER.id, reaction_type: reactionType }],
        }
      })

    // Update today_drop if it matches
    setGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId || !g.today_drop) return g
        if (g.today_drop.id === dropId) {
          const updated = toggle([g.today_drop])[0]
          return { ...g, today_drop: updated }
        }
        return g
      })
    )

    // Update past drops
    setPastDrops(prev => ({
      ...prev,
      [groupId]: toggle(prev[groupId] || []),
    }))
  }, [])

  // Add a comment to a drop
  const addComment = useCallback((groupId, dropId, body) => {
    const newComment = {
      id: `c-${Date.now()}`,
      user_id: CURRENT_USER.id,
      body,
      created_at: new Date().toISOString(),
    }

    const addToDrops = (drops) =>
      drops.map(d =>
        d.id === dropId ? { ...d, comments: [...d.comments, newComment] } : d
      )

    setGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId || !g.today_drop) return g
        if (g.today_drop.id === dropId) {
          return {
            ...g,
            today_drop: { ...g.today_drop, comments: [...g.today_drop.comments, newComment] }
          }
        }
        return g
      })
    )

    setPastDrops(prev => ({
      ...prev,
      [groupId]: addToDrops(prev[groupId] || []),
    }))
  }, [])

  return (
    <GroupsContext.Provider value={{ groups, pastDrops, submitDrop, toggleReaction, addComment }}>
      {children}
    </GroupsContext.Provider>
  )
}

export const useGroups = () => useContext(GroupsContext)
