/**
 * Inspiration Hook
 * @description Fetches and manages inspiration posts from Supabase with filtering,
 * pagination, personalization, and save functionality
 * @module hooks/use-inspiration
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'
import type { InspirationPost, InspirationCategory } from '@/components/features/inspiration-feed'
import type { PostSuggestion } from '@/components/features/swipe-interface'

/** Number of posts per page for pagination */
const PAGE_SIZE = 24

/** All available niches for content personalization */
export const AVAILABLE_NICHES = [
  'technology',
  'marketing',
  'sales',
  'leadership',
  'entrepreneurship',
  'finance',
  'healthcare',
  'education',
  'real-estate',
  'consulting',
  'hr',
  'product-management',
  'engineering',
  'design',
  'general',
] as const

/** Niche type derived from available niches */
export type InspirationNiche = (typeof AVAILABLE_NICHES)[number]

/**
 * Filter options for inspiration posts
 */
export interface InspirationFilters {
  /** Category filter - 'all' or specific category */
  category: InspirationCategory | 'all'
  /** Niche filter - 'all' or specific niche */
  niche: InspirationNiche | 'all'
  /** Search query for content/author */
  searchQuery: string
  /** Show only saved posts */
  savedOnly: boolean
}

/**
 * Pagination state
 */
export interface PaginationState {
  /** Current page (0-indexed) */
  page: number
  /** Total number of posts */
  totalCount: number
  /** Whether there are more posts to load */
  hasMore: boolean
  /** Whether currently loading more */
  isLoadingMore: boolean
}

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
  /** Set of saved post IDs */
  savedPostIds: Set<string>
  /** User's niches for personalization */
  userNiches: string[]
  /** Current filters */
  filters: InspirationFilters
  /** Pagination state */
  pagination: PaginationState
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Update filters */
  setFilters: (filters: Partial<InspirationFilters>) => void
  /** Load more posts (pagination) */
  loadMore: () => Promise<void>
  /** Refetch posts */
  refetch: () => Promise<void>
  /** Save swipe preference for AI learning */
  saveSwipePreference: (postId: string, action: 'like' | 'dislike', content?: string) => Promise<void>
  /** Save/bookmark a post */
  savePost: (postId: string) => Promise<void>
  /** Unsave/remove bookmark from a post */
  unsavePost: (postId: string) => Promise<void>
  /** Check if a post is saved */
  isPostSaved: (postId: string) => boolean
  /** Get a single post by ID */
  getPostById: (postId: string) => InspirationPost | undefined
}

/**
 * Default filters
 */
const defaultFilters: InspirationFilters = {
  category: 'all',
  niche: 'all',
  searchQuery: '',
  savedOnly: false,
}

/**
 * Hook to fetch and manage inspiration posts from Supabase
 * @param initialLimit - Initial number of posts to fetch (default: PAGE_SIZE)
 * @returns Inspiration data, loading state, filters, and actions
 * @example
 * const { posts, filters, setFilters, loadMore, savePost } = useInspiration()
 */
export function useInspiration(initialLimit = PAGE_SIZE): UseInspirationReturn {
  // State
  const [posts, setPosts] = useState<InspirationPost[]>([])
  const [suggestions, setSuggestions] = useState<PostSuggestion[]>([])
  const [rawPosts, setRawPosts] = useState<Tables<'inspiration_posts'>[]>([])
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set())
  const [userNiches, setUserNiches] = useState<string[]>([])
  const [filters, setFiltersState] = useState<InspirationFilters>(defaultFilters)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    totalCount: 0,
    hasMore: false,
    isLoadingMore: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  /**
   * Fetch user's saved inspiration posts
   */
  const fetchSavedPosts = useCallback(async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('saved_inspirations')
        .select('inspiration_post_id')
        .eq('user_id', userId)

      if (fetchError) {
        console.error('Error fetching saved posts:', fetchError)
        return
      }

      if (data) {
        setSavedPostIds(new Set(data.map(item => item.inspiration_post_id)))
      }
    } catch (err) {
      console.error('Failed to fetch saved posts:', err)
    }
  }, [supabase])

  /**
   * Fetch user's niches for personalization
   */
  const fetchUserNiches = useCallback(async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('user_niches')
        .select('niche, confidence')
        .eq('user_id', userId)
        .order('confidence', { ascending: false })

      if (fetchError) {
        console.error('Error fetching user niches:', fetchError)
        return
      }

      if (data && data.length > 0) {
        setUserNiches(data.map(item => item.niche))
      }
    } catch (err) {
      console.error('Failed to fetch user niches:', err)
    }
  }, [supabase])

  /**
   * Transform raw post data to InspirationPost format
   */
  const transformPost = useCallback((post: Tables<'inspiration_posts'>): InspirationPost => ({
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
  }), [])

  /**
   * Transform raw post data to PostSuggestion format
   */
  const transformToSuggestion = useCallback((post: Tables<'inspiration_posts'>): PostSuggestion => ({
    id: post.id,
    content: post.content,
    category: post.category || 'General',
    estimatedEngagement: post.engagement_score || undefined,
  }), [])

  /**
   * Fetch inspiration posts from database
   */
  const fetchPosts = useCallback(async (
    page: number = 0,
    append: boolean = false
  ) => {
    try {
      if (!append) {
        setIsLoading(true)
      } else {
        setPagination(prev => ({ ...prev, isLoadingMore: true }))
      }
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()

      // Build query
      let query = supabase
        .from('inspiration_posts')
        .select('*', { count: 'exact' })

      // Apply category filter
      if (filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      // Apply niche filter or use user niches for personalization
      if (filters.niche !== 'all') {
        query = query.eq('niche', filters.niche)
      } else if (userNiches.length > 0 && !filters.savedOnly) {
        // Personalize based on user niches (soft filter - boost, don't exclude)
        // For now, we include all but order by niche match
        query = query.or(`niche.in.(${userNiches.join(',')}),niche.is.null`)
      }

      // Apply search filter
      if (filters.searchQuery.trim()) {
        const searchTerm = `%${filters.searchQuery.trim()}%`
        query = query.or(`content.ilike.${searchTerm},author_name.ilike.${searchTerm},author_headline.ilike.${searchTerm}`)
      }

      // If showing only saved posts, filter by saved IDs
      if (filters.savedOnly && savedPostIds.size > 0) {
        query = query.in('id', Array.from(savedPostIds))
      } else if (filters.savedOnly && savedPostIds.size === 0) {
        // No saved posts, return empty
        setPosts([])
        setSuggestions([])
        setRawPosts([])
        setPagination({
          page: 0,
          totalCount: 0,
          hasMore: false,
          isLoadingMore: false,
        })
        setIsLoading(false)
        return
      }

      // Order by engagement score
      query = query
        .order('engagement_score', { ascending: false, nullsFirst: false })
        .order('reactions', { ascending: false, nullsFirst: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      const { data: postsData, error: fetchError, count } = await query

      if (fetchError) {
        throw fetchError
      }

      if (!postsData) {
        if (!append) {
          setPosts([])
          setSuggestions([])
          setRawPosts([])
        }
        setPagination(prev => ({
          ...prev,
          hasMore: false,
          isLoadingMore: false,
        }))
        setIsLoading(false)
        return
      }

      // Transform posts
      const transformedPosts = postsData.map(transformPost)
      const transformedSuggestions = postsData.slice(0, 10).map(transformToSuggestion)

      if (append) {
        setPosts(prev => [...prev, ...transformedPosts])
        setRawPosts(prev => [...prev, ...postsData])
      } else {
        setPosts(transformedPosts)
        setSuggestions(transformedSuggestions)
        setRawPosts(postsData)
      }

      // Update pagination
      const totalCount = count || 0
      setPagination({
        page,
        totalCount,
        hasMore: (page + 1) * PAGE_SIZE < totalCount,
        isLoadingMore: false,
      })

      // Fetch user data if authenticated
      if (user && page === 0) {
        await Promise.all([
          fetchSavedPosts(user.id),
          fetchUserNiches(user.id),
        ])
      }
    } catch (err) {
      console.error('Inspiration fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch inspiration posts')
      if (!append) {
        setPosts([])
        setSuggestions([])
        setRawPosts([])
      }
    } finally {
      setIsLoading(false)
      setPagination(prev => ({ ...prev, isLoadingMore: false }))
    }
  }, [supabase, filters, savedPostIds, userNiches, transformPost, transformToSuggestion, fetchSavedPosts, fetchUserNiches])

  /**
   * Update filters
   */
  const setFilters = useCallback((newFilters: Partial<InspirationFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, page: 0 }))
  }, [])

  /**
   * Load more posts (pagination)
   */
  const loadMore = useCallback(async () => {
    if (pagination.isLoadingMore || !pagination.hasMore) return
    await fetchPosts(pagination.page + 1, true)
  }, [pagination, fetchPosts])

  /**
   * Save swipe preference to database for AI learning
   */
  const saveSwipePreference = useCallback(async (
    postId: string,
    action: 'like' | 'dislike',
    content?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('User not authenticated, cannot save swipe preference')
        return
      }

      const { error: insertError } = await supabase
        .from('swipe_preferences')
        .insert({
          user_id: user.id,
          post_id: postId,
          suggestion_content: content || null,
          action: action,
        })

      if (insertError) {
        console.error('Error saving swipe preference:', insertError)
      }
    } catch (err) {
      console.error('Swipe preference save error:', err)
    }
  }, [supabase])

  /**
   * Save/bookmark a post
   */
  const savePost = useCallback(async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('User not authenticated, cannot save post')
        return
      }

      const { error: insertError } = await supabase
        .from('saved_inspirations')
        .insert({
          user_id: user.id,
          inspiration_post_id: postId,
        })

      if (insertError) {
        // Check for unique constraint violation (already saved)
        if (insertError.code === '23505') {
          console.warn('Post already saved')
          return
        }
        console.error('Error saving post:', insertError)
        return
      }

      // Update local state
      setSavedPostIds(prev => new Set(prev).add(postId))
    } catch (err) {
      console.error('Save post error:', err)
    }
  }, [supabase])

  /**
   * Unsave/remove bookmark from a post
   */
  const unsavePost = useCallback(async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('User not authenticated, cannot unsave post')
        return
      }

      const { error: deleteError } = await supabase
        .from('saved_inspirations')
        .delete()
        .eq('user_id', user.id)
        .eq('inspiration_post_id', postId)

      if (deleteError) {
        console.error('Error unsaving post:', deleteError)
        return
      }

      // Update local state
      setSavedPostIds(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    } catch (err) {
      console.error('Unsave post error:', err)
    }
  }, [supabase])

  /**
   * Check if a post is saved
   */
  const isPostSaved = useCallback((postId: string): boolean => {
    return savedPostIds.has(postId)
  }, [savedPostIds])

  /**
   * Get a single post by ID
   */
  const getPostById = useCallback((postId: string): InspirationPost | undefined => {
    return posts.find(post => post.id === postId)
  }, [posts])

  /**
   * Refetch posts with current filters
   */
  const refetch = useCallback(async () => {
    await fetchPosts(0, false)
  }, [fetchPosts])

  // Fetch posts on mount and when filters change
  useEffect(() => {
    fetchPosts(0, false)
  }, [filters.category, filters.niche, filters.savedOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.searchQuery !== '') {
        fetchPosts(0, false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters.searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    posts,
    suggestions,
    rawPosts,
    savedPostIds,
    userNiches,
    filters,
    pagination,
    isLoading,
    error,
    setFilters,
    loadMore,
    refetch,
    saveSwipePreference,
    savePost,
    unsavePost,
    isPostSaved,
    getPostById,
  }
}
