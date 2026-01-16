"use client"

/**
 * Brand Kit Onboarding Page
 * @description Page for extracting and setting up brand kit during onboarding
 * @module app/onboarding/brand-kit/page
 */

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconBrandLinkedin,
  IconCheck,
  IconLoader2,
  IconPalette,
  IconSparkles,
  IconWorldWww,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { useBrandKit } from "@/hooks/use-brand-kit"
import { BrandKitPreview } from "@/components/features/brand-kit-preview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

/**
 * Brand Kit Onboarding Page component
 * Allows users to enter their website URL and extract brand elements
 * @returns JSX element for brand kit setup page
 */
export default function BrandKitOnboardingPage() {
  const router = useRouter()
  const [url, setUrl] = React.useState("")
  const [urlError, setUrlError] = React.useState<string | null>(null)

  const {
    extractedKit,
    isExtracting,
    isSaving,
    error,
    extractBrandKit,
    updateExtractedKit,
    saveBrandKit,
    clearExtractedKit,
    clearError,
  } = useBrandKit()

  /**
   * Validates the URL format
   */
  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setUrlError("Please enter your website URL")
      return false
    }

    // Add protocol if missing
    let urlToValidate = value.trim()
    if (!urlToValidate.match(/^https?:\/\//i)) {
      urlToValidate = `https://${urlToValidate}`
    }

    try {
      const parsed = new URL(urlToValidate)
      if (!["http:", "https:"].includes(parsed.protocol)) {
        setUrlError("Please enter a valid website URL")
        return false
      }
      setUrlError(null)
      return true
    } catch {
      setUrlError("Please enter a valid website URL")
      return false
    }
  }

  /**
   * Handles form submission to extract brand kit
   */
  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateUrl(url)) {
      return
    }

    // Add protocol if missing
    let urlToExtract = url.trim()
    if (!urlToExtract.match(/^https?:\/\//i)) {
      urlToExtract = `https://${urlToExtract}`
    }

    await extractBrandKit(urlToExtract)
  }

  /**
   * Handles saving the brand kit and continuing
   */
  const handleSave = async () => {
    const saved = await saveBrandKit()
    if (saved) {
      // Navigate to next onboarding step or dashboard
      router.push("/dashboard")
    }
  }

  /**
   * Handles skipping brand kit setup
   */
  const handleSkip = () => {
    router.push("/dashboard")
  }

  /**
   * Handles going back to re-enter URL
   */
  const handleBack = () => {
    clearExtractedKit()
    clearError()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <IconBrandLinkedin className="h-8 w-8 text-[#0A66C2]" />
            <span className="text-xl font-bold">ChainLinked</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Step 2 of 3: Brand Kit
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl py-8 px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              <IconCheck className="h-4 w-4" />
            </div>
            <div className="h-1 w-16 bg-primary rounded" />
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              2
            </div>
            <div className="h-1 w-16 bg-muted rounded" />
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground text-sm font-medium">
              3
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <IconPalette className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Set Up Your Brand Kit</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;ll automatically extract your brand colors, fonts, and logo from your website
            to personalize your LinkedIn content.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <IconAlertCircle className="h-4 w-4" />
            <AlertTitle>Extraction Failed</AlertTitle>
            <AlertDescription>
              {error}
              {error.includes("unavailable") && (
                <span className="block mt-1 text-sm">
                  Try a different URL or set up your brand manually.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Content Area */}
        {!extractedKit ? (
          /* URL Entry Form */
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconWorldWww className="h-5 w-5" />
                Enter Your Website
              </CardTitle>
              <CardDescription>
                Enter your company or personal website URL. We&apos;ll analyze it to extract your brand elements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExtract} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="website-url">Website URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="website-url"
                      type="text"
                      placeholder="yourcompany.com"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        if (urlError) validateUrl(e.target.value)
                      }}
                      className={cn(
                        "flex-1",
                        urlError && "border-destructive focus-visible:ring-destructive"
                      )}
                      disabled={isExtracting}
                    />
                    <Button type="submit" disabled={isExtracting}>
                      {isExtracting ? (
                        <>
                          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <IconSparkles className="mr-2 h-4 w-4" />
                          Extract
                        </>
                      )}
                    </Button>
                  </div>
                  {urlError && (
                    <p className="text-sm text-destructive">{urlError}</p>
                  )}
                </div>

                {isExtracting && (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <IconLoader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Analyzing your website...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This may take a few seconds
                    </p>
                  </div>
                )}

                {/* Example Sites */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Works with most websites. Try examples:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["stripe.com", "notion.so", "linear.app", "vercel.com"].map((site) => (
                      <button
                        key={site}
                        type="button"
                        onClick={() => setUrl(site)}
                        className="text-xs text-primary hover:underline"
                        disabled={isExtracting}
                      >
                        {site}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Brand Kit Preview */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={handleBack}>
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Try Different URL
              </Button>
            </div>

            <BrandKitPreview
              brandKit={{
                websiteUrl: extractedKit.websiteUrl,
                primaryColor: extractedKit.primaryColor,
                secondaryColor: extractedKit.secondaryColor,
                accentColor: extractedKit.accentColor,
                backgroundColor: extractedKit.backgroundColor,
                textColor: extractedKit.textColor,
                fontPrimary: extractedKit.fontPrimary,
                fontSecondary: extractedKit.fontSecondary,
                logoUrl: extractedKit.logoUrl,
              }}
              editable
              onUpdate={updateExtractedKit}
              onRetry={handleBack}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
              <Button onClick={handleSave} disabled={isSaving} size="lg">
                {isSaving ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <IconArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Skip Option */}
        {!extractedKit && (
          <div className="text-center mt-8">
            <Button variant="link" onClick={handleSkip} className="text-muted-foreground">
              Skip this step and set up later
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
