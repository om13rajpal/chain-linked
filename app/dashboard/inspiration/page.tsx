"use client"

/**
 * Inspiration Page
 * @description Content inspiration feed with swipe interface for discovering trending LinkedIn content
 * @module app/dashboard/inspiration/page
 */

import { AppSidebar } from "@/components/app-sidebar"
import { InspirationFeed } from "@/components/features/inspiration-feed"
import { SwipeInterface } from "@/components/features/swipe-interface"
import { SiteHeader } from "@/components/site-header"
import { InspirationSkeleton } from "@/components/skeletons/page-skeletons"
import { useInspiration } from "@/hooks/use-inspiration"
import { useAuthContext } from "@/lib/auth/auth-provider"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react"

/**
 * Inspiration page content component with real data
 */
function InspirationContent() {
  const { posts, suggestions, isLoading, error, refetch } = useInspiration(50)

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-destructive">
              <IconAlertCircle className="h-5 w-5" />
              <span>Failed to load inspiration: {error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={refetch}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return <InspirationSkeleton />
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Swipe Interface - Takes 1 column on desktop */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <SwipeInterface suggestions={suggestions} />
        </div>

        {/* Inspiration Feed - Takes 2 columns on desktop */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <InspirationFeed posts={posts} />
        </div>
      </div>
    </div>
  )
}

/**
 * Inspiration page component
 * @returns Inspiration page with swipeable content feed for discovering trending posts
 */
export default function InspirationPage() {
  const { isLoading: authLoading } = useAuthContext()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Inspiration" />
        <main id="main-content" className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {authLoading ? <InspirationSkeleton /> : <InspirationContent />}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
