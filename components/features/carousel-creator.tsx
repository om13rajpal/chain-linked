"use client"

/**
 * Carousel Creator Component
 * @description A carousel creator for building LinkedIn PDF carousel posts
 * @module components/features/carousel-creator
 */

import Image from "next/image"
import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconLoader2,
  IconPalette,
  IconPlus,
  IconDeviceFloppy,
  IconTrash,
  IconLayoutGrid,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCarousel } from "@/hooks/use-carousel"
import type {
  CarouselSlide,
  CarouselBrandKit,
  CarouselTemplateType,
} from "@/types/carousel"
import {
  CAROUSEL_TEMPLATES,
  DEFAULT_BRAND_KIT,
  DEFAULT_CAROUSEL_SLIDES,
} from "@/types/carousel"

/**
 * Props for the CarouselCreator component
 */
export interface CarouselCreatorProps {
  /** Initial slides to populate the editor with */
  initialSlides?: CarouselSlide[]
  /** Brand kit for styling the carousel */
  brandKit?: CarouselBrandKit
  /** Initial template selection */
  initialTemplate?: CarouselTemplateType
}

/**
 * Returns template-specific styles for the slide preview
 * @param template - The selected template type
 * @param slideType - The type of slide
 * @param brandKit - The brand kit configuration
 * @param brandKitApplied - Whether brand kit colors should be applied
 * @returns CSS style object for the slide
 */
function getTemplateStyles(
  template: CarouselTemplateType,
  slideType: CarouselSlide["type"],
  brandKit: CarouselBrandKit,
  brandKitApplied: boolean
): React.CSSProperties {
  const primaryColor = brandKitApplied ? brandKit.primaryColor : "#0077B5"
  const secondaryColor = brandKitApplied ? brandKit.secondaryColor : "#00A0DC"
  const fontFamily = brandKitApplied ? brandKit.fontFamily : "Inter, sans-serif"

  const baseStyles: React.CSSProperties = {
    fontFamily,
  }

  switch (template) {
    case "bold":
      return {
        ...baseStyles,
        backgroundColor: slideType === "title" || slideType === "cta" ? primaryColor : "#ffffff",
        color: slideType === "title" || slideType === "cta" ? "#ffffff" : "#1a1a1a",
        fontSize: slideType === "stat" ? "2rem" : slideType === "title" ? "1.75rem" : "1.25rem",
        fontWeight: slideType === "title" || slideType === "stat" ? 700 : 500,
        padding: "2rem",
        textAlign: "center",
      }
    case "minimalist":
      return {
        ...baseStyles,
        backgroundColor: "#fafafa",
        color: "#333333",
        fontSize: slideType === "title" ? "1.5rem" : slideType === "stat" ? "1.75rem" : "1rem",
        fontWeight: slideType === "title" || slideType === "stat" ? 600 : 400,
        padding: "3rem 2rem",
        textAlign: "center",
        borderLeft: slideType === "title" || slideType === "cta" ? `4px solid ${primaryColor}` : "none",
      }
    case "data":
      return {
        ...baseStyles,
        backgroundColor: slideType === "stat" ? primaryColor : "#ffffff",
        color: slideType === "stat" ? "#ffffff" : "#1a1a1a",
        fontSize: slideType === "stat" ? "2.5rem" : slideType === "title" ? "1.5rem" : "1.125rem",
        fontWeight: slideType === "stat" ? 800 : slideType === "title" ? 600 : 400,
        padding: "2rem",
        textAlign: "center",
        borderBottom: slideType !== "stat" ? `3px solid ${secondaryColor}` : "none",
      }
    case "story":
      return {
        ...baseStyles,
        background:
          slideType === "title"
            ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
            : "#ffffff",
        color: slideType === "title" ? "#ffffff" : "#333333",
        fontSize: slideType === "title" ? "1.625rem" : slideType === "stat" ? "2rem" : "1.125rem",
        fontWeight: slideType === "title" || slideType === "stat" ? 600 : 400,
        padding: "2rem",
        textAlign: slideType === "cta" ? "center" : "left",
        lineHeight: 1.6,
        borderLeft: slideType !== "title" ? `4px solid ${primaryColor}` : "none",
      }
    default:
      return baseStyles
  }
}

/**
 * Returns CSS classes for template-specific styling
 * @param template - The selected template type
 * @param slideType - The type of slide
 * @returns Tailwind CSS class string
 */
function getTemplateClasses(template: CarouselTemplateType, slideType: CarouselSlide["type"]): string {
  const baseClasses = "flex items-center justify-center transition-all duration-300"

  switch (template) {
    case "bold":
      return cn(baseClasses, "rounded-lg shadow-lg")
    case "minimalist":
      return cn(baseClasses, "rounded-sm shadow-sm")
    case "data":
      return cn(baseClasses, "rounded-md shadow-md")
    case "story":
      return cn(
        baseClasses,
        "rounded-lg",
        slideType === "title" ? "shadow-xl" : "shadow-sm border"
      )
    default:
      return baseClasses
  }
}

/**
 * A carousel creator component for building LinkedIn PDF carousel posts.
 *
 * Features:
 * - Slide editor with add/remove functionality
 * - Text input for each slide with type selection
 * - Template selection (Bold, Minimalist, Data-Focused, Story-Style)
 * - Brand kit auto-application with preview
 * - Visual preview of carousel slides with navigation
 * - Export to PDF and save draft functionality
 *
 * @param props - Component props
 * @returns Carousel creator JSX element
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CarouselCreator />
 *
 * // With initial slides and brand kit
 * <CarouselCreator
 *   initialSlides={mySlides}
 *   brandKit={{
 *     primaryColor: "#FF6B35",
 *     secondaryColor: "#F7C59F",
 *     fontFamily: "Poppins, sans-serif",
 *     logoUrl: "/logo.png"
 *   }}
 * />
 * ```
 */
export function CarouselCreator({
  initialSlides,
  brandKit: initialBrandKit,
  initialTemplate = "bold",
}: CarouselCreatorProps) {
  const {
    slides,
    selectedTemplate,
    currentSlideIndex,
    currentSlide,
    brandKit,
    brandKitApplied,
    isExporting,
    isSaving,
    addSlide,
    removeSlide,
    updateSlideContent,
    updateSlideType,
    setTemplate,
    goToPreviousSlide,
    goToNextSlide,
    goToSlide,
    toggleBrandKit,
    exportToPDF,
    saveDraft,
  } = useCarousel({
    initialSlides: initialSlides ?? DEFAULT_CAROUSEL_SLIDES,
    initialBrandKit: initialBrandKit ?? DEFAULT_BRAND_KIT,
    initialTemplate,
  })

  /**
   * Handles the export button click
   */
  const handleExport = async () => {
    await exportToPDF("square", "linkedin-carousel.pdf")
  }

  /**
   * Handles the save draft button click
   */
  const handleSave = async () => {
    await saveDraft()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Create Carousel</h2>
          <p className="text-muted-foreground text-sm">
            Design multi-slide carousels for LinkedIn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IconLayoutGrid className="text-muted-foreground size-5" />
          <span className="text-muted-foreground text-sm">
            {slides.length} slide{slides.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Main Editor and Preview Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Slide Editor Column */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle>Slide Editor</CardTitle>
            <CardDescription>
              Create and edit your carousel slides
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-4">
            {/* Template Selector */}
            <div className="space-y-2">
              <Label htmlFor="template-select">Template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={(value) => setTemplate(value as CarouselTemplateType)}
              >
                <SelectTrigger id="template-select" className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(CAROUSEL_TEMPLATES) as [CarouselTemplateType, { name: string; description: string }][]).map(
                    ([key, template]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {template.description}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Slides List */}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
              <Label>Slides ({slides.length})</Label>
              <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={cn(
                      "group relative flex items-start gap-2 rounded-lg border p-3 transition-colors",
                      currentSlideIndex === index
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/30"
                    )}
                    onClick={() => goToSlide(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        goToSlide(index)
                      }
                    }}
                    aria-label={`Select slide ${index + 1}`}
                    aria-pressed={currentSlideIndex === index}
                  >
                    {/* Slide Number */}
                    <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      {index + 1}
                    </span>

                    {/* Slide Content and Type */}
                    <div className="flex flex-1 flex-col gap-2">
                      <Input
                        value={slide.content}
                        onChange={(e) => updateSlideContent(slide.id, e.target.value)}
                        placeholder={`Slide ${index + 1} content...`}
                        className="h-auto py-1.5"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Slide ${index + 1} content`}
                      />
                      <Select
                        value={slide.type}
                        onValueChange={(value) =>
                          updateSlideType(slide.id, value as CarouselSlide["type"])
                        }
                      >
                        <SelectTrigger
                          className="h-8 w-32"
                          onClick={(e) => e.stopPropagation()}
                          size="sm"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="stat">Statistic</SelectItem>
                          <SelectItem value="cta">Call to Action</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSlide(slide.id)
                      }}
                      disabled={slides.length <= 1}
                      aria-label={`Remove slide ${index + 1}`}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Slide Button */}
            <Button
              variant="outline"
              onClick={addSlide}
              className="w-full"
            >
              <IconPlus className="size-4" />
              Add Slide
            </Button>
          </CardContent>
        </Card>

        {/* Preview Column */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your carousel will look
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-4">
            {/* Slide Preview */}
            <div
              className={cn(
                "relative aspect-square w-full overflow-hidden",
                getTemplateClasses(selectedTemplate, currentSlide?.type ?? "content")
              )}
              style={getTemplateStyles(
                selectedTemplate,
                currentSlide?.type ?? "content",
                brandKit,
                brandKitApplied
              )}
            >
              {/* Brand Logo */}
              {brandKitApplied && brandKit.logoUrl && (
                <Image
                  src={brandKit.logoUrl}
                  alt="Brand logo"
                  width={80}
                  height={32}
                  className="absolute top-4 left-4 h-8 w-auto object-contain"
                  unoptimized
                />
              )}

              {/* Slide Content */}
              <div className="flex h-full w-full items-center justify-center p-8">
                <p className="text-center">
                  {currentSlide?.content || "Enter slide content..."}
                </p>
              </div>

              {/* Slide Number Indicator */}
              <div className="absolute bottom-4 right-4 rounded-full bg-black/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
                {currentSlideIndex + 1} / {slides.length}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousSlide}
                disabled={currentSlideIndex === 0}
                aria-label="Previous slide"
              >
                <IconChevronLeft className="size-4" />
              </Button>

              <span className="text-muted-foreground min-w-[3rem] text-center text-sm tabular-nums">
                {currentSlideIndex + 1} / {slides.length}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                aria-label="Next slide"
              >
                <IconChevronRight className="size-4" />
              </Button>
            </div>

            {/* Brand Kit Toggle */}
            <Button
              variant={brandKitApplied ? "default" : "outline"}
              onClick={toggleBrandKit}
              className="w-full"
            >
              <IconPalette className="size-4" />
              {brandKitApplied ? "Brand Kit Applied" : "Apply Brand Kit"}
            </Button>

            {/* Brand Kit Info */}
            {brandKitApplied && (
              <div className="text-muted-foreground flex flex-wrap items-center gap-3 rounded-lg border p-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div
                    className="size-4 rounded-full border"
                    style={{ backgroundColor: brandKit.primaryColor }}
                    title="Primary Color"
                  />
                  <span>Primary</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="size-4 rounded-full border"
                    style={{ backgroundColor: brandKit.secondaryColor }}
                    title="Secondary Color"
                  />
                  <span>Secondary</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span style={{ fontFamily: brandKit.fontFamily }}>Aa</span>
                  <span>{brandKit.fontFamily.split(",")[0]}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <Card>
        <CardFooter className="flex justify-end gap-2 py-4">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || isExporting || slides.length === 0}
          >
            {isSaving ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconDeviceFloppy className="size-4" />
            )}
            Save Draft
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || isSaving || slides.length === 0}
          >
            {isExporting ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconDownload className="size-4" />
            )}
            Export PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
