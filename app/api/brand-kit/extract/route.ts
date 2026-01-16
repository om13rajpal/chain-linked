/**
 * Brand Kit Extraction API Route
 * @description POST endpoint to extract brand elements from a website URL
 * @module app/api/brand-kit/extract
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFirecrawlClient, normalizeUrl, isValidUrl } from '@/lib/firecrawl/client'
import { extractBrand } from '@/lib/firecrawl/brand-extractor'
import type { ExtractBrandKitResponse } from '@/types/brand-kit'

/**
 * POST handler for brand kit extraction
 * Scrapes the provided URL and extracts brand colors, fonts, and logo
 * @param request - Request containing { url: string }
 * @returns Extracted brand kit data or error
 */
export async function POST(request: Request): Promise<NextResponse<ExtractBrandKitResponse>> {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Please sign in to extract brand kits.',
        },
        { status: 401 }
      )
    }

    // Parse request body
    let body: { url?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body. Expected JSON with url field.',
        },
        { status: 400 }
      )
    }

    // Validate URL
    const rawUrl = body.url
    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'URL is required.',
        },
        { status: 400 }
      )
    }

    const url = normalizeUrl(rawUrl)
    if (!isValidUrl(url)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL format. Please enter a valid website URL.',
        },
        { status: 400 }
      )
    }

    // Create Firecrawl client
    const firecrawl = createFirecrawlClient()
    if (!firecrawl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Brand extraction service is not configured.',
          details: 'FIRECRAWL_API_KEY environment variable is not set.',
        },
        { status: 503 }
      )
    }

    // Scrape the website
    const scrapeResult = await firecrawl.scrapeForBrand(url)

    if (!scrapeResult.success || !scrapeResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: scrapeResult.error || 'Failed to scrape website.',
          details: 'The website may be unavailable, too slow, or blocking automated access.',
        },
        { status: 502 }
      )
    }

    // Extract brand elements
    const brandResult = extractBrand(scrapeResult.data, url)

    if (!brandResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: brandResult.error || 'Failed to extract brand elements.',
          details: 'The website may not have enough styling information to extract a brand kit.',
        },
        { status: 422 }
      )
    }

    // Return extracted brand kit (not saved yet - user can preview and modify)
    return NextResponse.json({
      success: true,
      brandKit: {
        websiteUrl: url,
        primaryColor: brandResult.primaryColor,
        secondaryColor: brandResult.secondaryColor,
        accentColor: brandResult.accentColor,
        backgroundColor: brandResult.backgroundColor,
        textColor: brandResult.textColor,
        fontPrimary: brandResult.fontPrimary,
        fontSecondary: brandResult.fontSecondary,
        logoUrl: brandResult.logoUrl,
        rawExtraction: brandResult.rawExtraction,
      },
    })
  } catch (error) {
    console.error('Brand kit extraction error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during brand extraction.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
