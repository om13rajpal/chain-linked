"use client"

/**
 * Analytics Page
 * @description Comprehensive analytics dashboard showing performance metrics, trends, and goals tracking
 * @module app/dashboard/analytics/page
 */

import { AppSidebar } from "@/components/app-sidebar"
import { AnalyticsCards } from "@/components/features/analytics-cards"
import { AnalyticsChart } from "@/components/features/analytics-chart"
import { GoalsTracker } from "@/components/features/goals-tracker"
import { PostPerformance } from "@/components/features/post-performance"
import { TeamLeaderboard } from "@/components/features/team-leaderboard"
import { SiteHeader } from "@/components/site-header"
import { AnalyticsSkeleton } from "@/components/skeletons/page-skeletons"
import { useAnalytics } from "@/hooks/use-analytics"
import { useAuthContext } from "@/lib/auth/auth-provider"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react"

/**
 * Analytics page content component with real data
 */
function AnalyticsContent() {
  const { user } = useAuthContext()
  const { metrics, chartData, isLoading, error, refetch } = useAnalytics(user?.id)

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-destructive">
              <IconAlertCircle className="h-5 w-5" />
              <span>Failed to load analytics: {error}</span>
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
    return <AnalyticsSkeleton />
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 animate-in fade-in duration-500">
      {/* Analytics Cards - Key Metrics */}
      <AnalyticsCards
        impressions={metrics?.impressions}
        engagementRate={metrics?.engagementRate}
        followers={metrics?.followers}
        profileViews={metrics?.profileViews}
      />

      {/* Charts and Goals Row */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-3 lg:px-6">
        {/* Performance Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AnalyticsChart data={chartData.length > 0 ? chartData : undefined} />
        </div>

        {/* Goals Tracker - Takes 1 column */}
        <div className="lg:col-span-1">
          <GoalsTracker />
        </div>
      </div>

      {/* Team Leaderboard and Post Performance Row */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
        {/* Team Leaderboard */}
        <TeamLeaderboard currentUserId={user?.id || "3"} />

        {/* Post Performance Drill-down */}
        <PostPerformance />
      </div>
    </div>
  )
}

/**
 * Analytics page component
 * @returns Analytics page with performance cards, charts, goals tracker, leaderboard, and post performance
 */
export default function AnalyticsPage() {
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
        <SiteHeader title="Analytics" />
        <main id="main-content" className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <AnalyticsContent />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
