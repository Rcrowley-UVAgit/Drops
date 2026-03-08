import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isDemoMode } from '../lib/supabase'

export default function Landing() {
  const { signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isDemoMode) {
      signInWithMagicLink(email)
      return
    }
    setLoading(true)
    setError('')
    const { error: authError } = await signInWithMagicLink(email)
    if (authError) setError(authError.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}>
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'rgba(191, 107, 74, 0.06)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-sm text-center space-y-8 relative"
      >
        {/* Logo */}
        <div className="space-y-4">
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            color: 'var(--charcoal)',
            fontSize: '56px',
            letterSpacing: '-0.02em',
          }}>
            Revinyl
          </h1>
          <p className="text-base tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            One song. One friend. Every day.
          </p>
        </div>

        {/* Steps */}
        <div className="flex justify-center gap-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {['Spin', 'Share', 'React'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'rgba(191, 107, 74, 0.1)',
                  color: 'var(--terracotta)',
                  border: '1px solid rgba(191, 107, 74, 0.2)',
                }}>
                {i + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* Auth form */}
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required={!isDemoMode}
              className="w-full rounded-xl px-4 py-3.5 outline-none text-base transition-all"
              style={{
                background: 'var(--bg-subtle)',
                color: 'var(--charcoal)',
                border: '1px solid var(--border)',
              }}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold rounded-xl px-4 py-3.5 text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--terracotta)', color: '#fff' }}
            >
              {isDemoMode ? 'Enter Demo' : loading ? 'Sending...' : 'Get Magic Link'}
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-6 space-y-2"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <p className="font-semibold" style={{ color: 'var(--terracotta)' }}>Check your email</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign-in link sent to <span style={{ color: 'var(--charcoal)' }}>{email}</span>
            </p>
          </motion.div>
        )}

        {isDemoMode && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Demo mode active
          </p>
        )}
      </motion.div>
    </div>
  )
}
