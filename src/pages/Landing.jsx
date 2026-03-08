import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { signInWithCode } = useAuth()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return
    setLoading(true)
    setError('')
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 15000)
      )
      const { error: authError } = await Promise.race([
        signInWithCode(code, name),
        timeout,
      ])
      if (authError) setError(authError.message || 'Something went wrong.')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    }
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
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full rounded-xl px-4 py-3.5 outline-none text-base transition-all"
            style={{
              background: 'var(--bg-subtle)',
              color: 'var(--charcoal)',
              border: '1px solid var(--border)',
            }}
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Invite code"
            required
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
            {loading ? 'Joining...' : 'Join'}
            <ArrowRight size={16} />
          </button>
        </form>
      </motion.div>
    </div>
  )
}
