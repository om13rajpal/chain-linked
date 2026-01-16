/**
 * Brand Kit Onboarding Loading State
 * @description Loading skeleton for brand kit onboarding page
 * @module app/onboarding/brand-kit/loading
 */

import { IconBrandLinkedin, IconPalette } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * Loading component for brand kit onboarding page
 * @returns Skeleton loading UI
 */
export default function BrandKitOnboardingLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <IconBrandLinkedin className="h-8 w-8 text-[#0A66C2]" />
            <span className="text-xl font-bold">ChainLinked</span>
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl py-8 px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-1 w-16" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-1 w-16" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <IconPalette className="h-8 w-8 text-primary" />
          </div>
          <Skeleton className="h-9 w-64 mx-auto mb-2" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* URL Entry Form Skeleton */}
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
              <div className="pt-4 border-t">
                <Skeleton className="h-3 w-48 mb-2" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-4 w-16" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
