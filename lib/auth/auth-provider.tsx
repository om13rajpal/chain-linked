/**
 * Auth Provider
 * @description React context provider for authentication state with LinkedIn profile data
 * @module lib/auth/auth-provider
 */

'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Tables } from '@/types/database'

/**
 * LinkedIn profile data type
 * Matches the database schema with extended raw_data typing
 */
export interface LinkedInProfile {
  id: string
  user_id: string
  profile_urn: string | null
  public_identifier: string | null
  first_name: string | null
  last_name: string | null
  headline: string | null
  location: string | null
  industry: string | null
  profile_picture_url: string | null
  background_image_url: string | null
  connections_count: number | null
  followers_count: number | null
  summary: string | null
  raw_data: {
    name?: string
    headline?: string
    profilePhotoUrl?: string
    backgroundPhotoUrl?: string
    location?: string
    industry?: string
    about?: string
    currentCompany?: string
    education?: string
    profileUrl?: string
    [key: string]: unknown
  } | null
  captured_at: string | null
  updated_at: string | null
}

/**
 * LinkedIn analytics data type
 * Note: Numeric fields can be null when data hasn't been captured yet
 */
export interface LinkedInAnalytics {
  id: string
  user_id: string
  page_type: string
  impressions: number | null
  members_reached: number | null
  engagements: number | null
  new_followers: number | null
  profile_views: number | null
  search_appearances: number | null
  top_posts: unknown[]
  raw_data: {
    impressionGrowth?: number
    [key: string]: unknown
  } | null
  captured_at: string | null
  updated_at: string
}

/**
 * Extended user profile with LinkedIn data
 */
export interface UserProfileWithLinkedIn extends Tables<'users'> {
  linkedin_profile?: LinkedInProfile | null
  linkedin_analytics?: LinkedInAnalytics | null
}

/**
 * Auth context type definition
 */
interface AuthContextType {
  user: User | null
  profile: UserProfileWithLinkedIn | null
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
  const [profile, setProfile] = useState<UserProfileWithLinkedIn | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  /**
   * Fetch user profile with LinkedIn data from database
   * @param userId - User ID to fetch profile for
   * @returns User profile with LinkedIn data or null
   */
  const fetchProfile = async (userId: string): Promise<UserProfileWithLinkedIn | null> => {
    // Fetch user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('Profile fetch error:', userError)
      return null
    }

    if (!userProfile) {
      return null
    }

    // Fetch LinkedIn profile
    const { data: linkedinProfile, error: linkedinError } = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (linkedinError && linkedinError.code !== 'PGRST116') {
      console.error('LinkedIn profile fetch error:', linkedinError)
    }

    // Fetch latest LinkedIn analytics
    const { data: linkedinAnalytics, error: analyticsError } = await supabase
      .from('linkedin_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('captured_at', { ascending: false })
      .limit(1)
      .single()

    if (analyticsError && analyticsError.code !== 'PGRST116') {
      console.error('LinkedIn analytics fetch error:', analyticsError)
    }

    // Combine all data with proper type casting
    // The raw_data fields from Supabase are typed as Json, but we know they're objects
    const fullProfile: UserProfileWithLinkedIn = {
      ...userProfile,
      linkedin_profile: linkedinProfile ? {
        ...linkedinProfile,
        raw_data: linkedinProfile.raw_data as LinkedInProfile['raw_data'],
      } : null,
      linkedin_analytics: linkedinAnalytics ? {
        ...linkedinAnalytics,
        raw_data: linkedinAnalytics.raw_data as LinkedInAnalytics['raw_data'],
        top_posts: linkedinAnalytics.top_posts as unknown[],
      } : null,
    }

    return fullProfile
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
   * Uses getSession() for initial load and onAuthStateChange for subsequent changes
   */
  useEffect(() => {
    let isMounted = true
    let initializationComplete = false

    /**
     * Initialize session on mount
     * This is the primary initialization path for page loads/reloads
     */
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session initialization error:', error)
          if (isMounted) {
            setIsLoading(false)
          }
          return
        }

        if (!isMounted) return

        if (session?.user) {
          setSession(session)
          setUser(session.user)

          // Fetch profile with timeout safety
          try {
            const profilePromise = fetchProfile(session.user.id)
            const timeoutPromise = new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
            )

            const userProfile = await Promise.race([profilePromise, timeoutPromise])
            if (isMounted) {
              setProfile(userProfile)
            }
          } catch (profileError) {
            console.error('Profile fetch error during initialization:', profileError)
            // Continue without profile - user is still authenticated
          }
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } catch (err) {
        console.error('Unexpected initialization error:', err)
      } finally {
        if (isMounted) {
          initializationComplete = true
          setIsLoading(false)
        }
      }
    }

    // Listen for auth state changes (for sign-in, sign-out, token refresh after initial load)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Skip INITIAL_SESSION since we handle it via getSession() above
        // This prevents duplicate profile fetches
        if (event === 'INITIAL_SESSION') {
          return
        }

        if (!isMounted) return

        // Update session state
        setSession(newSession)

        if (newSession?.user) {
          setUser(newSession.user)

          // Fetch profile on sign-in or token refresh
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            try {
              const userProfile = await fetchProfile(newSession.user.id)
              if (isMounted) {
                setProfile(userProfile)
              }
            } catch (err) {
              console.error('Profile fetch error on auth change:', err)
            }
          }
        } else {
          setUser(null)
          setProfile(null)
        }

        // Ensure loading is false after any auth event (safety fallback)
        if (isMounted && !initializationComplete) {
          initializationComplete = true
          setIsLoading(false)
        }
      }
    )

    // Start initialization
    initializeSession()

    return () => {
      isMounted = false
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
 * const { user, profile, signOut } = useAuthContext()
 * // Access LinkedIn data
 * const headline = profile?.linkedin_profile?.headline
 * const impressions = profile?.linkedin_analytics?.impressions
 */
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
