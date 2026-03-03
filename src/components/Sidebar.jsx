import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Disc3, Archive, User, ChevronRight, Flame } from 'lucide-react'
import { demoGroups, getGroupMembers, CURRENT_USER } from '../lib/demoData'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentGroupId = location.pathname.startsWith('/group/')
    ? location.pathname.split('/group/')[1]?.split('/')[0]
    : null

  return (
    <aside className="sidebar-rail w-56 bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <button onClick={() => navigate('/group/uw-lads')} className="flex items-center gap-2 group">
          <Disc3 size={22} className="text-amber-500 group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-lg font-bold tracking-tight text-white">DROPS</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {/* Groups section */}
        <div className="mb-1">
          <p className="px-2 py-2 text-base font-semibold uppercase tracking-widest text-white/40">
            Groups
          </p>
          {demoGroups.map((group) => {
            const isActive = currentGroupId === group.id
            const members = getGroupMembers(group)
            return (
              <button
                key={group.id}
                onClick={() => navigate(`/group/${group.id}`)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 group ${
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold shrink-0 ${
                    isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.06] text-white/60'
                  }`}
                >
                  {group.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium truncate">{group.name}</p>
                  <p className="text-base text-white/40 truncate">{members.length} members</p>
                </div>
                {group.streak_count > 0 && (
                  <span className="flex items-center gap-0.5 text-base text-amber-500/80 font-medium shrink-0">
                    <Flame size={10} />
                    {group.streak_count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06] mx-2 my-3" />

        {/* Other nav items */}
        <SidebarLink
          icon={Archive}
          label="Vault"
          path="/vault"
          active={location.pathname === '/vault'}
          onClick={() => navigate('/vault')}
        />
        <SidebarLink
          icon={User}
          label="Profile"
          path="/profile"
          active={location.pathname === '/profile'}
          onClick={() => navigate('/profile')}
        />
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-base font-bold text-zinc-900"
            style={{ backgroundColor: CURRENT_USER.color }}
          >
            {CURRENT_USER.display_name[0]}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-base font-medium text-white truncate">{CURRENT_USER.display_name}</p>
          </div>
        </button>
      </div>
    </aside>
  )
}

function SidebarLink({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${
        active
          ? 'bg-white/[0.08] text-white'
          : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
      }`}
    >
      <Icon size={16} strokeWidth={active ? 2 : 1.5} />
      <span className="text-base font-medium">{label}</span>
    </button>
  )
}
