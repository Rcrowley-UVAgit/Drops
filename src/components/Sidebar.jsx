import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Archive, User } from 'lucide-react'
import { demoGroups, getGroupMembers, CURRENT_USER } from '../lib/demoData'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentGroupId = location.pathname.startsWith('/group/')
    ? location.pathname.split('/group/')[1]?.split('/')[0]
    : null

  return (
    <aside className="sidebar-rail w-52 bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-6">
        <button onClick={() => navigate('/group/uw-lads')} className="group">
          <span className="text-[22px] font-semibold tracking-tight text-white/90">drops</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {/* Groups section */}
        <div className="mb-1">
          <p className="px-2 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white/30">
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
                    ? 'bg-white/[0.07] text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold shrink-0 ${
                    isActive ? 'bg-accent-600/25 text-accent-400' : 'bg-white/[0.06] text-white/40'
                  }`}
                >
                  {group.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{group.name}</p>
                  <p className="text-[11px] text-white/30 truncate">{members.length} members</p>
                </div>
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
            className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold text-zinc-900"
            style={{ backgroundColor: CURRENT_USER.color }}
          >
            {CURRENT_USER.display_name[0]}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-medium text-white/80 truncate">{CURRENT_USER.display_name}</p>
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
          ? 'bg-white/[0.07] text-white'
          : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
      }`}
    >
      <Icon size={15} strokeWidth={active ? 2 : 1.5} />
      <span className="text-[13px] font-medium">{label}</span>
    </button>
  )
}
