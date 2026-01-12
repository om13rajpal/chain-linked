/**
 * Inspiration Page
 * @description Content inspiration feed with swipe interface for discovering trending LinkedIn content
 * @module app/dashboard/inspiration/page
 */

import { AppSidebar } from "@/components/app-sidebar"
import { InspirationFeed } from "@/components/features/inspiration-feed"
import { SwipeInterface } from "@/components/features/swipe-interface"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

/**
 * Inspiration page component
 * @returns Inspiration page with swipeable content feed for discovering trending posts
 */
export default function InspirationPage() {
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
              <InspirationFeed />
              <SwipeInterface />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
