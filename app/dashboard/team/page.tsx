"use client"

/**
 * Team Page
 * @description Team collaboration hub showing activity feed and member contributions
 * @module app/dashboard/team/page
 */

import { AppSidebar } from "@/components/app-sidebar"
import { TeamActivityFeed } from "@/components/features/team-activity-feed"
import { TeamLeaderboard } from "@/components/features/team-leaderboard"
import { SiteHeader } from "@/components/site-header"
import { TeamSkeleton } from "@/components/skeletons/page-skeletons"
import { useTeamPosts } from "@/hooks/use-team-posts"
import { useTeamLeaderboard } from "@/hooks/use-team-leaderboard"
import { useAuthContext } from "@/lib/auth/auth-provider"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

/**
 * Team page content component
 * @description Fetches team posts and leaderboard from Supabase
 */
function TeamContent() {
  const { user } = useAuthContext()
  const { posts, isLoading: postsLoading } = useTeamPosts(20)
  const {
    members,
    isLoading: leaderboardLoading,
    timeRange,
    setTimeRange,
    currentUserId
  } = useTeamLeaderboard()

  if (postsLoading && leaderboardLoading) {
    return <TeamSkeleton />
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Leaderboard takes 1/3 on large screens */}
        <div className="lg:col-span-1">
          <TeamLeaderboard
            members={members}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            currentUserId={currentUserId || undefined}
            isLoading={leaderboardLoading}
          />
        </div>
        {/* Activity feed takes 2/3 on large screens */}
        <div className="lg:col-span-2">
          <TeamActivityFeed posts={posts} isLoading={postsLoading} />
        </div>
      </div>
    </div>
  )
}

/**
 * Team page component
 * @returns Team page with activity feed showing team member posts and engagement
 */
export default function TeamPage() {
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
        <SiteHeader title="Team" />
        <main id="main-content" className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <TeamContent />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
