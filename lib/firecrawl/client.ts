/**
 * Firecrawl API Client
 * @description Client for interacting with Firecrawl API to scrape website content
 * @module lib/firecrawl/client
 */

import type {
  FirecrawlScrapeOptions,
  FirecrawlScrapeRequest,
  FirecrawlScrapeResponse,
  FirecrawlClientConfig,
} from './types'

/** Default Firecrawl API base URL */
const DEFAULT_BASE_URL = 'https://api.firecrawl.dev/v1'

/** Default request timeout in milliseconds */
const DEFAULT_TIMEOUT = 30000

/**
 * Firecrawl API client for web scraping
 * @example
 * const client = new FirecrawlClient({ apiKey: process.env.FIRECRAWL_API_KEY })
 * const result = await client.scrape({ url: 'https://example.com' })
 */
export class FirecrawlClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly timeout: number

  /**
   * Creates a new Firecrawl client instance
   * @param config - Client configuration
   */
  constructor(config: FirecrawlClientConfig) {
    if (!config.apiKey) {
      throw new Error('Firecrawl API key is required')
    }
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL
    this.timeout = config.timeout || DEFAULT_TIMEOUT
  }

  /**
   * Scrapes a URL and returns the content
   * @param options - Scrape options including URL and format preferences
   * @returns Promise resolving to scrape response with content and metadata
   * @throws Error if the request fails
   * @example
   * const result = await client.scrape({
   *   url: 'https://stripe.com',
   *   formats: ['html'],
   *   waitFor: 2000
   * })
   */
  async scrape(options: FirecrawlScrapeOptions): Promise<FirecrawlScrapeResponse> {
    const { url, formats = ['html'], ...rest } = options

    // Validate URL
    if (!url) {
      return {
        success: false,
        error: 'URL is required',
      }
    }

    try {
      new URL(url)
    } catch {
      return {
        success: false,
        error: 'Invalid URL format',
      }
    }

    const requestBody: FirecrawlScrapeRequest = {
      url,
      formats,
      ...rest,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      return data as FirecrawlScrapeResponse
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timed out. The website may be slow or unavailable.',
          }
        }
        return {
          success: false,
          error: error.message,
        }
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      }
    }
  }

  /**
   * Scrapes a URL specifically for brand extraction
   * Optimized to get CSS, meta tags, and icon information
   * @param url - Website URL to extract brand from
   * @returns Promise resolving to scrape response
   */
  async scrapeForBrand(url: string): Promise<FirecrawlScrapeResponse> {
    return this.scrape({
      url,
      formats: ['html'],
      onlyMainContent: false,
      waitFor: 3000, // Allow time for CSS and assets to load
      timeout: this.timeout,
    })
  }
}

/**
 * Creates a Firecrawl client using environment variables
 * @returns Firecrawl client instance or null if API key not configured
 * @example
 * const client = createFirecrawlClient()
 * if (client) {
 *   const result = await client.scrape({ url: 'https://example.com' })
 * }
 */
export function createFirecrawlClient(): FirecrawlClient | null {
  const apiKey = process.env.FIRECRAWL_API_KEY

  if (!apiKey) {
    console.warn('FIRECRAWL_API_KEY environment variable is not set')
    return null
  }

  return new FirecrawlClient({ apiKey })
}

/**
 * Validates if a URL is valid for scraping
 * @param url - URL string to validate
 * @returns True if URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Normalizes a URL by adding protocol if missing
 * @param url - URL string to normalize
 * @returns Normalized URL with protocol
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''

  // Add https:// if no protocol specified
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`
  }

  return trimmed
}
