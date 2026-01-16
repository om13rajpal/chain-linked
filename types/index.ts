/**
 * Application Types
 * @description Central export for all application types
 * @module types
 */

export * from './database'
export * from './carousel'

/**
 * Analytics card data structure
 */
export interface AnalyticsCard {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease'
  description?: string
}

/**
 * Chart data point structure
 */
export interface ChartDataPoint {
  date: string
  [key: string]: string | number
}

/**
 * Post status types
 */
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'

/**
 * Swipe action types
 */
export type SwipeAction = 'like' | 'dislike' | 'skip'

/**
 * Post type categories
 */
export type PostType = 'text' | 'image' | 'video' | 'article' | 'poll' | 'carousel'

/**
 * Template category types
 */
export type TemplateCategory =
  | 'thought-leadership'
  | 'personal-story'
  | 'industry-news'
  | 'how-to'
  | 'engagement-hook'
  | 'sales'
  | 'other'

/**
 * Inspiration post category types
 */
export type InspirationCategory =
  | 'Thought Leadership'
  | 'Personal Stories'
  | 'Industry News Commentary'
  | 'How-To / Educational'
  | 'Engagement Hooks'
  | 'Sales/Business Development'

/**
 * Team member role types
 */
export type TeamRole = 'owner' | 'admin' | 'member'

/**
 * Goal period types
 */
export type GoalPeriod = 'daily' | 'weekly' | 'monthly'

/**
 * Analytics time range options
 */
export type AnalyticsTimeRange = '7d' | '30d' | '90d'

/**
 * Demographic item for analytics
 */
export interface DemographicItem {
  name: string
  value: number
  percentage: number
}

/**
 * Post performance data
 */
export interface PostPerformance {
  id: string
  content: string
  impressions: number
  reactions: number
  comments: number
  reposts: number
  engagementRate: number
  postedAt: string
}

/**
 * Team activity item
 */
export interface TeamActivityItem {
  id: string
  userId: string
  userName: string
  userAvatar: string | null
  content: string
  impressions: number
  reactions: number
  comments: number
  reposts: number
  postedAt: string
}

/**
 * Scheduled post form data
 */
export interface ScheduledPostFormData {
  content: string
  scheduledFor: Date
  timezone: string
  mediaUrls?: string[]
}

/**
 * Template form data
 */
export interface TemplateFormData {
  name: string
  content: string
  category: TemplateCategory
  tags: string[]
  isPublic: boolean
}

/**
 * Brand kit data
 */
export interface BrandKit {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  logoUrl: string | null
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  postReminders: boolean
  analyticsDigest: boolean
  teamActivity: boolean
}
