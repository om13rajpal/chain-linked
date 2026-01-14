/**
 * Auth Provider
 * @description React context provider for authentication state
 * @module lib/auth/auth-provider
 */

'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Tables } from '@/types/database'

/**
 * Auth context type definition
 */
interface AuthContextType {
  user: User | null
  profile: Tables<'users'> | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode
}

/**
 * Auth Provider Component
 * Provides authentication state to the entire app
 * @param props - Provider props
 * @returns Auth context provider
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Tables<'users'> | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  /**
   * Fetch user profile from database
   */
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Profile fetch error:', error)
      return null
    }

    return data
  }

  /**
   * Refresh the current user's profile
   */
  const refreshProfile = async () => {
    if (!user) return
    const newProfile = await fetchProfile(user.id)
    setProfile(newProfile)
  }

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  /**
   * Initialize auth state and listen for changes
   */
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()

      if (initialSession?.user) {
        setUser(initialSession.user)
        setSession(initialSession)
        const userProfile = await fetchProfile(initialSession.user.id)
        setProfile(userProfile)
      }

      setIsLoading(false)
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)

        if (newSession?.user) {
          setUser(newSession.user)
          if (event === 'SIGNED_IN') {
            const userProfile = await fetchProfile(newSession.user.id)
            setProfile(userProfile)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuthContext hook
 * @returns Auth context value
 * @throws Error if used outside AuthProvider
 * @example
 * const { user, signOut } = useAuthContext()
 */
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
