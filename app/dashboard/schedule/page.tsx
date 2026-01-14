"use client"

/**
 * Schedule Page
 * @description View and manage scheduled LinkedIn posts with calendar and list views
 * @module app/dashboard/schedule/page
 */

import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { ScheduleCalendar, sampleScheduledPostItems } from "@/components/features/schedule-calendar"
import { ScheduledPosts, sampleScheduledPosts, type ScheduledPost } from "@/components/features/scheduled-posts"
import { SiteHeader } from "@/components/site-header"
import { ScheduleSkeleton } from "@/components/skeletons/page-skeletons"
import { useScheduledPosts } from "@/hooks/use-scheduled-posts"
import { useAuthContext } from "@/lib/auth/auth-provider"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

/**
 * Schedule page content component with real data
 */
function ScheduleContent() {
  const router = useRouter()
  const { posts: scheduledPosts, rawPosts, isLoading } = useScheduledPosts(60)

  // Use real data if available, otherwise fall back to sample data
  const displayCalendarPosts = scheduledPosts.length > 0 ? scheduledPosts : sampleScheduledPostItems

  // Transform scheduled posts for the list view (different type)
  const displayListPosts: ScheduledPost[] = rawPosts.length > 0
    ? rawPosts.map((post) => ({
        id: post.id,
        content: post.content,
        scheduledFor: post.scheduled_for,
        status: mapListStatus(post.status),
        mediaUrls: post.media_urls as string[] | undefined,
      }))
    : sampleScheduledPosts

  // Navigate to compose page for scheduling new posts
  const handleScheduleNew = () => {
    router.push("/dashboard/compose")
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 animate-in fade-in duration-500">
      {/* Calendar View and List View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Calendar View */}
        <ScheduleCalendar
          posts={displayCalendarPosts}
          isLoading={isLoading}
        />

        {/* List View */}
        <ScheduledPosts
          posts={displayListPosts}
          isLoading={isLoading}
          onScheduleNew={handleScheduleNew}
        />
      </div>
    </div>
  )
}

/**
 * Map database status to list component status
 */
function mapListStatus(status: string): ScheduledPost["status"] {
  switch (status.toLowerCase()) {
    case "posting":
    case "processing":
      return "posting"
    case "failed":
    case "error":
      return "failed"
    default:
      return "pending"
  }
}

/**
 * Schedule page component
 * @returns Schedule page with calendar view and list of upcoming scheduled posts
 */
export default function SchedulePage() {
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
        <SiteHeader title="Schedule" />
        <main id="main-content" className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {authLoading ? <ScheduleSkeleton /> : <ScheduleContent />}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
