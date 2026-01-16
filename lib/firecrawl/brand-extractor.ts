/**
 * Brand Extractor
 * @description Extracts brand colors, fonts, and logos from HTML content
 * @module lib/firecrawl/brand-extractor
 */

import type { FirecrawlScrapeData, FirecrawlMetadata } from './types'
import type {
  ExtractedColor,
  ExtractedFont,
  ExtractedLogo,
  RawExtractionData,
  DEFAULT_BRAND_COLORS,
  DEFAULT_BRAND_FONTS,
} from '@/types/brand-kit'

/**
 * Result of brand extraction
 */
export interface BrandExtractionResult {
  /** Whether extraction was successful */
  success: boolean
  /** Primary color (hex) */
  primaryColor: string
  /** Secondary color (hex) */
  secondaryColor: string | null
  /** Accent color (hex) */
  accentColor: string | null
  /** Background color (hex) */
  backgroundColor: string | null
  /** Text color (hex) */
  textColor: string | null
  /** Primary font family */
  fontPrimary: string | null
  /** Secondary font family */
  fontSecondary: string | null
  /** Logo URL */
  logoUrl: string | null
  /** Raw extraction data */
  rawExtraction: RawExtractionData
  /** Error message if extraction failed */
  error?: string
}

/** CSS properties that commonly contain primary brand colors */
const PRIMARY_COLOR_INDICATORS = [
  '--primary',
  '--brand',
  '--accent',
  '--main',
  '--theme',
  '--color-primary',
  '--color-brand',
  '--tw-primary',
  'primary-color',
  'brand-color',
]

/** CSS properties that commonly contain secondary colors */
const SECONDARY_COLOR_INDICATORS = [
  '--secondary',
  '--color-secondary',
  '--tw-secondary',
  'secondary-color',
]

/** CSS properties that commonly contain background colors */
const BACKGROUND_COLOR_INDICATORS = [
  '--background',
  '--bg',
  '--color-background',
  '--surface',
  'background-color',
  'bg-color',
]

/** CSS properties that commonly contain text colors */
const TEXT_COLOR_INDICATORS = [
  '--text',
  '--foreground',
  '--color-text',
  '--font-color',
  'text-color',
  'font-color',
]

/** System fonts to filter out when extracting brand fonts */
const SYSTEM_FONTS = [
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Oxygen',
  'Ubuntu',
  'Cantarell',
  'Fira Sans',
  'Droid Sans',
  'Helvetica Neue',
  'Arial',
  'sans-serif',
  'serif',
  'monospace',
  'cursive',
  'fantasy',
  'inherit',
  'initial',
  'unset',
]

/**
 * Extracts hex color from various color formats
 * @param colorStr - Color string (hex, rgb, hsl, etc.)
 * @returns Hex color string or null
 */
function parseColorToHex(colorStr: string): string | null {
  const trimmed = colorStr.trim().toLowerCase()

  // Already hex
  if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) {
    // Normalize 3-digit hex to 6-digit
    if (trimmed.length === 4) {
      return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
    }
    return trimmed.slice(0, 7) // Return 6-digit hex, ignore alpha
  }

  // RGB format
  const rgbMatch = trimmed.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10)
    const g = parseInt(rgbMatch[2], 10)
    const b = parseInt(rgbMatch[3], 10)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // RGBA format
  const rgbaMatch = trimmed.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10)
    const g = parseInt(rgbaMatch[2], 10)
    const b = parseInt(rgbaMatch[3], 10)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // HSL format (approximate conversion)
  const hslMatch = trimmed.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)/)
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]) / 360
    const s = parseFloat(hslMatch[2]) / 100
    const l = parseFloat(hslMatch[3]) / 100

    // HSL to RGB conversion
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`
  }

  return null
}

/**
 * Checks if a color is too close to white or black
 * @param hex - Hex color string
 * @returns True if color is neutral
 */
function isNeutralColor(hex: string): boolean {
  if (!hex || hex.length < 7) return true

  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // Check if close to white
  if (r > 240 && g > 240 && b > 240) return true
  // Check if close to black
  if (r < 15 && g < 15 && b < 15) return true
  // Check if grayscale
  if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10) {
    return true
  }

  return false
}

/**
 * Calculates color saturation and vibrancy
 * @param hex - Hex color string
 * @returns Saturation score 0-1
 */
function getColorSaturation(hex: string): number {
  if (!hex || hex.length < 7) return 0

  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return 0

  const s = l > 0.5
    ? (max - min) / (2 - max - min)
    : (max - min) / (max + min)

  return s
}

/**
 * Extracts CSS variables from HTML content
 * @param html - HTML string
 * @returns Map of CSS variable names to values
 */
function extractCssVariables(html: string): Record<string, string> {
  const variables: Record<string, string> = {}

  // Match CSS variable declarations
  const cssVarRegex = /--([\w-]+)\s*:\s*([^;}\n]+)/g
  let match

  while ((match = cssVarRegex.exec(html)) !== null) {
    const name = `--${match[1]}`
    const value = match[2].trim()
    variables[name] = value
  }

  return variables
}

/**
 * Extracts colors from HTML content
 * @param html - HTML string
 * @param metadata - Page metadata
 * @returns Array of extracted colors
 */
function extractColors(html: string, metadata?: FirecrawlMetadata): ExtractedColor[] {
  const colors: ExtractedColor[] = []
  const seenHex = new Set<string>()

  // 1. Check meta theme-color
  const themeColorMatch = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i)

  if (themeColorMatch) {
    const hex = parseColorToHex(themeColorMatch[1])
    if (hex && !seenHex.has(hex)) {
      seenHex.add(hex)
      colors.push({
        hex,
        name: 'theme-color',
        confidence: 0.95,
        source: 'meta-theme',
      })
    }
  }

  // 2. Extract CSS variables
  const cssVars = extractCssVariables(html)

  // Check for primary colors in CSS variables
  for (const indicator of PRIMARY_COLOR_INDICATORS) {
    for (const [name, value] of Object.entries(cssVars)) {
      if (name.toLowerCase().includes(indicator.replace('--', ''))) {
        const hex = parseColorToHex(value)
        if (hex && !seenHex.has(hex) && !isNeutralColor(hex)) {
          seenHex.add(hex)
          colors.push({
            hex,
            name: 'primary',
            confidence: 0.9,
            source: `css-variable:${name}`,
          })
        }
      }
    }
  }

  // Check for secondary colors
  for (const indicator of SECONDARY_COLOR_INDICATORS) {
    for (const [name, value] of Object.entries(cssVars)) {
      if (name.toLowerCase().includes(indicator.replace('--', ''))) {
        const hex = parseColorToHex(value)
        if (hex && !seenHex.has(hex) && !isNeutralColor(hex)) {
          seenHex.add(hex)
          colors.push({
            hex,
            name: 'secondary',
            confidence: 0.85,
            source: `css-variable:${name}`,
          })
        }
      }
    }
  }

  // Check for background colors
  for (const indicator of BACKGROUND_COLOR_INDICATORS) {
    for (const [name, value] of Object.entries(cssVars)) {
      if (name.toLowerCase().includes(indicator.replace('--', ''))) {
        const hex = parseColorToHex(value)
        if (hex && !seenHex.has(hex)) {
          seenHex.add(hex)
          colors.push({
            hex,
            name: 'background',
            confidence: 0.8,
            source: `css-variable:${name}`,
          })
        }
      }
    }
  }

  // Check for text colors
  for (const indicator of TEXT_COLOR_INDICATORS) {
    for (const [name, value] of Object.entries(cssVars)) {
      if (name.toLowerCase().includes(indicator.replace('--', ''))) {
        const hex = parseColorToHex(value)
        if (hex && !seenHex.has(hex)) {
          seenHex.add(hex)
          colors.push({
            hex,
            name: 'text',
            confidence: 0.8,
            source: `css-variable:${name}`,
          })
        }
      }
    }
  }

  // 3. Extract colors from inline styles and CSS
  const colorPatterns = [
    // Hex colors
    /#[0-9a-f]{3,6}\b/gi,
    // RGB/RGBA
    /rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi,
    /rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/gi,
  ]

  const colorCounts = new Map<string, number>()

  for (const pattern of colorPatterns) {
    const matches = html.match(pattern) || []
    for (const match of matches) {
      const hex = parseColorToHex(match)
      if (hex && !isNeutralColor(hex)) {
        colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1)
      }
    }
  }

  // Add frequent non-neutral colors as potential accent colors
  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  for (const [hex, count] of sortedColors) {
    if (!seenHex.has(hex)) {
      seenHex.add(hex)
      colors.push({
        hex,
        name: 'detected',
        confidence: Math.min(0.7, 0.3 + count * 0.05),
        source: 'frequency-analysis',
      })
    }
  }

  return colors
}

/**
 * Extracts fonts from HTML content
 * @param html - HTML string
 * @returns Array of extracted fonts
 */
function extractFonts(html: string): ExtractedFont[] {
  const fonts: ExtractedFont[] = []
  const seenFonts = new Set<string>()

  // 1. Extract from Google Fonts links
  const googleFontsMatch = html.match(/fonts\.googleapis\.com\/css[^"'\s>]+family=([^"'\s&>]+)/gi)
  if (googleFontsMatch) {
    for (const match of googleFontsMatch) {
      const familyMatch = match.match(/family=([^&"'\s]+)/)
      if (familyMatch) {
        const families = decodeURIComponent(familyMatch[1]).split('|')
        for (const family of families) {
          const fontName = family.split(':')[0].replace(/\+/g, ' ')
          if (!seenFonts.has(fontName.toLowerCase())) {
            seenFonts.add(fontName.toLowerCase())
            fonts.push({
              family: fontName,
              role: fonts.length === 0 ? 'primary' : 'secondary',
              sourceUrl: `https://fonts.googleapis.com/css?family=${encodeURIComponent(family)}`,
              confidence: 0.9,
            })
          }
        }
      }
    }
  }

  // 2. Extract font-family declarations from CSS
  const fontFamilyRegex = /font-family\s*:\s*([^;}\n]+)/gi
  let match

  while ((match = fontFamilyRegex.exec(html)) !== null) {
    const fontList = match[1]
      .split(',')
      .map(f => f.trim().replace(/["']/g, ''))
      .filter(f => !SYSTEM_FONTS.some(sf => sf.toLowerCase() === f.toLowerCase()))

    for (const fontName of fontList) {
      if (fontName && !seenFonts.has(fontName.toLowerCase()) && fontName.length < 50) {
        seenFonts.add(fontName.toLowerCase())
        fonts.push({
          family: fontName,
          role: fonts.length === 0 ? 'primary' : fonts.length === 1 ? 'secondary' : 'secondary',
          confidence: 0.7,
        })
      }
    }
  }

  return fonts
}

/**
 * Extracts logos from HTML content and metadata
 * @param html - HTML string
 * @param metadata - Page metadata
 * @param sourceUrl - Source URL for resolving relative paths
 * @returns Array of extracted logos
 */
function extractLogos(html: string, metadata?: FirecrawlMetadata, sourceUrl?: string): ExtractedLogo[] {
  const logos: ExtractedLogo[] = []
  const seenUrls = new Set<string>()

  /**
   * Resolves a relative URL to absolute
   */
  const resolveUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('//')) return `https:${url}`
    if (sourceUrl) {
      try {
        return new URL(url, sourceUrl).href
      } catch {
        return url
      }
    }
    return url
  }

  // 1. Check Open Graph image (often used as logo)
  if (metadata?.ogImage) {
    const url = resolveUrl(metadata.ogImage)
    if (!seenUrls.has(url)) {
      seenUrls.add(url)
      logos.push({
        url,
        type: 'og-image',
        confidence: 0.7,
      })
    }
  }

  // 2. Extract og:image from HTML
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)

  if (ogImageMatch) {
    const url = resolveUrl(ogImageMatch[1])
    if (!seenUrls.has(url)) {
      seenUrls.add(url)
      logos.push({
        url,
        type: 'og-image',
        confidence: 0.7,
      })
    }
  }

  // 3. Extract favicons and icons (prefer larger sizes)
  const iconMatches = [
    // Apple touch icons (usually high quality)
    ...Array.from(html.matchAll(/<link[^>]+rel=["']apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/gi)),
    // Standard icons with sizes
    ...Array.from(html.matchAll(/<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["'][^>]*sizes=["'](\d+)/gi)),
    // Shortcut icons
    ...Array.from(html.matchAll(/<link[^>]+rel=["']shortcut icon["'][^>]+href=["']([^"']+)["']/gi)),
    // Standard favicon
    ...Array.from(html.matchAll(/<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["']/gi)),
  ]

  for (const match of iconMatches) {
    const url = resolveUrl(match[1])
    if (url && !seenUrls.has(url)) {
      seenUrls.add(url)
      const size = match[2] ? parseInt(match[2], 10) : undefined
      logos.push({
        url,
        type: 'favicon',
        width: size,
        height: size,
        confidence: size && size >= 128 ? 0.85 : 0.6,
      })
    }
  }

  // 4. Look for images with "logo" in class, id, or alt
  const logoImgMatches = html.matchAll(/<img[^>]+(?:class|id|alt)=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/gi)
  for (const match of logoImgMatches) {
    const url = resolveUrl(match[1])
    if (url && !seenUrls.has(url) && !url.includes('data:')) {
      seenUrls.add(url)
      logos.push({
        url,
        type: 'detected',
        confidence: 0.8,
      })
    }
  }

  // Also check src before class/id/alt
  const logoImgMatchesAlt = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]+(?:class|id|alt)=["'][^"']*logo[^"']*["']/gi)
  for (const match of logoImgMatchesAlt) {
    const url = resolveUrl(match[1])
    if (url && !seenUrls.has(url) && !url.includes('data:')) {
      seenUrls.add(url)
      logos.push({
        url,
        type: 'detected',
        confidence: 0.8,
      })
    }
  }

  // Sort by confidence (highest first)
  return logos.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Extracts brand elements from scraped HTML content
 * @param data - Firecrawl scrape data
 * @param sourceUrl - Source URL for resolving relative paths
 * @returns Brand extraction result
 * @example
 * const result = extractBrand(scrapeData, 'https://stripe.com')
 * console.log(result.primaryColor) // '#635BFF'
 */
export function extractBrand(data: FirecrawlScrapeData, sourceUrl: string): BrandExtractionResult {
  const html = data.html || data.rawHtml || ''
  const metadata = data.metadata

  if (!html) {
    return {
      success: false,
      primaryColor: '#0066CC',
      secondaryColor: null,
      accentColor: null,
      backgroundColor: null,
      textColor: null,
      fontPrimary: null,
      fontSecondary: null,
      logoUrl: null,
      rawExtraction: {
        colors: [],
        fonts: [],
        logos: [],
        cssVariables: {},
        metaTags: {},
        extractedAt: new Date().toISOString(),
        sourceUrl,
      },
      error: 'No HTML content to extract from',
    }
  }

  // Extract all elements
  const colors = extractColors(html, metadata)
  const fonts = extractFonts(html)
  const logos = extractLogos(html, metadata, sourceUrl)
  const cssVariables = extractCssVariables(html)

  // Extract meta tags for reference
  const metaTags: Record<string, string> = {}
  if (metadata) {
    if (metadata.title) metaTags['title'] = metadata.title
    if (metadata.description) metaTags['description'] = metadata.description
    if (metadata.ogTitle) metaTags['og:title'] = metadata.ogTitle
    if (metadata.ogDescription) metaTags['og:description'] = metadata.ogDescription
    if (metadata.ogImage) metaTags['og:image'] = metadata.ogImage
  }

  // Select best colors
  const primaryCandidate = colors.find(c => c.name === 'primary' || c.name === 'theme-color')
    || colors.find(c => !isNeutralColor(c.hex) && getColorSaturation(c.hex) > 0.3)
    || colors[0]

  const secondaryCandidate = colors.find(c => c.name === 'secondary')
    || colors.find(c => c.hex !== primaryCandidate?.hex && !isNeutralColor(c.hex))

  const backgroundCandidate = colors.find(c => c.name === 'background')
  const textCandidate = colors.find(c => c.name === 'text')

  // Find accent color (different from primary and secondary)
  const accentCandidate = colors.find(c =>
    c.hex !== primaryCandidate?.hex &&
    c.hex !== secondaryCandidate?.hex &&
    !isNeutralColor(c.hex) &&
    getColorSaturation(c.hex) > 0.4
  )

  // Select best fonts
  const primaryFont = fonts.find(f => f.role === 'primary') || fonts[0]
  const secondaryFont = fonts.find(f => f.role === 'secondary' && f.family !== primaryFont?.family)
    || fonts.find(f => f.family !== primaryFont?.family)

  // Select best logo
  const bestLogo = logos[0]

  const rawExtraction: RawExtractionData = {
    colors,
    fonts,
    logos,
    cssVariables,
    metaTags,
    extractedAt: new Date().toISOString(),
    sourceUrl,
  }

  return {
    success: true,
    primaryColor: primaryCandidate?.hex || '#0066CC',
    secondaryColor: secondaryCandidate?.hex || null,
    accentColor: accentCandidate?.hex || null,
    backgroundColor: backgroundCandidate?.hex || null,
    textColor: textCandidate?.hex || null,
    fontPrimary: primaryFont?.family || null,
    fontSecondary: secondaryFont?.family || null,
    logoUrl: bestLogo?.url || null,
    rawExtraction,
  }
}
