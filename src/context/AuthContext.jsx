import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { joinWithCode, fetchProfile, updateProfile as apiUpdateProfile } from '../lib/api'
import { initPushNotifications, removePushToken } from '../lib/pushNotifications'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const joiningRef = useRef(false)

  useEffect(() => {
    let mounted = true

    // Force loading to resolve after 3s no matter what
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 3000)

    // Try to restore session — but don't block on it
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!mounted || !session?.user) {
          if (mounted) setLoading(false)
          return
        }
        const { data: profile } = await fetchProfile(session.user.id)
        if (!mounted) return
        if (profile) {
          setUser({
            id: session.user.id,
            display_name: profile.display_name,
            color: profile.color || '#BF6B4A',
          })
          initPushNotifications(session.user.id)
        } else {
          await supabase.auth.signOut()
        }
        setLoading(false)
      })
      .catch(() => {
        if (mounted) setLoading(false)
      })

    // Listen for future auth changes (sign in, sign out)
    // Use { _suppressGetSession: true } to prevent internal getSession call
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || joiningRef.current) return

      // Only react to actual sign-in/sign-out events, not INITIAL_SESSION
      if (event === 'INITIAL_SESSION') return

      if (session?.user) {
        try {
          const { data: profile } = await fetchProfile(session.user.id)
          if (mounted && profile) {
            setUser({
              id: session.user.id,
              display_name: profile.display_name,
              color: profile.color || '#BF6B4A',
            })
          }
        } catch (err) {
          console.error('Auth state change error:', err)
        }
      } else {
        if (mounted) setUser(null)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signInWithCode = async (code, name) => {
    joiningRef.current = true
    const result = await joinWithCode(code, name)
    joiningRef.current = false

    if (result.error) return { error: result.error }

    setUser({
      id: result.data.userId,
      display_name: name.trim(),
      color: '#BF6B4A',
    })
    initPushNotifications(result.data.userId)

    return { error: null }
  }

  const signOut = async () => {
    if (user) await removePushToken(user.id)
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateDisplayName = async (displayName) => {
    const { error } = await apiUpdateProfile(displayName)
    if (!error) {
      setUser(prev => ({ ...prev, display_name: displayName }))
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithCode, signOut, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
