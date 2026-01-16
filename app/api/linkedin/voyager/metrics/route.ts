/**
 * Voyager Metrics API Route
 * @description Handle analytics retrieval via LinkedIn's Voyager API as fallback
 * @module app/api/linkedin/voyager/metrics
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  createVoyagerMetricsService,
  type AnalyticsPeriod,
} from '@/lib/linkedin/voyager-metrics'
import { ANALYTICS_PERIODS } from '@/lib/linkedin/voyager-constants'
import type { Json } from '@/types/database'

/**
 * Valid analytics periods
 */
const VALID_PERIODS = Object.keys(ANALYTICS_PERIODS) as AnalyticsPeriod[]

/**
 * GET - Retrieve LinkedIn analytics via Voyager API
 * @param request - Request with query parameters for analytics type and period
 * @returns Analytics data or error
 */
export async function GET(request: Request) {
  const supabase = await createClient()

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'summary'
  const period = (searchParams.get('period') || 'LAST_30_DAYS') as AnalyticsPeriod
  const activityUrn = searchParams.get('activityUrn')

  // Validate period
  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json(
      {
        error: 'Invalid period',
        validPeriods: VALID_PERIODS,
      },
      { status: 400 }
    )
  }

  try {
    const metricsService = await createVoyagerMetricsService(user.id)

    switch (type) {
      case 'summary': {
        const result = await metricsService.getSummary(period)

        if (!result.success) {
          return NextResponse.json(
            {
              error: result.error?.message || 'Failed to fetch analytics summary',
              code: result.error?.code,
              retryable: result.error?.retryable,
            },
            { status: result.error?.status || 500 }
          )
        }

        // Cache result in database
        try {
          await supabase.from('linkedin_analytics').upsert(
            {
              user_id: user.id,
              page_type: 'creator_analytics',
              impressions: result.data?.impressions,
              members_reached: result.data?.uniqueViews,
              engagements: result.data?.engagements,
              new_followers: result.data?.followerGains,
              profile_views: result.data?.profileViews,
              search_appearances: result.data?.searchAppearances,
              raw_data: result.data as unknown as Json,
              captured_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id,page_type',
            }
          )
        } catch (dbError) {
          console.error('Failed to cache analytics:', dbError)
        }

        return NextResponse.json({
          success: true,
          analytics: result.data,
          period,
          source: 'voyager_api',
        })
      }

      case 'post': {
        if (!activityUrn) {
          return NextResponse.json({ error: 'Activity URN is required for post analytics' }, { status: 400 })
        }

        const result = await metricsService.getPostAnalytics(activityUrn)

        if (!result.success) {
          return NextResponse.json(
            {
              error: result.error?.message || 'Failed to fetch post analytics',
              code: result.error?.code,
            },
            { status: result.error?.status || 500 }
          )
        }

        // Update post analytics in database
        try {
          await supabase
            .from('post_analytics')
            .upsert(
              {
                user_id: user.id,
                activity_urn: activityUrn,
                impressions: result.data?.impressionCount,
                members_reached: result.data?.memberReach,
                unique_views: result.data?.uniqueImpressionCount,
                reactions: result.data?.likeCount,
                comments: result.data?.commentCount,
                reposts: result.data?.shareCount,
                engagement_rate: result.data?.engagementRate,
                raw_data: result.data as unknown as Json,
                captured_at: new Date().toISOString(),
              },
              {
                onConflict: 'user_id,activity_urn',
              }
            )
        } catch (dbError) {
          console.error('Failed to cache post analytics:', dbError)
        }

        return NextResponse.json({
          success: true,
          analytics: result.data,
          source: 'voyager_api',
        })
      }

      case 'profile': {
        const result = await metricsService.getProfile()

        if (!result.success) {
          return NextResponse.json(
            {
              error: result.error?.message || 'Failed to fetch profile',
              code: result.error?.code,
            },
            { status: result.error?.status || 500 }
          )
        }

        // Update profile in database
        try {
          await supabase
            .from('linkedin_profiles')
            .upsert(
              {
                user_id: user.id,
                profile_urn: result.data?.entityUrn,
                public_identifier: result.data?.publicIdentifier,
                first_name: result.data?.firstName,
                last_name: result.data?.lastName,
                headline: result.data?.headline,
                location: result.data?.locationName,
                industry: result.data?.industryName,
                summary: result.data?.summary,
                connections_count: result.data?.connectionCount,
                followers_count: result.data?.followerCount,
                raw_data: result.data as unknown as Json,
                captured_at: new Date().toISOString(),
              },
              {
                onConflict: 'user_id',
              }
            )
        } catch (dbError) {
          console.error('Failed to cache profile:', dbError)
        }

        return NextResponse.json({
          success: true,
          profile: result.data,
          source: 'voyager_api',
        })
      }

      case 'profile-stats': {
        const result = await metricsService.getProfileStatistics()

        if (!result.success) {
          return NextResponse.json(
            {
              error: result.error?.message || 'Failed to fetch profile statistics',
              code: result.error?.code,
            },
            { status: result.error?.status || 500 }
          )
        }

        return NextResponse.json({
          success: true,
          statistics: result.data,
          source: 'voyager_api',
        })
      }

      case 'content': {
        const postLimit = parseInt(searchParams.get('limit') || '10')
        const result = await metricsService.getContentAnalytics(period, postLimit)

        if (!result.success) {
          return NextResponse.json(
            {
              error: result.error?.message || 'Failed to fetch content analytics',
              code: result.error?.code,
            },
            { status: result.error?.status || 500 }
          )
        }

        return NextResponse.json({
          success: true,
          contentAnalytics: result.data,
          period,
          source: 'voyager_api',
        })
      }

      case 'recent-posts': {
        const limit = parseInt(searchParams.get('limit') || '10')
        const result = await metricsService.getRecentPostsWithAnalytics(limit)

        if (!result.success) {
          return NextResponse.json(
            {
              error: result.error?.message || 'Failed to fetch recent posts',
              code: result.error?.code,
            },
            { status: result.error?.status || 500 }
          )
        }

        return NextResponse.json({
          success: true,
          posts: result.data,
          count: result.data.length,
          source: 'voyager_api',
        })
      }

      default:
        return NextResponse.json(
          {
            error: 'Invalid analytics type',
            validTypes: ['summary', 'post', 'profile', 'profile-stats', 'content', 'recent-posts'],
          },
          { status: 400 }
        )
    }
  } catch (err) {
    console.error('Voyager metrics route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
