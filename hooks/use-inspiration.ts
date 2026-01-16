/**
 * Inspiration Hook
 * @description Fetches inspiration posts from Supabase
 * @module hooks/use-inspiration
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'
import type { InspirationPost } from '@/components/features/inspiration-feed'
import type { PostSuggestion } from '@/components/features/swipe-interface'

/**
 * Hook return type for inspiration data
 */
interface UseInspirationReturn {
  /** Formatted inspiration posts for the feed */
  posts: InspirationPost[]
  /** Formatted suggestions for swipe interface */
  suggestions: PostSuggestion[]
  /** Raw data from database */
  rawPosts: Tables<'inspiration_posts'>[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Refetch posts */
  refetch: () => Promise<void>
}

/**
 * Hook to fetch inspiration posts from Supabase
 * @param limit - Maximum number of posts to fetch (default: 50)
 * @returns Inspiration data, loading state, and refetch function
 * @example
 * const { posts, suggestions, isLoading, error } = useInspiration(30)
 */
export function useInspiration(limit = 50): UseInspirationReturn {
  const [posts, setPosts] = useState<InspirationPost[]>([])
  const [suggestions, setSuggestions] = useState<PostSuggestion[]>([])
  const [rawPosts, setRawPosts] = useState<Tables<'inspiration_posts'>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  /**
   * Fetch inspiration posts from database
   */
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch inspiration posts ordered by engagement
      const { data: postsData, error: fetchError } = await supabase
        .from('inspiration_posts')
        .select('*')
        .order('engagement_score', { ascending: false, nullsFirst: false })
        .order('reactions', { ascending: false, nullsFirst: false })
        .limit(limit)

      if (fetchError) {
        throw fetchError
      }

      if (!postsData || postsData.length === 0) {
        setPosts([])
        setSuggestions([])
        setRawPosts([])
        setIsLoading(false)
        return
      }

      // Transform to InspirationPost format
      const transformedPosts: InspirationPost[] = postsData.map((post) => ({
        id: post.id,
        author: {
          name: post.author_name || 'Unknown Author',
          headline: post.author_headline || '',
          avatar: post.author_avatar_url || undefined,
        },
        content: post.content,
        category: post.category || 'general',
        metrics: {
          reactions: post.reactions || 0,
          comments: post.comments || 0,
          reposts: post.reposts || 0,
        },
        postedAt: post.posted_at || post.created_at,
      }))

      // Transform to PostSuggestion format for swipe interface
      const transformedSuggestions: PostSuggestion[] = postsData.slice(0, 10).map((post) => ({
        id: post.id,
        content: post.content,
        category: post.category || 'General',
        estimatedEngagement: post.engagement_score || undefined,
      }))

      setPosts(transformedPosts)
      setSuggestions(transformedSuggestions)
      setRawPosts(postsData)
    } catch (err) {
      console.error('Inspiration fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch inspiration posts')
      setPosts([])
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase, limit])

  // Fetch on mount
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    suggestions,
    rawPosts,
    isLoading,
    error,
    refetch: fetchPosts,
  }
}
