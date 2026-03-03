import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { demoUsers } from '../lib/demoData'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, auto-login as first user
      setUser(demoUsers[0])
      setLoading(false)
      return
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
          email: session.user.email,
          avatar_url: session.user.user_metadata?.avatar_url,
        })
      }
      setLoading(false)
    }).catch((err) => {
      console.error('Auth session error:', err)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
          email: session.user.email,
          avatar_url: session.user.user_metadata?.avatar_url,
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithMagicLink = async (email) => {
    if (isDemoMode) {
      setUser(demoUsers[0])
      return { error: null }
    }
    const { error } = await supabase.auth.signInWithOtp({ email })
    return { error }
  }

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateDisplayName = async (displayName) => {
    if (isDemoMode) {
      setUser(prev => ({ ...prev, display_name: displayName }))
      return
    }
    await supabase.auth.updateUser({ data: { display_name: displayName } })
    setUser(prev => ({ ...prev, display_name: displayName }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithMagicLink, signOut, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
