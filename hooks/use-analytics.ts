/**
 * Analytics Hook
 * @description Fetches LinkedIn analytics data from Supabase
 * @module hooks/use-analytics
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthContext } from '@/lib/auth/auth-provider'
import type { Tables } from '@/types/database'

/**
 * Metric data with value and change percentage
 */
interface MetricData {
  value: number
  change: number
}

/**
 * Aggregated analytics metrics
 */
interface AnalyticsMetrics {
  impressions: MetricData
  engagementRate: MetricData
  followers: MetricData
  profileViews: MetricData
  searchAppearances: MetricData
  connections: MetricData
  membersReached: MetricData
}

/**
 * Analytics metadata
 */
interface AnalyticsMetadata {
  lastUpdated: string | null
  captureMethod: string | null
}

/**
 * Chart data point for time series
 */
interface ChartDataPoint {
  date: string
  impressions: number
  engagements: number
  profileViews: number
}

/**
 * Analytics hook return type
 */
interface UseAnalyticsReturn {
  /** Aggregated analytics metrics */
  metrics: AnalyticsMetrics | null
  /** Chart data for time series */
  chartData: ChartDataPoint[]
  /** Raw analytics records */
  rawData: Tables<'linkedin_analytics'>[]
  /** Analytics metadata (last updated, capture method) */
  metadata: AnalyticsMetadata | null
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Refetch analytics data */
  refetch: () => Promise<void>
}

/**
 * Default metrics when no data is available
 */
const DEFAULT_METRICS: AnalyticsMetrics = {
  impressions: { value: 0, change: 0 },
  engagementRate: { value: 0, change: 0 },
  followers: { value: 0, change: 0 },
  profileViews: { value: 0, change: 0 },
  searchAppearances: { value: 0, change: 0 },
  connections: { value: 0, change: 0 },
  membersReached: { value: 0, change: 0 },
}

/**
 * Demo metrics for when database is empty or unavailable
 */
const DEMO_METRICS: AnalyticsMetrics = {
  impressions: { value: 12450, change: 12.5 },
  engagementRate: { value: 4.8, change: 0.3 },
  followers: { value: 2847, change: 8.2 },
  profileViews: { value: 892, change: 15.7 },
  searchAppearances: { value: 156, change: 5.4 },
  connections: { value: 1250, change: 3.1 },
  membersReached: { value: 8920, change: 10.2 },
}

/**
 * Demo chart data for visualization
 */
const DEMO_CHART_DATA: ChartDataPoint[] = [
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], impressions: 8500, engagements: 340, profileViews: 620 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], impressions: 9200, engagements: 410, profileViews: 680 },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], impressions: 10100, engagements: 480, profileViews: 750 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], impressions: 9800, engagements: 420, profileViews: 710 },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], impressions: 11200, engagements: 520, profileViews: 820 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], impressions: 11800, engagements: 560, profileViews: 870 },
  { date: new Date().toISOString().split('T')[0], impressions: 12450, engagements: 598, profileViews: 892 },
]

/**
 * Hook to fetch and manage LinkedIn analytics data
 * @param userId - User ID to fetch analytics for (optional, uses current user if not provided)
 * @returns Analytics data, loading state, and refetch function
 * @example
 * const { metrics, chartData, isLoading, error } = useAnalytics()
 */
export function useAnalytics(userId?: string): UseAnalyticsReturn {
  // Get auth state from context - this is the key fix
  const { user, isLoading: authLoading } = useAuthContext()

  // State initialization - start with null, will be set based on auth state
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [rawData, setRawData] = useState<Tables<'linkedin_analytics'>[]>([])
  const [metadata, setMetadata] = useState<AnalyticsMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start true while waiting for auth
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  /**
   * Fetch analytics data from Supabase
   */
  const fetchAnalytics = useCallback(async () => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      return
    }

    // Determine target user ID
    const targetUserId = userId || user?.id

    // If no user (not authenticated), show demo data
    if (!targetUserId) {
      setMetrics(DEMO_METRICS)
      setChartData(DEMO_CHART_DATA)
      setMetadata({ lastUpdated: new Date().toISOString(), captureMethod: 'demo' })
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Fetch all analytics records for charting, ordered by captured_at
      const { data: analytics, error: fetchError } = await supabase
        .from('linkedin_analytics')
        .select('*')
        .eq('user_id', targetUserId)
        .order('captured_at', { ascending: false })

      // If table doesn't exist or other error, use demo data
      if (fetchError) {
        console.warn('Analytics fetch warning (using demo data):', fetchError.message)
        setMetrics(DEMO_METRICS)
        setChartData(DEMO_CHART_DATA)
        setMetadata({ lastUpdated: new Date().toISOString(), captureMethod: 'demo' })
        setIsLoading(false)
        return
      }

      // Also fetch profile data for accurate follower count
      const { data: profile, error: profileError } = await supabase
        .from('linkedin_profiles')
        .select('followers_count, connections_count')
        .eq('user_id', targetUserId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Profile fetch warning:', profileError)
      }

      if (!analytics || analytics.length === 0) {
        // No analytics data - use demo data for better UX
        console.info('No analytics data found, showing demo data')
        setMetrics(DEMO_METRICS)
        setChartData(DEMO_CHART_DATA)
        setMetadata({ lastUpdated: new Date().toISOString(), captureMethod: 'demo' })
        setRawData([])
        setIsLoading(false)
        return
      }

      setRawData(analytics)

      // Use the LATEST analytics record for current metrics (first one since ordered desc)
      const latestAnalytics = analytics[0]

      // Extract data from raw_data if available
      const rawDataObj = latestAnalytics.raw_data as {
        impressionGrowth?: number
        captureMethod?: string
        last_updated?: string
        extractedAt?: string
      } | null
      const impressionGrowth = rawDataObj?.impressionGrowth ?? 0

      // Calculate engagement rate (engagements / impressions * 100)
      const impressions = latestAnalytics.impressions || 0
      const engagements = latestAnalytics.engagements || 0
      const engagementRate = impressions > 0 ? (engagements / impressions) * 100 : 0

      // Use profile followers_count for accurate total followers
      const totalFollowers = profile?.followers_count || latestAnalytics.new_followers || 0
      const totalConnections = profile?.connections_count || 0

      const aggregatedMetrics: AnalyticsMetrics = {
        impressions: {
          value: impressions,
          change: impressionGrowth,
        },
        engagementRate: {
          value: engagementRate,
          change: 0,
        },
        followers: {
          value: totalFollowers,
          change: 0,
        },
        profileViews: {
          value: latestAnalytics.profile_views || 0,
          change: 0,
        },
        searchAppearances: {
          value: latestAnalytics.search_appearances || 0,
          change: 0,
        },
        connections: {
          value: totalConnections,
          change: 0,
        },
        membersReached: {
          value: latestAnalytics.members_reached || 0,
          change: 0,
        },
      }

      setMetrics(aggregatedMetrics)

      // Set metadata
      setMetadata({
        lastUpdated: rawDataObj?.last_updated || rawDataObj?.extractedAt || latestAnalytics.captured_at,
        captureMethod: rawDataObj?.captureMethod || 'extension',
      })

      // Build chart data from all analytics records (group by date)
      const chartDataMap = new Map<string, ChartDataPoint>()
      const sortedAnalytics = [...analytics].reverse()

      sortedAnalytics.forEach((record) => {
        const date = record.captured_at.split('T')[0]
        chartDataMap.set(date, {
          date,
          impressions: record.impressions || 0,
          engagements: record.engagements || 0,
          profileViews: record.profile_views || 0,
        })
      })

      const sortedChartData = Array.from(chartDataMap.values()).sort(
        (a, b) => a.date.localeCompare(b.date)
      )

      setChartData(sortedChartData)
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      // Use demo data on error for better UX
      setMetrics(DEMO_METRICS)
      setChartData(DEMO_CHART_DATA)
      setMetadata({ lastUpdated: new Date().toISOString(), captureMethod: 'demo' })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, userId, user?.id, authLoading])

  // Fetch when auth state changes or on mount
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Combined loading state - loading if auth is loading OR data is loading
  const combinedLoading = authLoading || isLoading

  return {
    metrics,
    chartData,
    rawData,
    metadata,
    isLoading: combinedLoading,
    error,
    refetch: fetchAnalytics,
  }
}
