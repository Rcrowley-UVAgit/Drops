import { useState, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Archive, User, Music } from 'lucide-react'
import Sidebar from './Sidebar'

const MOBILE_NAV = [
  { path: '/group/uw-lads', icon: Music, label: 'Groups', matchPrefix: '/group' },
  { path: '/vault', icon: Archive, label: 'Vault' },
  { path: '/profile', icon: User, label: 'Profile' },
]

function DropLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 5 10.5 5 15a7 7 0 0 0 14 0c0-4.5-7-13-7-13z" fill="white" />
      <ellipse cx="10.5" cy="16" rx="2" ry="2.5" fill="#060606" opacity="0.35" />
    </svg>
  )
}

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-[#060606]">
      {/* Top Banner */}
      <header className="hidden md:flex items-center px-6 py-4 border-b border-white/[0.06] bg-[#060606] shrink-0">
        <button onClick={() => navigate('/group/uw-lads')} className="flex items-center gap-2.5 group">
          <DropLogo size={26} />
          <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: 'white', fontFamily: "'DM Sans', sans-serif" }}>drops</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 bg-[#111111]">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/[0.06] px-6 py-2 flex justify-around items-center z-50"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {MOBILE_NAV.map(({ path, icon: Icon, label, matchPrefix }) => {
          const isActive = matchPrefix
            ? location.pathname.startsWith(matchPrefix)
            : location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-accent-400' : 'text-white/30 active:text-white/50'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-base font-medium">{label}</span>
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
      className={`hidden md:flex flex-col items-center justify-center w-2 cursor-col-resize group hover:bg-white/[0.03] transition-colors shrink-0 ${className}`}
    >
      <div className="w-[2px] h-8 rounded-full bg-white/[0.06] group-hover:bg-accent-500/30 transition-colors" />
    </div>
  )
}
