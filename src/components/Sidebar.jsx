import { useLocation, useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { useGroups } from '../context/GroupsContext'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { groups } = useGroups()

  const currentGroupId = location.pathname.startsWith('/group/')
    ? location.pathname.split('/group/')[1]?.split('/')[0]
    : null

  return (
    <aside className="sidebar-rail w-52 flex flex-col h-full"
      style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)' }}>
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pt-4">
        {/* Groups section */}
        <div className="mb-1">
          <p className="px-2 py-2 text-lg font-semibold tracking-tight"
            style={{ color: 'var(--text-secondary)' }}>
            Groups
          </p>
          {groups.map((group) => {
            const isActive = currentGroupId === group.id
            const members = group.members || []
            return (
              <button
                key={group.id}
                onClick={() => navigate(`/group/${group.id}`)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-all duration-150 group"
                style={{
                  background: isActive ? 'var(--bg-subtle)' : 'transparent',
                  color: isActive ? 'var(--charcoal)' : 'var(--text-secondary)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{group.name}</p>
                  <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                    {members.length} members
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="mx-2 my-3" style={{ height: 1, background: 'var(--border)' }} />

        {/* Other nav items */}
        <SidebarLink
          icon={User}
          label="Profile"
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
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150"
      style={{
        background: active ? 'var(--bg-subtle)' : 'transparent',
        color: active ? 'var(--charcoal)' : 'var(--text-secondary)',
      }}
    >
      <Icon size={18} strokeWidth={active ? 2 : 1.5} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
