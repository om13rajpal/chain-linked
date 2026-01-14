/**
 * Site Header Component
 * @description Top navigation header with sidebar trigger, page title, and user menu
 * @module components/site-header
 */

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserMenu } from "@/components/user-menu"

/**
 * Props for the SiteHeader component
 */
interface SiteHeaderProps {
  /** The title to display in the header */
  title?: string
}

/**
 * Site header with sidebar trigger, dynamic title, and user menu
 * @param props - Component props
 * @param props.title - Page title to display
 * @returns Header component with navigation elements
 * @example
 * <SiteHeader title="Dashboard" />
 */
export function SiteHeader({ title = "Dashboard" }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">{title}</h1>
        </div>
        <UserMenu />
      </div>
    </header>
  )
}
