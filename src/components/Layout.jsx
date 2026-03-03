import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, Users, User } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/vault', icon: Search, label: 'Vault' },
  { path: '/group/g1', icon: Users, label: 'Group' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-2 py-2 flex justify-around items-center z-50" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path || (path === '/home' && location.pathname === '/home')
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-amber-500' : 'text-zinc-500 active:text-zinc-300'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
