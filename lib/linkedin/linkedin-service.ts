/**
 * LinkedIn Service
 * @description Unified LinkedIn service with automatic Voyager fallback
 * @module lib/linkedin/linkedin-service
 */

import { createVoyagerClient, VoyagerClient } from './voyager-client'
import { VoyagerPostService, createVoyagerPostService, type CreatePostOptions, type CreatePostResult } from './voyager-post'
import { VoyagerMetricsService, createVoyagerMetricsService, type AnalyticsPeriod, type ContentAnalytics, type PostAnalyticsItem } from './voyager-metrics'
import { FALLBACK_TRIGGER_STATUS_CODES } from './voyager-constants'
import type { VoyagerAnalyticsSummary, VoyagerPostAnalytics, VoyagerProfile, VoyagerError, FallbackTrigger } from './voyager-types'

/**
 * Fallback configuration options
 */
export interface FallbackConfig {
  /** Whether to automatically use Voyager as fallback */
  autoFallback: boolean
  /** Maximum retry attempts before fallback */
  maxRetries: number
  /** Whether to prefer Voyager over official API */
  preferVoyager: boolean
  /** Timeout for official API requests (ms) */
  officialApiTimeout: number
}

/**
 * Default fallback configuration
 */
const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
  autoFallback: true,
  maxRetries: 2,
  preferVoyager: false,
  officialApiTimeout: 10000,
}

/**
 * Service result with source tracking
 */
export interface ServiceResult<T> {
  success: boolean
  data: T | null
  error: VoyagerError | null
  source: 'official_api' | 'voyager_api' | 'cache'
  fallbackTriggered: boolean
  fallbackReason?: FallbackTrigger
}

/**
 * Post creation result with source tracking
 */
export interface PostServiceResult extends CreatePostResult {
  source: 'official_api' | 'voyager_api'
  fallbackTriggered: boolean
  fallbackReason?: FallbackTrigger
}

/**
 * Determine if error should trigger Voyager fallback
 * @param error - Error object or status code
 * @returns Fallback trigger type or null
 */
function shouldTriggerFallback(error: unknown): FallbackTrigger | null {
  if (typeof error === 'number') {
    if (error === 401) return 'OFFICIAL_API_UNAUTHORIZED'
    if (error === 403) return 'OFFICIAL_API_FORBIDDEN'
    if (error === 429) return 'OFFICIAL_API_RATE_LIMITED'
    if (error >= 500) return 'OFFICIAL_API_SERVER_ERROR'
  }

  if (error instanceof Error) {
    if (error.message.includes('timeout')) return 'OFFICIAL_API_TIMEOUT'
    if (error.message.includes('network') || error.message.includes('fetch')) return 'NETWORK_ERROR'
  }

  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>
    const status = errObj.status || errObj.statusCode
    if (typeof status === 'number' && FALLBACK_TRIGGER_STATUS_CODES.includes(status as 401 | 403 | 429 | 500 | 502 | 503 | 504)) {
      if (status === 401) return 'OFFICIAL_API_UNAUTHORIZED'
      if (status === 403) return 'OFFICIAL_API_FORBIDDEN'
      if (status === 429) return 'OFFICIAL_API_RATE_LIMITED'
      return 'OFFICIAL_API_SERVER_ERROR'
    }
  }

  return null
}

/**
 * Unified LinkedIn Service class
 * Provides automatic fallback to Voyager API when official API fails
 */
export class LinkedInService {
  private userId: string
  private config: FallbackConfig
  private voyagerClient: VoyagerClient | null = null
  private voyagerPostService: VoyagerPostService | null = null
  private voyagerMetricsService: VoyagerMetricsService | null = null

  /**
   * Create a LinkedInService instance
   * @param userId - Supabase user ID
   * @param config - Fallback configuration options
   */
  constructor(userId: string, config?: Partial<FallbackConfig>) {
    this.userId = userId
    this.config = { ...DEFAULT_FALLBACK_CONFIG, ...config }
  }

  /**
   * Initialize Voyager services lazily
   */
  private async initVoyager(): Promise<void> {
    if (!this.voyagerClient) {
      this.voyagerClient = await createVoyagerClient(this.userId)
      this.voyagerPostService = new VoyagerPostService(this.voyagerClient)
      this.voyagerMetricsService = new VoyagerMetricsService(this.voyagerClient)
    }
  }

  /**
   * Create a LinkedIn post with automatic fallback
   * @param options - Post creation options
   * @returns Post creation result with source tracking
   */
  async createPost(options: CreatePostOptions): Promise<PostServiceResult> {
    // If preferring Voyager, use it directly
    if (this.config.preferVoyager) {
      return this.createPostViaVoyager(options, 'USER_PREFERENCE')
    }

    // Try official API first (placeholder - would need official API implementation)
    // For now, since we don't have official API, go directly to Voyager
    return this.createPostViaVoyager(options)
  }

  /**
   * Create post via Voyager API
   * @param options - Post creation options
   * @param fallbackReason - Reason for using Voyager
   * @returns Post creation result
   */
  private async createPostViaVoyager(
    options: CreatePostOptions,
    fallbackReason?: FallbackTrigger
  ): Promise<PostServiceResult> {
    await this.initVoyager()

    const result = await this.voyagerPostService!.create(options)

    return {
      ...result,
      source: 'voyager_api',
      fallbackTriggered: !!fallbackReason,
      fallbackReason,
    }
  }

  /**
   * Get analytics summary with automatic fallback
   * @param period - Analytics time period
   * @returns Analytics data with source tracking
   */
  async getAnalyticsSummary(
    period: AnalyticsPeriod = 'LAST_30_DAYS'
  ): Promise<ServiceResult<VoyagerAnalyticsSummary>> {
    // If preferring Voyager, use it directly
    if (this.config.preferVoyager) {
      return this.getAnalyticsSummaryViaVoyager(period, 'USER_PREFERENCE')
    }

    // Try official API first (placeholder)
    // For now, go directly to Voyager
    return this.getAnalyticsSummaryViaVoyager(period)
  }

  /**
   * Get analytics summary via Voyager
   * @param period - Analytics time period
   * @param fallbackReason - Reason for using Voyager
   * @returns Analytics data
   */
  private async getAnalyticsSummaryViaVoyager(
    period: AnalyticsPeriod,
    fallbackReason?: FallbackTrigger
  ): Promise<ServiceResult<VoyagerAnalyticsSummary>> {
    await this.initVoyager()

    const result = await this.voyagerMetricsService!.getSummary(period)

    return {
      success: result.success,
      data: result.data,
      error: result.error,
      source: 'voyager_api',
      fallbackTriggered: !!fallbackReason,
      fallbackReason,
    }
  }

  /**
   * Get post analytics with automatic fallback
   * @param activityUrn - Post activity URN
   * @returns Post analytics with source tracking
   */
  async getPostAnalytics(activityUrn: string): Promise<ServiceResult<VoyagerPostAnalytics>> {
    if (this.config.preferVoyager) {
      return this.getPostAnalyticsViaVoyager(activityUrn, 'USER_PREFERENCE')
    }

    return this.getPostAnalyticsViaVoyager(activityUrn)
  }

  /**
   * Get post analytics via Voyager
   * @param activityUrn - Post activity URN
   * @param fallbackReason - Reason for using Voyager
   * @returns Post analytics
   */
  private async getPostAnalyticsViaVoyager(
    activityUrn: string,
    fallbackReason?: FallbackTrigger
  ): Promise<ServiceResult<VoyagerPostAnalytics>> {
    await this.initVoyager()

    const result = await this.voyagerMetricsService!.getPostAnalytics(activityUrn)

    return {
      success: result.success,
      data: result.data,
      error: result.error,
      source: 'voyager_api',
      fallbackTriggered: !!fallbackReason,
      fallbackReason,
    }
  }

  /**
   * Get user profile with automatic fallback
   * @returns Profile data with source tracking
   */
  async getProfile(): Promise<ServiceResult<VoyagerProfile>> {
    if (this.config.preferVoyager) {
      return this.getProfileViaVoyager('USER_PREFERENCE')
    }

    return this.getProfileViaVoyager()
  }

  /**
   * Get profile via Voyager
   * @param fallbackReason - Reason for using Voyager
   * @returns Profile data
   */
  private async getProfileViaVoyager(
    fallbackReason?: FallbackTrigger
  ): Promise<ServiceResult<VoyagerProfile>> {
    await this.initVoyager()

    const result = await this.voyagerMetricsService!.getProfile()

    return {
      success: result.success,
      data: result.data,
      error: result.error,
      source: 'voyager_api',
      fallbackTriggered: !!fallbackReason,
      fallbackReason,
    }
  }

  /**
   * Get content analytics with automatic fallback
   * @param period - Analytics time period
   * @param postLimit - Number of recent posts to include
   * @returns Content analytics with source tracking
   */
  async getContentAnalytics(
    period: AnalyticsPeriod = 'LAST_30_DAYS',
    postLimit: number = 10
  ): Promise<ServiceResult<ContentAnalytics>> {
    if (this.config.preferVoyager) {
      return this.getContentAnalyticsViaVoyager(period, postLimit, 'USER_PREFERENCE')
    }

    return this.getContentAnalyticsViaVoyager(period, postLimit)
  }

  /**
   * Get content analytics via Voyager
   * @param period - Analytics time period
   * @param postLimit - Number of recent posts
   * @param fallbackReason - Reason for using Voyager
   * @returns Content analytics
   */
  private async getContentAnalyticsViaVoyager(
    period: AnalyticsPeriod,
    postLimit: number,
    fallbackReason?: FallbackTrigger
  ): Promise<ServiceResult<ContentAnalytics>> {
    await this.initVoyager()

    const result = await this.voyagerMetricsService!.getContentAnalytics(period, postLimit)

    return {
      success: result.success,
      data: result.data,
      error: result.error,
      source: 'voyager_api',
      fallbackTriggered: !!fallbackReason,
      fallbackReason,
    }
  }

  /**
   * Get recent posts with analytics
   * @param limit - Number of posts to fetch
   * @returns Posts with analytics
   */
  async getRecentPostsWithAnalytics(limit: number = 10): Promise<ServiceResult<PostAnalyticsItem[]>> {
    await this.initVoyager()

    const result = await this.voyagerMetricsService!.getRecentPostsWithAnalytics(limit)

    return {
      success: result.success,
      data: result.data,
      error: result.error,
      source: 'voyager_api',
      fallbackTriggered: false,
    }
  }

  /**
   * Check if Voyager credentials are available and valid
   * @returns Whether Voyager is available
   */
  async isVoyagerAvailable(): Promise<boolean> {
    try {
      await this.initVoyager()
      const validation = await this.voyagerClient!.validateCredentials()
      return validation.isValid
    } catch {
      return false
    }
  }

  /**
   * Get current configuration
   * @returns Current fallback configuration
   */
  getConfig(): FallbackConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * Create a LinkedInService instance for a user
 * @param userId - Supabase user ID
 * @param config - Optional fallback configuration
 * @returns LinkedInService instance
 * @example
 * const linkedIn = await createLinkedInService(userId)
 * const result = await linkedIn.createPost({ content: 'Hello!' })
 */
export async function createLinkedInService(
  userId: string,
  config?: Partial<FallbackConfig>
): Promise<LinkedInService> {
  return new LinkedInService(userId, config)
}
