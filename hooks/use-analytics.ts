/**
 * Analytics Hook
 * @description Fetches LinkedIn analytics data from Supabase
 * @module hooks/use-analytics
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
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
}

/**
 * Chart data point for time series
 */
interface ChartDataPoint {
  date: string
  impressions: number
  engagements: number
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
}

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Hook to fetch and manage LinkedIn analytics data
 * @param userId - User ID to fetch analytics for (optional, uses current user if not provided)
 * @returns Analytics data, loading state, and refetch function
 * @example
 * const { metrics, chartData, isLoading, error } = useAnalytics()
 */
export function useAnalytics(userId?: string): UseAnalyticsReturn {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [rawData, setRawData] = useState<Tables<'linkedin_analytics'>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  /**
   * Fetch analytics data from Supabase
   */
  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current user if userId not provided
      let targetUserId = userId
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setMetrics(null)
          setChartData([])
          setRawData([])
          setIsLoading(false)
          return
        }
        targetUserId = user.id
      }

      // Fetch analytics for the last 90 days
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const { data: analytics, error: fetchError } = await supabase
        .from('linkedin_analytics')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('captured_at', ninetyDaysAgo.toISOString())
        .order('captured_at', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      if (!analytics || analytics.length === 0) {
        setMetrics(DEFAULT_METRICS)
        setChartData([])
        setRawData([])
        setIsLoading(false)
        return
      }

      setRawData(analytics)

      // Calculate current period metrics (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const currentPeriod = analytics.filter(
        (a) => new Date(a.captured_at) >= thirtyDaysAgo
      )
      const previousPeriod = analytics.filter(
        (a) => new Date(a.captured_at) >= sixtyDaysAgo && new Date(a.captured_at) < thirtyDaysAgo
      )

      // Aggregate metrics
      const sumMetrics = (records: typeof analytics) => ({
        impressions: records.reduce((sum, r) => sum + (r.impressions || 0), 0),
        engagements: records.reduce((sum, r) => sum + (r.engagements || 0), 0),
        followers: records.reduce((sum, r) => sum + (r.new_followers || 0), 0),
        profileViews: records.reduce((sum, r) => sum + (r.profile_views || 0), 0),
      })

      const current = sumMetrics(currentPeriod)
      const previous = sumMetrics(previousPeriod)

      // Calculate engagement rate (engagements / impressions * 100)
      const currentEngagementRate = current.impressions > 0
        ? (current.engagements / current.impressions) * 100
        : 0
      const previousEngagementRate = previous.impressions > 0
        ? (previous.engagements / previous.impressions) * 100
        : 0

      const aggregatedMetrics: AnalyticsMetrics = {
        impressions: {
          value: current.impressions,
          change: calculateChange(current.impressions, previous.impressions),
        },
        engagementRate: {
          value: currentEngagementRate,
          change: calculateChange(currentEngagementRate, previousEngagementRate),
        },
        followers: {
          value: current.followers,
          change: calculateChange(current.followers, previous.followers),
        },
        profileViews: {
          value: current.profileViews,
          change: calculateChange(current.profileViews, previous.profileViews),
        },
      }

      setMetrics(aggregatedMetrics)

      // Build chart data (aggregate by date)
      const chartDataMap = new Map<string, ChartDataPoint>()
      analytics.forEach((record) => {
        const date = record.captured_at.split('T')[0]
        const existing = chartDataMap.get(date)
        if (existing) {
          existing.impressions += record.impressions || 0
          existing.engagements += record.engagements || 0
        } else {
          chartDataMap.set(date, {
            date,
            impressions: record.impressions || 0,
            engagements: record.engagements || 0,
          })
        }
      })

      // Sort by date
      const sortedChartData = Array.from(chartDataMap.values()).sort(
        (a, b) => a.date.localeCompare(b.date)
      )

      setChartData(sortedChartData)
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      setMetrics(DEFAULT_METRICS)
      setChartData([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase, userId])

  // Fetch on mount
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    metrics,
    chartData,
    rawData,
    isLoading,
    error,
    refetch: fetchAnalytics,
  }
}
