/**
 * Voyager API Constants
 * @description Constants for LinkedIn's internal Voyager API endpoints and configuration
 * @module lib/linkedin/voyager-constants
 */

/**
 * Base URL for LinkedIn Voyager API
 */
export const VOYAGER_BASE_URL = 'https://www.linkedin.com/voyager/api'

/**
 * Voyager API version header
 */
export const VOYAGER_API_VERSION = '2.0.0'

/**
 * Voyager API endpoints
 */
export const VOYAGER_ENDPOINTS = {
  // Profile endpoints
  ME: '/me',
  PROFILE: '/identity/profiles',
  PROFILE_DASH: '/identity/dash/profiles',
  PROFILE_STATISTICS: '/identity/dash/profile',

  // Post creation endpoints
  NORM_SHARES: '/contentcreation/normShares',
  SHARES: '/feed/shares',
  UGC_POSTS: '/ugcPosts',

  // Feed endpoints
  FEED_UPDATES: '/feed/updates',
  FEED_DASH: '/feed/dash/dashFeedUpdates',

  // Analytics endpoints
  ANALYTICS_SUMMARY: '/analytics/dashAnalyticsSummary',
  POST_ANALYTICS: '/analytics/dashPostAnalytics',
  CREATOR_ANALYTICS: '/creatorAnalytics/dashCreatorAnalyticsSummary',

  // Social actions
  SOCIAL_ACTIONS: '/voyagerSocialDashActivityActions',
  REACTIONS: '/voyagerSocialDashReactions',

  // Connections
  CONNECTIONS: '/relationships/dash/connections',
  FOLLOWERS: '/identity/dash/myConnections',
} as const

/**
 * Default request headers for Voyager API
 */
export const VOYAGER_DEFAULT_HEADERS = {
  'accept': 'application/vnd.linkedin.normalized+json+2.1',
  'accept-language': 'en-US,en;q=0.9',
  'x-li-lang': 'en_US',
  'x-restli-protocol-version': '2.0.0',
  'x-li-track': JSON.stringify({
    clientVersion: '1.13.8008',
    mpVersion: '1.13.8008',
    osName: 'web',
    timezoneOffset: new Date().getTimezoneOffset(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    deviceFormFactor: 'DESKTOP',
    mpName: 'voyager-web',
  }),
} as const

/**
 * User agent string to use for requests (Chrome on Windows)
 */
export const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * Rate limit configurations by endpoint category
 */
export const RATE_LIMITS = {
  posts: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 20,
    retryAfterMs: 60 * 60 * 1000, // 1 hour
  },
  profile: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 60,
    retryAfterMs: 5 * 60 * 1000, // 5 minutes
  },
  analytics: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 30,
    retryAfterMs: 10 * 60 * 1000, // 10 minutes
  },
  feed: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    retryAfterMs: 5 * 60 * 1000, // 5 minutes
  },
  default: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    retryAfterMs: 5 * 60 * 1000, // 5 minutes
  },
} as const

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
} as const

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT_MS = 30000

/**
 * HTTP status codes that trigger fallback
 */
export const FALLBACK_TRIGGER_STATUS_CODES = [401, 403, 429, 500, 502, 503, 504] as const

/**
 * Error codes for Voyager responses
 */
export const VOYAGER_ERROR_CODES = {
  UNAUTHORIZED: 'VOYAGER_UNAUTHORIZED',
  FORBIDDEN: 'VOYAGER_FORBIDDEN',
  RATE_LIMITED: 'VOYAGER_RATE_LIMITED',
  NOT_FOUND: 'VOYAGER_NOT_FOUND',
  SERVER_ERROR: 'VOYAGER_SERVER_ERROR',
  NETWORK_ERROR: 'VOYAGER_NETWORK_ERROR',
  TIMEOUT: 'VOYAGER_TIMEOUT',
  INVALID_RESPONSE: 'VOYAGER_INVALID_RESPONSE',
  INVALID_CREDENTIALS: 'VOYAGER_INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'VOYAGER_SESSION_EXPIRED',
} as const

/**
 * Cookie names used by LinkedIn
 */
export const LINKEDIN_COOKIE_NAMES = {
  SESSION_TOKEN: 'li_at',
  CSRF_TOKEN: 'JSESSIONID',
  APP_TOKEN: 'liap',
} as const

/**
 * Minimum delay between requests (ms) to mimic human behavior
 */
export const MIN_REQUEST_DELAY_MS = 500

/**
 * Maximum delay between requests (ms) for random variation
 */
export const MAX_REQUEST_DELAY_MS = 2000

/**
 * Post visibility options mapping
 */
export const POST_VISIBILITY = {
  PUBLIC: 'PUBLIC',
  CONNECTIONS: 'CONNECTIONS',
  LOGGED_IN: 'LOGGED_IN',
} as const

/**
 * Media types for posts
 */
export const MEDIA_CATEGORIES = {
  NONE: 'NONE',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  ARTICLE: 'ARTICLE',
  RICH: 'RICH',
} as const

/**
 * Analytics time periods
 */
export const ANALYTICS_PERIODS = {
  LAST_7_DAYS: 'LAST_7_DAYS',
  LAST_30_DAYS: 'LAST_30_DAYS',
  LAST_90_DAYS: 'LAST_90_DAYS',
  LAST_365_DAYS: 'LAST_365_DAYS',
} as const
