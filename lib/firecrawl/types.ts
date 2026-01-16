/**
 * Firecrawl API Types
 * @description TypeScript types for Firecrawl API requests and responses
 * @module lib/firecrawl/types
 */

/**
 * Firecrawl scrape request options
 */
export interface FirecrawlScrapeOptions {
  /** URL to scrape */
  url: string
  /** Response formats to return */
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot')[]
  /** Only include main content */
  onlyMainContent?: boolean
  /** Include specific HTML tags */
  includeTags?: string[]
  /** Exclude specific HTML tags */
  excludeTags?: string[]
  /** Wait time in ms for page to load */
  waitFor?: number
  /** Timeout in ms */
  timeout?: number
}

/**
 * Firecrawl scrape API request body
 */
export interface FirecrawlScrapeRequest {
  /** URL to scrape */
  url: string
  /** Response formats */
  formats?: string[]
  /** Only main content */
  onlyMainContent?: boolean
  /** Include tags */
  includeTags?: string[]
  /** Exclude tags */
  excludeTags?: string[]
  /** Wait time */
  waitFor?: number
  /** Timeout */
  timeout?: number
}

/**
 * Firecrawl scrape API response metadata
 */
export interface FirecrawlMetadata {
  /** Page title */
  title?: string
  /** Meta description */
  description?: string
  /** Language */
  language?: string
  /** Keywords */
  keywords?: string
  /** Robots meta */
  robots?: string
  /** Open Graph data */
  ogTitle?: string
  ogDescription?: string
  ogUrl?: string
  ogImage?: string
  ogLocaleAlternate?: string[]
  ogSiteName?: string
  /** Source URL */
  sourceURL?: string
  /** Status code */
  statusCode?: number
}

/**
 * Firecrawl scrape API response data
 */
export interface FirecrawlScrapeData {
  /** Markdown content */
  markdown?: string
  /** HTML content */
  html?: string
  /** Raw HTML content */
  rawHtml?: string
  /** Extracted links */
  links?: string[]
  /** Screenshot URL */
  screenshot?: string
  /** Page metadata */
  metadata?: FirecrawlMetadata
}

/**
 * Firecrawl scrape API response
 */
export interface FirecrawlScrapeResponse {
  /** Success status */
  success: boolean
  /** Scraped data */
  data?: FirecrawlScrapeData
  /** Error message if failed */
  error?: string
}

/**
 * Firecrawl API error response
 */
export interface FirecrawlErrorResponse {
  /** Success is false on error */
  success: false
  /** Error message */
  error: string
  /** Error details */
  details?: string
}

/**
 * Configuration for Firecrawl client
 */
export interface FirecrawlClientConfig {
  /** API key for authentication */
  apiKey: string
  /** Base URL for API (defaults to production) */
  baseUrl?: string
  /** Request timeout in ms */
  timeout?: number
}
