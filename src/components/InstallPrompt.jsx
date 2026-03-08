import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share, Plus, Download } from 'lucide-react'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState(null) // 'ios' | 'android' | 'desktop'
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (window.navigator.standalone === true) return

    // Already dismissed this session
    if (sessionStorage.getItem('install-dismissed')) return

    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream

    if (isIOS) {
      const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)
      if (isSafari) {
        setPlatform('ios')
        setShow(true)
      }
    } else {
      const handler = (e) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setPlatform(/Android/.test(ua) ? 'android' : 'desktop')
        setShow(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setShow(false)
      setDeferredPrompt(null)
    }
  }

  const dismiss = () => {
    setShow(false)
    sessionStorage.setItem('install-dismissed', '1')
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="rounded-2xl p-5 shadow-xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(44, 40, 37, 0.12)',
            }}>
            {/* Close button */}
            <button onClick={dismiss} className="absolute top-3 right-3 p-1 rounded-full transition-colors"
              style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>

            {/* Header */}
            <div className="mb-4">
              <h3 className="text-base font-bold" style={{ color: 'var(--charcoal)' }}>
                Install ReVinyl
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Add to your home screen for the full experience
              </p>
            </div>

            {platform === 'ios' ? (
              /* iOS: step-by-step Safari instructions */
              <div className="space-y-3">
                <Step number={1} icon={<ShareIcon />}>
                  Tap the <strong>Share</strong> button in Safari
                </Step>
                <Step number={2} icon={<Plus size={16} style={{ color: 'var(--terracotta)' }} />}>
                  Scroll down, tap <strong>Add to Home Screen</strong>
                </Step>
                <Step number={3} icon={<Download size={16} style={{ color: 'var(--terracotta)' }} />}>
                  Tap <strong>Add</strong> to install
                </Step>
              </div>
            ) : (
              /* Android/Desktop: one-tap install */
              <button
                onClick={handleInstall}
                className="w-full font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
                style={{ background: 'var(--terracotta)', color: '#fff' }}
              >
                <Download size={16} />
                Install App
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Step({ number, icon, children }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'rgba(191, 107, 74, 0.1)' }}>
        {icon}
      </div>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </p>
    </div>
  )
}

/* Safari share icon (square with arrow) */
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--terracotta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}
