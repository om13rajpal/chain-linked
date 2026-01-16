/**
 * LinkedIn API Types
 * @description Type definitions for LinkedIn API requests and responses
 * @module lib/linkedin/types
 */

/**
 * LinkedIn OAuth scopes required for posting
 */
export const LINKEDIN_SCOPES = [
  'openid',
  'profile',
  'w_member_social',
] as const

export type LinkedInScope = typeof LINKEDIN_SCOPES[number]

/**
 * LinkedIn OAuth token response
 */
export interface LinkedInTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  refresh_token_expires_in?: number
  scope: string
}

/**
 * LinkedIn user info response from /v2/userinfo
 */
export interface LinkedInUserInfo {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture?: string
  email?: string
  email_verified?: boolean
  locale?: string
}

/**
 * Stored LinkedIn token data in database
 */
export interface LinkedInTokenData {
  id: string
  user_id: string
  access_token: string
  refresh_token: string | null
  expires_at: string
  linkedin_urn: string
  scopes: string[]
  created_at: string
  updated_at: string
}

/**
 * LinkedIn API error response
 */
export interface LinkedInApiError {
  status: number
  serviceErrorCode?: number
  code?: string
  message: string
}

/**
 * LinkedIn ugcPost visibility types
 */
export type LinkedInVisibility = 'PUBLIC' | 'CONNECTIONS'

/**
 * LinkedIn media category for uploads
 */
export type LinkedInMediaCategory = 'NONE' | 'ARTICLE' | 'IMAGE'

/**
 * LinkedIn share media category
 */
export type LinkedInShareMediaCategory = 'NONE' | 'ARTICLE' | 'IMAGE' | 'RICH' | 'VIDEO'

/**
 * LinkedIn ugcPost author type
 */
export interface LinkedInAuthor {
  author: string
}

/**
 * LinkedIn share commentary (text content)
 */
export interface LinkedInShareCommentary {
  text: string
}

/**
 * LinkedIn media status
 */
export type LinkedInMediaStatus = 'PROCESSING' | 'READY' | 'FAILED'

/**
 * LinkedIn media details for posts
 */
export interface LinkedInMedia {
  status: LinkedInMediaStatus
  description?: LinkedInShareCommentary
  media: string
  title?: LinkedInShareCommentary
}

/**
 * LinkedIn share content
 */
export interface LinkedInShareContent {
  shareCommentary: LinkedInShareCommentary
  shareMediaCategory: LinkedInShareMediaCategory
  media?: LinkedInMedia[]
}

/**
 * LinkedIn ugcPost request body
 */
export interface LinkedInUgcPostRequest {
  author: string
  lifecycleState: 'PUBLISHED' | 'DRAFT'
  specificContent: {
    'com.linkedin.ugc.ShareContent': LinkedInShareContent
  }
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': LinkedInVisibility
  }
}

/**
 * LinkedIn ugcPost response
 */
export interface LinkedInUgcPostResponse {
  id: string
  author: string
  created: {
    time: number
  }
  lifecycleState: string
}

/**
 * LinkedIn register upload request
 */
export interface LinkedInRegisterUploadRequest {
  registerUploadRequest: {
    recipes: string[]
    owner: string
    serviceRelationships: {
      relationshipType: 'OWNER'
      identifier: 'urn:li:userGeneratedContent'
    }[]
  }
}

/**
 * LinkedIn register upload response
 */
export interface LinkedInRegisterUploadResponse {
  value: {
    uploadMechanism: {
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': {
        headers: Record<string, string>
        uploadUrl: string
      }
    }
    mediaArtifact: string
    asset: string
  }
}

/**
 * Post request from client
 */
export interface CreatePostRequest {
  content: string
  visibility?: LinkedInVisibility
  mediaUrls?: string[]
}

/**
 * Post response to client
 */
export interface CreatePostResponse {
  success: boolean
  postId?: string
  linkedinPostUrn?: string
  error?: string
}

/**
 * LinkedIn connection status
 */
export interface LinkedInConnectionStatus {
  isConnected: boolean
  linkedinUrn?: string
  expiresAt?: string
}

/**
 * Retry configuration for API calls
 */
export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  retryableStatuses: number[]
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
}

/**
 * LinkedIn API endpoints
 */
export const LINKEDIN_API = {
  AUTHORIZATION: 'https://www.linkedin.com/oauth/v2/authorization',
  ACCESS_TOKEN: 'https://www.linkedin.com/oauth/v2/accessToken',
  USER_INFO: 'https://api.linkedin.com/v2/userinfo',
  UGC_POSTS: 'https://api.linkedin.com/v2/ugcPosts',
  ASSETS: 'https://api.linkedin.com/v2/assets',
} as const

/**
 * LinkedIn API version header
 */
export const LINKEDIN_API_VERSION = '202401'
