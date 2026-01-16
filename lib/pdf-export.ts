/**
 * PDF Export Utility
 * @description Exports carousel slides to PDF format using pdf-lib
 * @module lib/pdf-export
 */

import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, RGB } from 'pdf-lib'

/**
 * Slide type determining the purpose and styling of a carousel slide
 */
export type SlideType = 'title' | 'content' | 'stat' | 'cta'

/**
 * Represents a single slide in a carousel for PDF export
 */
export interface CarouselSlide {
  /** Unique identifier for the slide */
  id: string
  /** Title text (used for title/cta slides) */
  title: string
  /** Main content text (used for content/stat slides) */
  content: string
  /** Order/position of the slide in the carousel (0-indexed) */
  order: number
  /** Optional slide type for template rendering */
  slideType?: SlideType
}

/**
 * Brand kit configuration for carousel styling
 */
export interface BrandKit {
  /** Primary brand color in hex format (e.g., "#0077B5") */
  primaryColor: string
  /** Secondary brand color in hex format */
  secondaryColor: string
  /** Font family name (optional, defaults to Helvetica) */
  fontFamily?: string
  /** URL to the brand logo image (optional) */
  logoUrl?: string
}

/**
 * Available template types for PDF export
 */
export type TemplateType = 'bold' | 'minimalist' | 'data' | 'story'

/**
 * Available format types for PDF page dimensions
 */
export type FormatType = 'square' | 'portrait' | 'landscape'

/**
 * Options for exporting a carousel to PDF
 */
export interface PDFExportOptions {
  /** Array of slides to include in the PDF */
  slides: CarouselSlide[]
  /** Brand kit for styling the PDF */
  brandKit: BrandKit
  /** Template style to apply */
  template: TemplateType
  /** Page format/orientation (defaults to "square") */
  format?: FormatType
  /** Output filename (defaults to "carousel.pdf") */
  filename?: string
}

/**
 * Page dimensions in points (72 points = 1 inch)
 */
interface PageDimensions {
  width: number
  height: number
}

/** Page size configurations */
const PAGE_SIZES: Record<FormatType, PageDimensions> = {
  square: { width: 612, height: 612 },
  portrait: { width: 612, height: 792 },
  landscape: { width: 792, height: 612 },
}

/**
 * Converts a hex color string to RGB values for pdf-lib
 * @param hex - The hex color string (e.g., "#0077B5" or "0077B5")
 * @returns RGB object compatible with pdf-lib
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '')

  // Parse hex values
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255

  return rgb(r, g, b)
}

/**
 * Wraps text to fit within a specified width
 * @param text - The text to wrap
 * @param font - The PDF font to use for measurement
 * @param fontSize - The font size in points
 * @param maxWidth - The maximum width in points
 * @returns Array of text lines
 */
function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const textWidth = font.widthOfTextAtSize(testLine, fontSize)

    if (textWidth <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * Gets the display text for a slide based on its type
 * @param slide - The slide to get text from
 * @returns The text to display on the slide
 */
function getSlideText(slide: CarouselSlide): { title: string; content: string } {
  const slideType = slide.slideType || 'content'

  // If slide has explicit title/content from the old format, use those
  if (slide.title && slide.content) {
    return { title: slide.title, content: slide.content }
  }

  // For the new format where title OR content contains the text based on type
  switch (slideType) {
    case 'title':
    case 'cta':
      return {
        title: slide.title || slide.content || '',
        content: '',
      }
    case 'stat':
      return {
        title: '',
        content: slide.content || slide.title || '',
      }
    case 'content':
    default:
      return {
        title: '',
        content: slide.content || slide.title || '',
      }
  }
}

/**
 * Draws the bold template style on a page
 * Large title, colored background (primaryColor), white text
 */
async function drawBoldTemplate(
  page: PDFPage,
  slide: CarouselSlide,
  slideNumber: number,
  totalSlides: number,
  brandKit: BrandKit,
  fonts: { regular: PDFFont; bold: PDFFont }
): Promise<void> {
  const { width, height } = page.getSize()
  const primaryColor = hexToRgb(brandKit.primaryColor)
  const whiteColor = rgb(1, 1, 1)
  const padding = 50
  const slideType = slide.slideType || 'content'
  const { title, content } = getSlideText(slide)

  // Draw colored background for title/cta slides, white for others
  const isAccentSlide = slideType === 'title' || slideType === 'cta'
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: isAccentSlide ? primaryColor : rgb(1, 1, 1),
  })

  const textColor = isAccentSlide ? whiteColor : rgb(0.1, 0.1, 0.1)

  // Draw main text
  const mainText = title || content
  const fontSize = slideType === 'stat' ? 56 : slideType === 'title' ? 42 : 32
  const lines = wrapText(mainText, fonts.bold, fontSize, width - padding * 2)
  const lineHeight = fontSize * 1.3
  const blockHeight = lines.length * lineHeight
  let textY = (height + blockHeight) / 2

  for (const line of lines) {
    const textWidth = fonts.bold.widthOfTextAtSize(line, fontSize)
    page.drawText(line, {
      x: (width - textWidth) / 2,
      y: textY,
      size: fontSize,
      font: fonts.bold,
      color: textColor,
    })
    textY -= lineHeight
  }

  // Draw slide number at bottom
  const slideNumberText = `${slideNumber} / ${totalSlides}`
  const slideNumFontSize = 14
  const slideNumWidth = fonts.regular.widthOfTextAtSize(
    slideNumberText,
    slideNumFontSize
  )
  page.drawText(slideNumberText, {
    x: (width - slideNumWidth) / 2,
    y: 30,
    size: slideNumFontSize,
    font: fonts.regular,
    color: isAccentSlide ? rgb(0.8, 0.8, 0.8) : rgb(0.5, 0.5, 0.5),
  })
}

/**
 * Draws the minimalist template style on a page
 * White background, black text, thin accent line
 */
async function drawMinimalistTemplate(
  page: PDFPage,
  slide: CarouselSlide,
  slideNumber: number,
  totalSlides: number,
  brandKit: BrandKit,
  fonts: { regular: PDFFont; bold: PDFFont }
): Promise<void> {
  const { width, height } = page.getSize()
  const primaryColor = hexToRgb(brandKit.primaryColor)
  const textColor = rgb(0.1, 0.1, 0.1)
  const lightGray = rgb(0.98, 0.98, 0.98)
  const padding = 60
  const slideType = slide.slideType || 'content'
  const { title, content } = getSlideText(slide)

  // Draw light gray background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: lightGray,
  })

  // Draw thin accent line on the left for title/cta
  if (slideType === 'title' || slideType === 'cta') {
    page.drawRectangle({
      x: padding - 20,
      y: height * 0.3,
      width: 4,
      height: height * 0.4,
      color: primaryColor,
    })
  }

  // Draw main text
  const mainText = title || content
  const fontSize = slideType === 'title' ? 32 : slideType === 'stat' ? 40 : 24
  const font = slideType === 'title' || slideType === 'stat' ? fonts.bold : fonts.regular
  const lines = wrapText(mainText, font, fontSize, width - padding * 2 - 20)
  const lineHeight = fontSize * 1.5
  const blockHeight = lines.length * lineHeight
  let textY = (height + blockHeight) / 2

  for (const line of lines) {
    const textWidth = font.widthOfTextAtSize(line, fontSize)
    page.drawText(line, {
      x: (width - textWidth) / 2,
      y: textY,
      size: fontSize,
      font,
      color: textColor,
    })
    textY -= lineHeight
  }

  // Draw slide number at bottom center
  const slideNumberText = `${slideNumber} / ${totalSlides}`
  const slideNumFontSize = 12
  const slideNumWidth = fonts.regular.widthOfTextAtSize(
    slideNumberText,
    slideNumFontSize
  )
  page.drawText(slideNumberText, {
    x: (width - slideNumWidth) / 2,
    y: 30,
    size: slideNumFontSize,
    font: fonts.regular,
    color: rgb(0.5, 0.5, 0.5),
  })
}

/**
 * Draws the data template style on a page
 * Numbered slides, clean layout with emphasis on data
 */
async function drawDataTemplate(
  page: PDFPage,
  slide: CarouselSlide,
  slideNumber: number,
  totalSlides: number,
  brandKit: BrandKit,
  fonts: { regular: PDFFont; bold: PDFFont }
): Promise<void> {
  const { width, height } = page.getSize()
  const primaryColor = hexToRgb(brandKit.primaryColor)
  const secondaryColor = hexToRgb(brandKit.secondaryColor)
  const textColor = rgb(0.1, 0.1, 0.1)
  const whiteColor = rgb(1, 1, 1)
  const padding = 50
  const slideType = slide.slideType || 'content'
  const { title, content } = getSlideText(slide)

  // For stat slides, use primary color background
  const isStatSlide = slideType === 'stat'

  // Draw background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: isStatSlide ? primaryColor : whiteColor,
  })

  // Draw large slide number in top left (not for stat slides)
  if (!isStatSlide) {
    const numberFontSize = 72
    const numberText = slideNumber.toString().padStart(2, '0')
    page.drawText(numberText, {
      x: padding,
      y: height - padding - 50,
      size: numberFontSize,
      font: fonts.bold,
      color: primaryColor,
    })

    // Draw horizontal accent line
    page.drawRectangle({
      x: padding,
      y: height - padding - 80,
      width: width - padding * 2,
      height: 3,
      color: secondaryColor,
    })
  }

  // Draw main text
  const mainText = title || content
  const fontSize = isStatSlide ? 56 : slideType === 'title' ? 32 : 24
  const font = isStatSlide || slideType === 'title' ? fonts.bold : fonts.regular
  const lines = wrapText(mainText, font, fontSize, width - padding * 2)
  const lineHeight = fontSize * 1.4
  const blockHeight = lines.length * lineHeight
  let textY = (height + blockHeight) / 2

  for (const line of lines) {
    const textWidth = font.widthOfTextAtSize(line, fontSize)
    page.drawText(line, {
      x: (width - textWidth) / 2,
      y: textY,
      size: fontSize,
      font,
      color: isStatSlide ? whiteColor : textColor,
    })
    textY -= lineHeight
  }

  // Draw slide number at bottom with accent bar
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 50,
    color: isStatSlide ? secondaryColor : primaryColor,
  })

  const slideNumberText = `${slideNumber} of ${totalSlides}`
  const slideNumFontSize = 14
  const slideNumWidth = fonts.regular.widthOfTextAtSize(
    slideNumberText,
    slideNumFontSize
  )
  page.drawText(slideNumberText, {
    x: (width - slideNumWidth) / 2,
    y: 18,
    size: slideNumFontSize,
    font: fonts.regular,
    color: whiteColor,
  })
}

/**
 * Draws the story template style on a page
 * Gradient-like effect using rectangles, narrative flow
 */
async function drawStoryTemplate(
  page: PDFPage,
  slide: CarouselSlide,
  slideNumber: number,
  totalSlides: number,
  brandKit: BrandKit,
  fonts: { regular: PDFFont; bold: PDFFont }
): Promise<void> {
  const { width, height } = page.getSize()
  const primaryColor = hexToRgb(brandKit.primaryColor)
  const secondaryColor = hexToRgb(brandKit.secondaryColor)
  const whiteColor = rgb(1, 1, 1)
  const textColor = rgb(0.2, 0.2, 0.2)
  const padding = 50
  const slideType = slide.slideType || 'content'
  const { title, content } = getSlideText(slide)

  const isTitleSlide = slideType === 'title'

  if (isTitleSlide) {
    // Create gradient-like effect with overlapping rectangles for title
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: primaryColor,
    })

    page.drawRectangle({
      x: width * 0.3,
      y: 0,
      width: width * 0.7,
      height: height,
      color: secondaryColor,
      opacity: 0.7,
    })

    // Draw main text centered
    const mainText = title || content
    const fontSize = 38
    const lines = wrapText(mainText, fonts.bold, fontSize, width - padding * 2)
    const lineHeight = fontSize * 1.4
    const blockHeight = lines.length * lineHeight
    let textY = (height + blockHeight) / 2

    for (const line of lines) {
      const textWidth = fonts.bold.widthOfTextAtSize(line, fontSize)
      page.drawText(line, {
        x: (width - textWidth) / 2,
        y: textY,
        size: fontSize,
        font: fonts.bold,
        color: whiteColor,
      })
      textY -= lineHeight
    }
  } else {
    // White background with accent for content slides
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: whiteColor,
    })

    // Add subtle left border accent
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 6,
      height: height,
      color: primaryColor,
    })

    // Draw main text
    const mainText = title || content
    const fontSize = slideType === 'stat' ? 48 : slideType === 'cta' ? 28 : 24
    const font = slideType === 'stat' ? fonts.bold : fonts.regular
    const lines = wrapText(mainText, font, fontSize, width - padding * 3)
    const lineHeight = fontSize * 1.6
    const blockHeight = lines.length * lineHeight
    let textY = (height + blockHeight) / 2

    for (const line of lines) {
      page.drawText(line, {
        x: padding * 1.5,
        y: textY,
        size: fontSize,
        font,
        color: textColor,
      })
      textY -= lineHeight
    }
  }

  // Draw slide indicator dots at bottom
  const dotRadius = 5
  const dotSpacing = 20
  const dotsWidth = totalSlides * dotSpacing
  const dotsStartX = (width - dotsWidth) / 2

  for (let i = 1; i <= totalSlides; i++) {
    const x = dotsStartX + i * dotSpacing
    page.drawCircle({
      x,
      y: 25,
      size: dotRadius,
      color: i === slideNumber ? (isTitleSlide ? whiteColor : primaryColor) : rgb(0.7, 0.7, 0.7),
    })
  }
}

/**
 * Exports a carousel to a PDF document.
 *
 * Creates a multi-page PDF with one page per slide, applying the selected
 * template style and brand kit colors.
 *
 * @param options - The export configuration options
 * @returns A Blob containing the PDF data
 *
 * @example
 * ```typescript
 * const slides: CarouselSlide[] = [
 *   { id: "1", title: "Welcome", content: "", order: 0, slideType: "title" },
 *   { id: "2", title: "", content: "Main content here", order: 1, slideType: "content" },
 * ]
 *
 * const brandKit: BrandKit = {
 *   primaryColor: "#0077B5",
 *   secondaryColor: "#00A0DC",
 * }
 *
 * const pdfBlob = await exportCarouselToPDF({
 *   slides,
 *   brandKit,
 *   template: "bold",
 *   format: "square",
 * })
 *
 * downloadPDF(pdfBlob, "my-carousel.pdf")
 * ```
 */
export async function exportCarouselToPDF(
  options: PDFExportOptions
): Promise<Blob> {
  const {
    slides,
    brandKit,
    template,
    format = 'square',
  } = options

  // Validate inputs
  if (!slides || slides.length === 0) {
    throw new Error('At least one slide is required to export a PDF')
  }

  // Sort slides by order
  const sortedSlides = [...slides].sort((a, b) => a.order - b.order)

  // Get page dimensions
  const pageSize = PAGE_SIZES[format]

  // Create PDF document
  const pdfDoc = await PDFDocument.create()

  // Embed fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fonts = { regular: helvetica, bold: helveticaBold }

  // Add pages for each slide
  for (let i = 0; i < sortedSlides.length; i++) {
    const slide = sortedSlides[i]
    const page = pdfDoc.addPage([pageSize.width, pageSize.height])
    const slideNumber = i + 1
    const totalSlides = sortedSlides.length

    // Apply template style
    switch (template) {
      case 'bold':
        await drawBoldTemplate(page, slide, slideNumber, totalSlides, brandKit, fonts)
        break
      case 'minimalist':
        await drawMinimalistTemplate(page, slide, slideNumber, totalSlides, brandKit, fonts)
        break
      case 'data':
        await drawDataTemplate(page, slide, slideNumber, totalSlides, brandKit, fonts)
        break
      case 'story':
        await drawStoryTemplate(page, slide, slideNumber, totalSlides, brandKit, fonts)
        break
      default:
        await drawBoldTemplate(page, slide, slideNumber, totalSlides, brandKit, fonts)
    }
  }

  // Serialize to bytes
  const pdfBytes = await pdfDoc.save()

  // Convert Uint8Array to ArrayBuffer for Blob compatibility
  const arrayBuffer = new ArrayBuffer(pdfBytes.length)
  const view = new Uint8Array(arrayBuffer)
  view.set(pdfBytes)

  // Convert to Blob
  return new Blob([arrayBuffer], { type: 'application/pdf' })
}

/**
 * Downloads a PDF blob to the user's device.
 *
 * Creates a temporary anchor element to trigger the browser's download
 * functionality with the specified filename.
 *
 * @param blob - The PDF blob to download
 * @param filename - The filename to use for the download (defaults to "carousel.pdf")
 *
 * @example
 * ```typescript
 * const pdfBlob = await exportCarouselToPDF(options)
 * downloadPDF(pdfBlob, "my-linkedin-carousel.pdf")
 * ```
 */
export function downloadPDF(blob: Blob, filename: string = 'carousel.pdf'): void {
  // Ensure filename has .pdf extension
  const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`

  // Create object URL for the blob
  const url = URL.createObjectURL(blob)

  // Create temporary anchor element
  const link = document.createElement('a')
  link.href = url
  link.download = finalFilename

  // Append to document, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the object URL
  URL.revokeObjectURL(url)
}
