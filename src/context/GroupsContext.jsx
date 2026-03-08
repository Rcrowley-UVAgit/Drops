import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import {
  fetchUserGroup,
  fetchTodayDrop,
  fetchDrops,
  submitDrop as apiSubmitDrop,
  toggleReaction as apiToggleReaction,
  addComment as apiAddComment,
} from '../lib/api'

const GroupsContext = createContext({})

export function GroupsProvider({ children }) {
  const { user } = useAuth()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [todayDrop, setTodayDrop] = useState(null)
  const [pastDrops, setPastDrops] = useState([])
  const [loading, setLoading] = useState(true)

  // Load group + drops when user is available
  useEffect(() => {
    if (!user) {
      setGroup(null)
      setMembers([])
      setTodayDrop(null)
      setPastDrops([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      const { data: groupData } = await fetchUserGroup()
      if (cancelled) return

      if (groupData) {
        setGroup(groupData)
        setMembers(groupData.members || [])

        const [todayResult, pastResult] = await Promise.all([
          fetchTodayDrop(groupData.id),
          fetchDrops(groupData.id),
        ])
        if (cancelled) return

        setTodayDrop(todayResult.data)
        setPastDrops(pastResult.data || [])
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [user])

  // Realtime subscriptions
  useEffect(() => {
    if (!group) return

    const channel = supabase
      .channel(`group-${group.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drops', filter: `group_id=eq.${group.id}` }, async () => {
        const [todayResult, pastResult] = await Promise.all([
          fetchTodayDrop(group.id),
          fetchDrops(group.id),
        ])
        setTodayDrop(todayResult.data)
        setPastDrops(pastResult.data || [])
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, async () => {
        const [todayResult, pastResult] = await Promise.all([
          fetchTodayDrop(group.id),
          fetchDrops(group.id),
        ])
        setTodayDrop(todayResult.data)
        setPastDrops(pastResult.data || [])
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, async () => {
        const [todayResult, pastResult] = await Promise.all([
          fetchTodayDrop(group.id),
          fetchDrops(group.id),
        ])
        setTodayDrop(todayResult.data)
        setPastDrops(pastResult.data || [])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [group])

  const submitDrop = useCallback(async (groupId, song, caption, moodTag) => {
    const { data, error } = await apiSubmitDrop(groupId, song, caption, moodTag)
    if (!error && data) {
      setTodayDrop(data)
    }
    return { data, error }
  }, [])

  const toggleReaction = useCallback(async (groupId, dropId, reactionType) => {
    await apiToggleReaction(dropId, reactionType)
    // Optimistic update: refetch
    if (group) {
      const [todayResult, pastResult] = await Promise.all([
        fetchTodayDrop(group.id),
        fetchDrops(group.id),
      ])
      setTodayDrop(todayResult.data)
      setPastDrops(pastResult.data || [])
    }
  }, [group])

  const addComment = useCallback(async (groupId, dropId, body) => {
    await apiAddComment(dropId, body)
    // Refetch
    if (group) {
      const [todayResult, pastResult] = await Promise.all([
        fetchTodayDrop(group.id),
        fetchDrops(group.id),
      ])
      setTodayDrop(todayResult.data)
      setPastDrops(pastResult.data || [])
    }
  }, [group])

  // Provide a compatible API shape
  const groups = group ? [{
    id: group.id,
    name: group.name,
    members: members,
    today_dropper: todayDrop?.user_id || null,
    drop_status: todayDrop ? 'dropped' : 'turntable',
    today_drop: todayDrop,
    cycle_index: group.cycle_index || 0,
    cycle_order: group.cycle_order || [],
  }] : []

  return (
    <GroupsContext.Provider value={{
      group,
      groups,
      members,
      todayDrop,
      pastDrops,
      loading: loading,
      submitDrop,
      toggleReaction,
      addComment,
    }}>
      {children}
    </GroupsContext.Provider>
  )
}

export const useGroups = () => useContext(GroupsContext)
