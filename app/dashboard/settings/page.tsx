/**
 * Settings Page
 * @description Application settings for configuring user preferences and account options
 * @module app/dashboard/settings/page
 */

import { AppSidebar } from "@/components/app-sidebar"
import { Settings } from "@/components/features/settings"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

/**
 * Settings page component
 * @returns Settings page with user preferences and account configuration options
 */
export default function SettingsPage() {
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
        <SiteHeader title="Settings" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
              <Settings />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
