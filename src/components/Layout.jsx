import { useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Archive, User, Music } from 'lucide-react'
import { useGroups } from '../context/GroupsContext'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { groups } = useGroups()

  const defaultGroupPath = groups[0] ? `/group/${groups[0].id}` : '/group/uw-lads'

  const MOBILE_NAV = [
    { path: defaultGroupPath, icon: Music, label: 'Groups', matchPrefix: '/group' },
    { path: '/vault', icon: Archive, label: 'Vault' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
      {/* Top Banner */}
      <header className="hidden md:flex items-center px-6 py-4 shrink-0"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(defaultGroupPath)} className="flex items-center gap-2.5 group">
          <span style={{
            fontSize: '26px',
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            color: 'var(--charcoal)',
            letterSpacing: '-0.02em',
          }}>
            Revinyl
          </span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0" style={{ background: 'var(--bg)' }}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-lg px-6 py-2 flex justify-around items-center z-50"
        style={{
          background: 'var(--bg)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        {MOBILE_NAV.map(({ path, icon: Icon, label, matchPrefix }) => {
          const isActive = matchPrefix
            ? location.pathname.startsWith(matchPrefix)
            : location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors"
              style={{ color: isActive ? 'var(--terracotta)' : 'var(--text-muted)' }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// Resizable Pane Divider
export function ResizableHandle({ onDrag, className = '' }) {
  const dragging = useRef(false)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    dragging.current = true
    const startX = e.clientX

    const onMouseMove = (e) => {
      if (!dragging.current) return
      onDrag(e.clientX - startX)
    }
    const onMouseUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [onDrag])

  return (
    <div
      onMouseDown={onMouseDown}
      className={`hidden md:flex flex-col items-center justify-center w-2 cursor-col-resize group transition-colors shrink-0 ${className}`}
      style={{ borderLeft: '1px solid var(--border)' }}
    >
      <div className="w-[2px] h-8 rounded-full transition-colors"
        style={{ background: 'var(--border)' }} />
    </div>
  )
}
