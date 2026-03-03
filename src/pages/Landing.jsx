import { useState } from 'react'
import { motion } from 'framer-motion'
import { Music, ArrowRight, Disc3 } from 'lucide-react'
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
    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm text-center space-y-8"
      >
        {/* Logo */}
        <div className="space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Disc3 size={64} className="text-amber-500" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100">
            DROPS
          </h1>
          <p className="text-zinc-400 text-sm">
            One song. One friend. Every day.
          </p>
        </div>

        {/* How it works */}
        <div className="flex justify-center gap-6 text-xs text-zinc-500">
          {['Spin', 'Share', 'Discover'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
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
              className="w-full bg-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-xl px-4 py-3 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDemoMode ? 'Enter Demo' : loading ? 'Sending...' : 'Get Magic Link'}
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900 rounded-xl p-6 space-y-2"
          >
            <p className="text-amber-500 font-semibold">Check your email!</p>
            <p className="text-zinc-400 text-sm">
              We sent a sign-in link to <span className="text-zinc-200">{email}</span>
            </p>
          </motion.div>
        )}

        {isDemoMode && (
          <p className="text-xs text-zinc-600">
            Demo mode — no Supabase configured
          </p>
        )}
      </motion.div>
    </div>
  )
}
