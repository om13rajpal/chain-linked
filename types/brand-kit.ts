/**
 * Brand Kit Types
 * @description TypeScript types for brand kit extraction and management
 * @module types/brand-kit
 */

/**
 * Extracted color from website
 */
export interface ExtractedColor {
  /** Hex color value */
  hex: string
  /** Color name or role (e.g., "primary", "background") */
  name: string
  /** Confidence score 0-1 */
  confidence: number
  /** Source of extraction (e.g., "css-variable", "meta-theme", "inline-style") */
  source: string
}

/**
 * Extracted font from website
 */
export interface ExtractedFont {
  /** Font family name */
  family: string
  /** Font role (e.g., "heading", "body") */
  role: 'primary' | 'secondary' | 'monospace'
  /** Font weight if detected */
  weight?: string
  /** Source URL (e.g., Google Fonts) */
  sourceUrl?: string
  /** Confidence score 0-1 */
  confidence: number
}

/**
 * Extracted logo from website
 */
export interface ExtractedLogo {
  /** Logo URL */
  url: string
  /** Logo type */
  type: 'favicon' | 'og-image' | 'detected' | 'uploaded'
  /** Image width if known */
  width?: number
  /** Image height if known */
  height?: number
  /** Alt text if available */
  alt?: string
  /** Confidence score 0-1 */
  confidence: number
}

/**
 * Raw extraction result from Firecrawl
 */
export interface RawExtractionData {
  /** All detected colors */
  colors: ExtractedColor[]
  /** All detected fonts */
  fonts: ExtractedFont[]
  /** All detected logos */
  logos: ExtractedLogo[]
  /** CSS variables found */
  cssVariables: Record<string, string>
  /** Meta tags extracted */
  metaTags: Record<string, string>
  /** Extraction timestamp */
  extractedAt: string
  /** Source URL */
  sourceUrl: string
}

/**
 * Brand kit as stored in database
 */
export interface BrandKit {
  /** Unique identifier */
  id: string
  /** User who owns this brand kit */
  userId: string
  /** Optional team association */
  teamId?: string | null
  /** Source website URL */
  websiteUrl: string
  /** Primary brand color (hex) */
  primaryColor: string
  /** Secondary brand color (hex) */
  secondaryColor?: string | null
  /** Accent color (hex) */
  accentColor?: string | null
  /** Background color (hex) */
  backgroundColor?: string | null
  /** Main text color (hex) */
  textColor?: string | null
  /** Primary font family */
  fontPrimary?: string | null
  /** Secondary font family */
  fontSecondary?: string | null
  /** Extracted logo URL */
  logoUrl?: string | null
  /** Supabase storage path if logo uploaded */
  logoStoragePath?: string | null
  /** Raw extraction data for debugging */
  rawExtraction?: RawExtractionData | null
  /** Whether this is the active brand kit */
  isActive: boolean
  /** Creation timestamp */
  createdAt: string
  /** Last update timestamp */
  updatedAt: string
}

/**
 * Brand kit for creating a new record
 */
export interface BrandKitInsert {
  /** User who owns this brand kit */
  userId: string
  /** Optional team association */
  teamId?: string | null
  /** Source website URL */
  websiteUrl: string
  /** Primary brand color (hex) */
  primaryColor: string
  /** Secondary brand color (hex) */
  secondaryColor?: string | null
  /** Accent color (hex) */
  accentColor?: string | null
  /** Background color (hex) */
  backgroundColor?: string | null
  /** Main text color (hex) */
  textColor?: string | null
  /** Primary font family */
  fontPrimary?: string | null
  /** Secondary font family */
  fontSecondary?: string | null
  /** Extracted logo URL */
  logoUrl?: string | null
  /** Supabase storage path if logo uploaded */
  logoStoragePath?: string | null
  /** Raw extraction data */
  rawExtraction?: RawExtractionData | null
  /** Whether this is the active brand kit */
  isActive?: boolean
}

/**
 * Brand kit update payload
 */
export interface BrandKitUpdate {
  /** Source website URL */
  websiteUrl?: string
  /** Primary brand color (hex) */
  primaryColor?: string
  /** Secondary brand color (hex) */
  secondaryColor?: string | null
  /** Accent color (hex) */
  accentColor?: string | null
  /** Background color (hex) */
  backgroundColor?: string | null
  /** Main text color (hex) */
  textColor?: string | null
  /** Primary font family */
  fontPrimary?: string | null
  /** Secondary font family */
  fontSecondary?: string | null
  /** Extracted logo URL */
  logoUrl?: string | null
  /** Supabase storage path if logo uploaded */
  logoStoragePath?: string | null
  /** Whether this is the active brand kit */
  isActive?: boolean
}

/**
 * API response for brand kit extraction
 */
export interface ExtractBrandKitResponse {
  /** Success indicator */
  success: boolean
  /** Extracted brand kit (not yet saved) */
  brandKit?: {
    websiteUrl: string
    primaryColor: string
    secondaryColor: string | null
    accentColor: string | null
    backgroundColor: string | null
    textColor: string | null
    fontPrimary: string | null
    fontSecondary: string | null
    logoUrl: string | null
    rawExtraction: RawExtractionData
  }
  /** Error message if extraction failed */
  error?: string
  /** Additional details for debugging */
  details?: string
}

/**
 * API request for brand kit extraction
 */
export interface ExtractBrandKitRequest {
  /** Website URL to extract brand from */
  url: string
}

/**
 * Default fallback colors when extraction fails
 */
export const DEFAULT_BRAND_COLORS = {
  primary: '#0066CC',
  secondary: '#4D94DB',
  accent: '#00A3E0',
  background: '#FFFFFF',
  text: '#1A1A1A',
} as const

/**
 * Default fallback fonts when extraction fails
 */
export const DEFAULT_BRAND_FONTS = {
  primary: 'Inter, system-ui, sans-serif',
  secondary: 'Inter, system-ui, sans-serif',
} as const
