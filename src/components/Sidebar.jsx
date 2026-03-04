import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Zap } from 'lucide-react'
import { demoGroups, getGroupMembers } from '../lib/demoData'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentGroupId = location.pathname.startsWith('/group/')
    ? location.pathname.split('/group/')[1]?.split('/')[0]
    : null

  return (
    <aside className="sidebar-rail w-52 bg-[#060606] border-r border-white/[0.06] flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pt-4">
        {/* Groups section */}
        <div className="mb-1">
          <p className="px-2 py-2 text-lg font-semibold tracking-tight text-white/50">
            Groups
          </p>
          {demoGroups.map((group) => {
            const isActive = currentGroupId === group.id
            const members = getGroupMembers(group)
            return (
              <button
                key={group.id}
                onClick={() => navigate(`/group/${group.id}`)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-all duration-150 group ${
                  isActive
                    ? 'bg-white/[0.07] text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-base font-medium truncate">{group.name}</p>
                    {group.streak_count > 0 && (
                      <span className="flex items-center gap-0.5 text-base font-semibold text-accent-400 shrink-0">
                        <Zap size={14} fill="currentColor" className="text-accent-400" />
                        {group.streak_count}d
                      </span>
                    )}
                  </div>
                  <p className="text-base text-white/30 truncate">{members.length} members</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06] mx-2 my-3" />

        {/* Other nav items */}
        <SidebarLink
          icon={User}
          label="Profile"
          path="/profile"
          active={location.pathname === '/profile'}
          onClick={() => navigate('/profile')}
        />
      </nav>
    </aside>
  )
}

function SidebarLink({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${
        active
          ? 'bg-white/[0.07] text-white'
          : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2 : 1.5} />
      <span className="text-base font-medium">{label}</span>
    </button>
  )
}
