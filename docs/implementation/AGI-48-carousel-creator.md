# AGI-48: Carousel/PDF Creator Implementation Plan

## Overview
Build a carousel creator with branded PDF export for LinkedIn carousel posts.

## Current State Analysis

### Existing Components
- `app/dashboard/carousels/page.tsx` - Page component (exists)
- `components/features/carousel-creator.tsx` - Main component (exists, needs enhancement)
- `lib/pdf-export.ts` - PDF generation using pdf-lib (exists, needs integration)

### Gap Analysis
1. **Type Mismatch**: Component uses `CarouselSlide` with `content` and `type` fields, while pdf-export uses `title`, `content`, and `order`
2. **Missing Integration**: Component doesn't call PDF export functions
3. **No Brand Kit Persistence**: Brand kit not loaded from user settings
4. **No Carousel Storage**: No database table for carousel drafts

## Architecture

### Type Definitions

```typescript
// types/carousel.ts
export interface CarouselSlide {
  id: string
  content: string
  type: 'title' | 'content' | 'stat' | 'cta'
}

export interface BrandKit {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  logoUrl?: string
}

export type TemplateType = 'bold' | 'minimalist' | 'data' | 'story'
export type FormatType = 'square' | 'portrait' | 'landscape'
```

### Component Structure

```
CarouselCreator (main container)
├── SlideEditor (left panel)
│   ├── TemplateSelector
│   ├── SlideList
│   └── AddSlideButton
├── SlidePreview (right panel)
│   ├── PreviewCanvas
│   ├── NavigationControls
│   └── BrandKitToggle
└── ActionFooter
    ├── SaveDraftButton
    └── ExportPDFButton
```

### PDF Export Flow

1. User clicks "Export PDF"
2. Convert component's `CarouselSlide[]` to pdf-export format
3. Call `exportCarouselToPDF()` with options
4. Call `downloadPDF()` to trigger download
5. Optionally show success toast

## Implementation Tasks

### 1. Create Carousel Types File
- Path: `types/carousel.ts`
- Export unified types for carousel slides, brand kit, and templates

### 2. Create useCarousel Hook
- Path: `hooks/use-carousel.ts`
- Manages carousel state (slides, template, brand kit)
- Handles PDF export logic
- Handles save draft functionality

### 3. Update Carousel Creator Component
- Integrate with pdf-export.ts
- Add brand kit loading from settings
- Add toast notifications for export/save
- Improve template preview rendering

### 4. Update PDF Export Library
- Update slide interface to match component
- Add support for slide types (title, content, stat, cta)
- Ensure template rendering matches preview

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `types/carousel.ts` | Create | Unified carousel type definitions |
| `hooks/use-carousel.ts` | Create | Carousel state management hook |
| `components/features/carousel-creator.tsx` | Update | Integrate PDF export |
| `lib/pdf-export.ts` | Update | Match component slide interface |

## Technical Decisions

### PDF Library: pdf-lib
- Already installed in project
- Works client-side (no server required)
- Supports custom fonts and colors
- Lightweight and performant

### Brand Kit Source
- Load from user settings (BrandKit type in types/index.ts)
- Default to LinkedIn blue colors (#0077B5, #00A0DC)
- Font defaults to system fonts (no custom font loading)

### Page Sizes
- Square: 612x612 pts (LinkedIn carousel optimal)
- Portrait: 612x792 pts (letter)
- Landscape: 792x612 pts

## Acceptance Criteria Mapping

| Criteria | Implementation |
|----------|----------------|
| PDF files valid | pdf-lib generates valid PDFs |
| Brand colors applied | hexToRgb converts, template applies |
| PDFs attachable | Downloads as .pdf file |

## Testing Plan

1. Create carousel with all slide types
2. Toggle brand kit on/off
3. Switch between all 4 templates
4. Export PDF and verify file opens
5. Check brand colors in exported PDF
6. Verify all slides present in PDF
