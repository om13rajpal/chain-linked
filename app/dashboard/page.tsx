/**
 * Dashboard Page
 * @description Main dashboard for ChainLinked - LinkedIn content management platform
 * @module app/dashboard/page
 */

import { AppSidebar } from "@/components/app-sidebar"
import { AnalyticsCards } from "@/components/features/analytics-cards"
import { AnalyticsChart } from "@/components/features/analytics-chart"
import { GoalsTracker } from "@/components/features/goals-tracker"
import { TeamActivityFeed, sampleTeamPosts } from "@/components/features/team-activity-feed"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

/**
 * Dashboard page component
 * @returns Dashboard page with analytics, goals, and team activity
 */
export default function DashboardPage() {
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
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Analytics Cards - Key Metrics */}
              <AnalyticsCards />

              {/* Charts and Goals Row */}
              <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-3 lg:px-6">
                {/* Performance Chart - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <AnalyticsChart />
                </div>

                {/* Goals Tracker - Takes 1 column */}
                <div className="lg:col-span-1">
                  <GoalsTracker />
                </div>
              </div>

              {/* Team Activity Feed */}
              <div className="px-4 lg:px-6">
                <TeamActivityFeed posts={sampleTeamPosts} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
