/**
 * Team Page
 * @description Team collaboration hub showing activity feed and member contributions
 * @module app/dashboard/team/page
 */

import { AppSidebar } from "@/components/app-sidebar"
import { TeamActivityFeed, sampleTeamPosts } from "@/components/features/team-activity-feed"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
              <TeamActivityFeed posts={sampleTeamPosts} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
