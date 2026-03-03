import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings, Link2, Check } from 'lucide-react'
import { supabase, isDemoMode } from '../lib/supabase'
import { demoGroup, demoDrops, demoUsers } from '../lib/demoData'
import { useAuth } from '../context/AuthContext'
import GroupHeader from '../components/GroupHeader'
import DropCard from '../components/DropCard'

export default function GroupPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [drops, setDrops] = useState([])
  const [members, setMembers] = useState([])
  const [copied, setCopied] = useState(false)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (isDemoMode) {
      loadDemoData()
      return
    }
    loadRealData()
  }, [user])

  function loadDemoData() {
    setGroup(demoGroup)
    setDrops(demoDrops)
    setMembers(demoUsers)
    const currentUserId = demoGroup.cycle_order[demoGroup.cycle_index]
    setIsMyTurn(currentUserId === user?.id)
    setLoaded(true)
  }

  async function loadRealData() {
    try {
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id, groups(*)')
        .eq('user_id', user?.id)
        .limit(1)

      if (!memberships || memberships.length === 0) {
        loadDemoData()
        return
      }

      const grp = memberships[0].groups
      setGroup(grp)

      const { data: memberData } = await supabase
        .from('group_members')
        .select('user_id, profiles:user_id(id, display_name, avatar_url)')
        .eq('group_id', grp.id)

      if (memberData) {
        setMembers(memberData.map(m => m.profiles))
      }

      const { data: dropData } = await supabase
        .from('drops')
        .select('*, songs:song_id(*), profiles:user_id(display_name, avatar_url), reactions(*), comments(*, profiles:user_id(display_name))')
        .eq('group_id', grp.id)
        .order('submitted_at', { ascending: false })
        .limit(10)

      if (dropData && dropData.length > 0) {
        setDrops(dropData.map(d => ({
          ...d,
          song: d.songs,
          user: { display_name: d.profiles?.display_name, avatar_url: d.profiles?.avatar_url },
          comments: (d.comments || []).map(c => ({ ...c, user: { display_name: c.profiles?.display_name } })),
        })))
      } else {
        // No drops yet — show demo data for drops
        setDrops(demoDrops)
      }

      const cycleOrder = grp.cycle_order || []
      const currentUserId = cycleOrder[grp.cycle_index || 0]
      setIsMyTurn(currentUserId === user?.id)
      setLoaded(true)
    } catch (err) {
      console.error('Error loading group:', err)
      loadDemoData()
    }
  }

  const handleCopyInvite = () => {
    const code = group?.invite_code || 'ABC123'
    navigator.clipboard?.writeText(`https://musicdrops.netlify.app/join/${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="p-4 text-center py-12">
        <p className="text-zinc-500">No group found</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-zinc-100">{group.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full hover:bg-zinc-700 transition-colors"
          >
            {copied ? <Check size={12} /> : <Link2 size={12} />}
            {copied ? 'Copied!' : 'Invite'}
          </button>
          <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <GroupHeader group={group} members={members} />

      {/* Drop your song CTA */}
      {isMyTurn && !drops.find(d => d.drop_date === new Date().toISOString().split('T')[0]) && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/drop')}
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-xl py-3 transition-colors text-sm"
        >
          Drop Your Song
        </motion.button>
      )}

      {/* Drop feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400">Recent Drops</h3>
        {drops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </div>
    </div>
  )
}
