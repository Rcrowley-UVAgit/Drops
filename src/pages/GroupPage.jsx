import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings, Link2, Check } from 'lucide-react'
import { isDemoMode } from '../lib/supabase'
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

  useEffect(() => {
    if (isDemoMode) {
      setGroup(demoGroup)
      setDrops(demoDrops)
      setMembers(demoUsers)
      const currentUserId = demoGroup.cycle_order[demoGroup.cycle_index]
      setIsMyTurn(currentUserId === user?.id)
    }
  }, [user])

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText('https://drops.app/join/ABC123')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
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
