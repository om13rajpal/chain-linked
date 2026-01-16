/**
 * Carousel Types
 * @description Type definitions for carousel creator and PDF export
 * @module types/carousel
 */

/**
 * Slide type determining the purpose and styling of a carousel slide
 */
export type SlideType = 'title' | 'content' | 'stat' | 'cta'

/**
 * Represents a single slide in a carousel
 */
export interface CarouselSlide {
  /** Unique identifier for the slide */
  id: string
  /** Text content of the slide */
  content: string
  /** Type of slide determining its purpose and styling */
  type: SlideType
}

/**
 * Brand kit configuration for carousel styling
 */
export interface CarouselBrandKit {
  /** Primary brand color (hex format, e.g., "#0077B5") */
  primaryColor: string
  /** Secondary brand color (hex format) */
  secondaryColor: string
  /** Font family name */
  fontFamily: string
  /** Optional logo URL */
  logoUrl?: string
}

/**
 * Available carousel template types
 */
export type CarouselTemplateType = 'bold' | 'minimalist' | 'data' | 'story'

/**
 * Available format types for PDF page dimensions
 */
export type CarouselFormatType = 'square' | 'portrait' | 'landscape'

/**
 * Template configuration with display name and description
 */
export interface CarouselTemplateConfig {
  /** Display name of the template */
  name: string
  /** Brief description of the template style */
  description: string
}

/**
 * Options for exporting a carousel to PDF
 */
export interface CarouselExportOptions {
  /** Array of slides to include in the PDF */
  slides: CarouselSlide[]
  /** Brand kit for styling the PDF */
  brandKit: CarouselBrandKit
  /** Template style to apply */
  template: CarouselTemplateType
  /** Page format/orientation (defaults to "square") */
  format?: CarouselFormatType
  /** Output filename (defaults to "carousel.pdf") */
  filename?: string
}

/**
 * Carousel draft for saving/loading
 */
export interface CarouselDraft {
  /** Unique identifier for the draft */
  id: string
  /** User ID who created the draft */
  userId: string
  /** Name/title of the carousel */
  name: string
  /** Array of slides in the carousel */
  slides: CarouselSlide[]
  /** Selected template type */
  template: CarouselTemplateType
  /** Whether brand kit is applied */
  brandKitApplied: boolean
  /** Creation timestamp */
  createdAt: string
  /** Last update timestamp */
  updatedAt: string
}

/**
 * Template configurations for the carousel creator
 */
export const CAROUSEL_TEMPLATES: Record<CarouselTemplateType, CarouselTemplateConfig> = {
  bold: {
    name: 'Bold',
    description: 'Large text, strong colors',
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Clean, lots of whitespace',
  },
  data: {
    name: 'Data-Focused',
    description: 'Numbers prominent',
  },
  story: {
    name: 'Story-Style',
    description: 'Narrative flow',
  },
}

/**
 * Default brand kit colors (LinkedIn blue)
 */
export const DEFAULT_BRAND_KIT: CarouselBrandKit = {
  primaryColor: '#0077B5',
  secondaryColor: '#00A0DC',
  fontFamily: 'Inter, sans-serif',
}

/**
 * Default slides for new carousels
 */
export const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    content: '5 Tips for LinkedIn Success',
    type: 'title',
  },
  {
    id: 'slide-2',
    content: 'Tip 1: Post consistently to build your audience',
    type: 'content',
  },
  {
    id: 'slide-3',
    content: '78% of professionals say LinkedIn helps them grow',
    type: 'stat',
  },
  {
    id: 'slide-4',
    content: 'Tip 2: Engage with your network daily',
    type: 'content',
  },
  {
    id: 'slide-5',
    content: 'Follow for more tips! Link in comments',
    type: 'cta',
  },
]
