# AGI-43: Firecrawl Brand Kit Extraction

## Overview

This document outlines the implementation plan for auto-extracting brand colors, fonts, and logos from customer websites using the Firecrawl API. This feature enables customers to quickly set up their brand identity during onboarding by simply entering their website URL.

## Flow

1. Customer enters website URL during onboarding
2. Firecrawl API scrapes the webpage and extracts HTML/CSS content
3. Brand extractor parses the content for:
   - Primary and secondary colors (from CSS variables, inline styles, theme colors)
   - Font families (from CSS font-family declarations)
   - Logo (from favicon, Open Graph images, or common logo patterns)
4. Platform displays a preview of the extracted brand kit
5. User can adjust/confirm the brand kit
6. Brand kit is stored in the database and applied to templates

## Technical Architecture

### Database Schema

**Table: `brand_kits`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users table |
| team_id | uuid | Optional foreign key to teams table |
| website_url | text | Source website URL |
| primary_color | text | Primary brand color (hex) |
| secondary_color | text | Secondary brand color (hex) |
| accent_color | text | Accent color (hex) |
| background_color | text | Background color (hex) |
| text_color | text | Main text color (hex) |
| font_primary | text | Primary font family |
| font_secondary | text | Secondary font family |
| logo_url | text | Extracted logo URL |
| logo_storage_path | text | Supabase storage path if uploaded |
| raw_extraction | jsonb | Raw extraction data for debugging |
| is_active | boolean | Whether this is the active brand kit |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### File Structure

```
lib/
  firecrawl/
    client.ts           # Firecrawl API client
    brand-extractor.ts  # Brand extraction logic
    types.ts            # Types for Firecrawl API

app/
  api/
    brand-kit/
      extract/
        route.ts        # POST endpoint to extract brand kit
      route.ts          # GET/PUT/DELETE for brand kit CRUD

  onboarding/
    brand-kit/
      page.tsx          # Brand kit setup page
      loading.tsx       # Loading state

components/
  features/
    brand-kit-preview.tsx   # Preview component

hooks/
  use-brand-kit.ts          # Hook for brand kit management

types/
  brand-kit.ts              # Brand kit types
```

### Firecrawl API Integration

**Endpoint:** `POST https://api.firecrawl.dev/v1/scrape`

**Request:**
```json
{
  "url": "https://example.com",
  "formats": ["html"],
  "onlyMainContent": false,
  "includeTags": ["head", "style", "link"],
  "waitFor": 2000
}
```

**Key fields to extract:**
- `<meta name="theme-color">` - Theme color
- `<link rel="icon">` - Favicon
- `<meta property="og:image">` - Open Graph image (often logo)
- `<style>` tags - CSS with color and font definitions
- Inline styles with color values
- CSS variables (--primary-color, --brand-color, etc.)

### Brand Extraction Algorithm

1. **Color Extraction:**
   - Parse CSS for color values (hex, rgb, hsl)
   - Check meta theme-color tag
   - Look for CSS variables with "primary", "brand", "accent" keywords
   - Analyze color frequency to find dominant colors
   - Validate color contrast for accessibility

2. **Font Extraction:**
   - Parse CSS font-family declarations
   - Check Google Fonts links
   - Filter out system fonts to find brand fonts
   - Identify primary (headings) vs secondary (body) fonts

3. **Logo Extraction:**
   - Check Open Graph image (`og:image`)
   - Check favicon/icon links (prefer larger sizes)
   - Look for images with "logo" in src/alt/class
   - Validate image dimensions (prefer square/wide logos)

### Component Structure

**BrandKitPreview Component:**
- Color palette display (swatches)
- Font family preview with sample text
- Logo preview with background options
- Edit controls for each element
- Save/Apply buttons

**BrandKitPage:**
- URL input form with validation
- Loading state with progress indicators
- Error handling with retry option
- Preview section
- Navigation to complete onboarding

### API Endpoints

**POST `/api/brand-kit/extract`**
- Input: `{ url: string }`
- Process: Calls Firecrawl, extracts brand elements
- Output: `{ brandKit: ExtractedBrandKit }`

**GET `/api/brand-kit`**
- Returns user's brand kit(s)

**PUT `/api/brand-kit`**
- Updates existing brand kit

**DELETE `/api/brand-kit/:id`**
- Deletes a brand kit

### Error Handling

| Error | User Message | Action |
|-------|--------------|--------|
| Invalid URL | "Please enter a valid website URL" | Show inline error |
| Firecrawl timeout | "Unable to reach the website. Please check the URL." | Allow retry |
| No colors found | "We couldn't detect brand colors. You can set them manually." | Show color picker |
| No logo found | "No logo detected. You can upload one manually." | Show upload option |

## Implementation Steps

1. **Phase 1: Infrastructure**
   - Create Firecrawl client with error handling
   - Add brand_kits table to database types
   - Create API endpoint structure

2. **Phase 2: Extraction Logic**
   - Implement color extraction algorithms
   - Implement font extraction
   - Implement logo detection
   - Add fallback values

3. **Phase 3: UI Components**
   - Build BrandKitPreview component
   - Build onboarding page
   - Add loading and error states

4. **Phase 4: Integration**
   - Connect UI to API
   - Add database persistence
   - Test end-to-end flow

## Environment Variables

```
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxx
```

## Testing Checklist

- [ ] Extract brand kit from marketing site (e.g., stripe.com)
- [ ] Extract brand kit from personal portfolio
- [ ] Handle sites with no CSS (minimal styling)
- [ ] Handle sites behind authentication (should fail gracefully)
- [ ] Handle very slow sites (timeout handling)
- [ ] Handle sites with many colors (pick dominant)
- [ ] Verify extracted colors meet contrast requirements
- [ ] Test logo extraction from various formats
- [ ] Test responsive design of preview component
- [ ] Test dark mode compatibility

## Success Metrics

- Brand kit extraction works for 90%+ of websites
- Extraction completes in under 10 seconds
- Users can preview and modify extracted brand kit
- Brand kit persists correctly in database
