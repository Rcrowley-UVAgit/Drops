import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Disc3 } from 'lucide-react'
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
    <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-sm text-center space-y-8 relative"
      >
        {/* Logo */}
        <div className="space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Disc3 size={56} className="text-amber-500" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-5xl font-bold tracking-tighter text-white">
            DROPS
          </h1>
          <p className="text-zinc-500 text-sm tracking-wide">
            One song. One friend. Every day.
          </p>
        </div>

        {/* Steps */}
        <div className="flex justify-center gap-8 text-xs text-zinc-500">
          {['Spin', 'Share', 'React'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold border border-amber-500/20">
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
              className="w-full bg-white/[0.04] text-white placeholder-zinc-500 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white/[0.06] text-sm transition-all border border-white/[0.06]"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl px-4 py-3.5 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDemoMode ? 'Enter Demo' : loading ? 'Sending...' : 'Get Magic Link'}
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.04] rounded-xl p-6 space-y-2 border border-white/[0.06]"
          >
            <p className="text-amber-500 font-semibold">Check your email</p>
            <p className="text-zinc-400 text-sm">
              Sign-in link sent to <span className="text-white">{email}</span>
            </p>
          </motion.div>
        )}

        {isDemoMode && (
          <p className="text-xs text-zinc-600">
            Demo mode active
          </p>
        )}
      </motion.div>
    </div>
  )
}
