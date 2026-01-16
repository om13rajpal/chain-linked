/**
 * Voyager API Type Definitions
 * @description TypeScript types for LinkedIn's internal Voyager API
 * @module lib/linkedin/voyager-types
 */

/**
 * LinkedIn credentials stored in database
 */
export interface LinkedInCredentials {
  id: string
  user_id: string
  li_at: string
  jsessionid: string
  liap: string | null
  csrf_token: string | null
  user_agent: string | null
  cookies_set_at: string
  expires_at: string | null
  is_valid: boolean
  last_used_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Proxy configuration for request routing
 */
export interface ProxyConfig {
  host: string
  port: number
  username: string
  password: string
  protocol: 'http' | 'https' | 'socks5'
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  retryAfterMs: number
}

/**
 * Retry configuration for failed requests
 */
export interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

/**
 * Voyager API request options
 */
export interface VoyagerRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  body?: Record<string, unknown>
  headers?: Record<string, string>
  timeout?: number
  useProxy?: boolean
}

/**
 * Voyager API response wrapper
 */
export interface VoyagerResponse<T = unknown> {
  success: boolean
  data: T | null
  error: VoyagerError | null
  statusCode: number
  headers: Record<string, string>
}

/**
 * Voyager API error
 */
export interface VoyagerError {
  code: string
  message: string
  status: number
  retryable: boolean
  details?: Record<string, unknown>
}

/**
 * Voyager profile data from identity API
 */
export interface VoyagerProfile {
  entityUrn: string
  publicIdentifier: string
  firstName: string
  lastName: string
  headline: string | null
  locationName: string | null
  industryName: string | null
  summary: string | null
  profilePicture: VoyagerMediaContent | null
  backgroundPicture: VoyagerMediaContent | null
  connectionCount: number | null
  followerCount: number | null
}

/**
 * Voyager media content structure
 */
export interface VoyagerMediaContent {
  displayImage: string | null
  displayImageUrn: string | null
  artifacts: VoyagerImageArtifact[]
}

/**
 * Voyager image artifact
 */
export interface VoyagerImageArtifact {
  width: number
  height: number
  fileIdentifyingUrlPathSegment: string
  expiresAt: number
}

/**
 * Voyager post creation request
 */
export interface VoyagerPostRequest {
  commentary: string
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN'
  mediaCategory?: 'NONE' | 'IMAGE' | 'VIDEO' | 'ARTICLE' | 'RICH'
  mediaUrns?: string[]
  originalPostUrn?: string
}

/**
 * Voyager post response
 */
export interface VoyagerPostResponse {
  entityUrn: string
  activityUrn: string
  shareUrn: string
  createdAt: number
}

/**
 * Voyager analytics summary
 */
export interface VoyagerAnalyticsSummary {
  impressions: number
  uniqueViews: number
  engagements: number
  engagementRate: number
  followerGains: number
  profileViews: number
  searchAppearances: number
  periodStart: string
  periodEnd: string
}

/**
 * Voyager post analytics
 */
export interface VoyagerPostAnalytics {
  activityUrn: string
  impressionCount: number
  uniqueImpressionCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  engagementRate: number
  clickCount: number
  memberReach: number
  demographics: VoyagerDemographics | null
}

/**
 * Voyager demographics breakdown
 */
export interface VoyagerDemographics {
  industries: VoyagerDemographicItem[]
  jobFunctions: VoyagerDemographicItem[]
  seniorities: VoyagerDemographicItem[]
  locations: VoyagerDemographicItem[]
  companies: VoyagerDemographicItem[]
}

/**
 * Voyager demographic item
 */
export interface VoyagerDemographicItem {
  name: string
  count: number
  percentage: number
}

/**
 * Voyager feed update item
 */
export interface VoyagerFeedUpdate {
  entityUrn: string
  updateType: string
  actor: VoyagerActor
  commentary: string | null
  socialDetail: VoyagerSocialDetail
  content: VoyagerContent | null
  createdAt: number
}

/**
 * Voyager actor (post author)
 */
export interface VoyagerActor {
  entityUrn: string
  name: string
  headline: string | null
  profileUrl: string
  image: VoyagerMediaContent | null
}

/**
 * Voyager social metrics
 */
export interface VoyagerSocialDetail {
  totalSocialActivityCounts: {
    numLikes: number
    numComments: number
    numShares: number
    reactionTypeCounts: VoyagerReactionCount[]
  }
  liked: boolean
  commented: boolean
  reposted: boolean
}

/**
 * Voyager reaction count by type
 */
export interface VoyagerReactionCount {
  reactionType: string
  count: number
}

/**
 * Voyager content attachment
 */
export interface VoyagerContent {
  contentType: string
  article?: VoyagerArticle
  images?: VoyagerImage[]
  video?: VoyagerVideo
}

/**
 * Voyager article content
 */
export interface VoyagerArticle {
  title: string
  subtitle: string | null
  url: string
  thumbnail: string | null
}

/**
 * Voyager image content
 */
export interface VoyagerImage {
  url: string
  width: number
  height: number
  altText: string | null
}

/**
 * Voyager video content
 */
export interface VoyagerVideo {
  url: string
  thumbnail: string | null
  duration: number | null
}

/**
 * Fallback trigger conditions
 */
export type FallbackTrigger =
  | 'OFFICIAL_API_UNAUTHORIZED'
  | 'OFFICIAL_API_FORBIDDEN'
  | 'OFFICIAL_API_RATE_LIMITED'
  | 'OFFICIAL_API_SERVER_ERROR'
  | 'OFFICIAL_API_TIMEOUT'
  | 'NETWORK_ERROR'
  | 'USER_PREFERENCE'
  | 'SCHEDULED_JOB'

/**
 * Cookie validation result
 */
export interface CookieValidationResult {
  isValid: boolean
  expiresIn: number | null
  needsRefresh: boolean
  error: string | null
}

/**
 * Request rate limit state
 */
export interface RateLimitState {
  endpoint: string
  requestCount: number
  windowStart: number
  isLimited: boolean
  resetAt: number | null
}
