// ─── Constants ────────────────────────────────────────────────
export const MOOD_TAGS = ['Hype', 'Reflective', 'Late Night', 'Feel Good', 'Heartbreak', 'Energy']

export const MOOD_COLORS = {
  'Hype':       { bg: 'rgba(239, 68, 68, 0.15)',  text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
  'Reflective': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
  'Late Night': { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
  'Feel Good':  { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
  'Heartbreak': { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' },
  'Energy':     { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
}

export const REACTION_TYPES = [
  { type: 'listening', label: 'Listening' },
  { type: 'adding',    label: 'Adding' },
  { type: 'repeat',    label: 'On Repeat' },
  { type: 'new',       label: 'New to Me' },
  { type: 'classic',   label: 'Classic' },
]

// ─── Shotclock Utility ────────────────────────────────────────
export function getShotclock() {
  const now = new Date()
  const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const hours = pst.getHours()
  const minutes = pst.getMinutes()
  const seconds = pst.getSeconds()
  const START = 8, END = 24, TOTAL = (END - START) * 3600

  if (hours < START) {
    const secsUntil = (START - hours) * 3600 - minutes * 60 - seconds
    return { progress: 0, remaining: `Starts in ${Math.floor(secsUntil/3600)}h ${Math.floor((secsUntil%3600)/60)}m`, active: false, hours: Math.floor(secsUntil/3600), minutes: Math.floor((secsUntil%3600)/60), seconds: 0 }
  }
  const elapsed = (hours - START) * 3600 + minutes * 60 + seconds
  if (elapsed >= TOTAL) return { progress: 1, remaining: 'Day ended', active: false, hours: 0, minutes: 0, seconds: 0 }
  const rem = TOTAL - elapsed, h = Math.floor(rem / 3600), m = Math.floor((rem % 3600) / 60), s = rem % 60
  return { progress: elapsed / TOTAL, remaining: `${h}h ${m}m`, active: true, hours: h, minutes: m, seconds: s }
}

// ─── Helpers ──────────────────────────────────────────────────
export function formatTimeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDuration(ms) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}
