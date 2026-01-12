"use client"

import * as React from "react"
import {
  IconCalendar,
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconLink,
  IconPencil,
  IconPresentation,
  IconSettings,
  IconSparkles,
  IconTemplate,
  IconUsers,
} from "@tabler/icons-react"

import { NavContent } from "@/components/nav-content"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

/**
 * Static navigation and user data for the ChainLinked application sidebar.
 * This data structure defines the complete navigation hierarchy.
 */
const data = {
  /**
   * Current user information displayed in the sidebar footer.
   */
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  /**
   * Main navigation items - primary app features.
   * These are always visible in the sidebar.
   */
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
    {
      title: "Compose",
      url: "/dashboard/compose",
      icon: IconPencil,
    },
    {
      title: "Schedule",
      url: "/dashboard/schedule",
      icon: IconCalendar,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: IconUsers,
    },
  ],

  /**
   * Content section navigation - collapsible group for content management.
   * Includes templates, inspiration, and carousel management.
   */
  navContent: [
    {
      title: "Templates",
      url: "/dashboard/templates",
      icon: IconTemplate,
    },
    {
      title: "Inspiration",
      url: "/dashboard/inspiration",
      icon: IconSparkles,
    },
    {
      title: "Carousels",
      url: "/dashboard/carousels",
      icon: IconPresentation,
    },
  ],

  /**
   * Secondary navigation items - utility and support links.
   * Positioned at the bottom of the sidebar content area.
   */
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Help",
      url: "#",
      icon: IconHelp,
    },
  ],
}

/**
 * ChainLinked Application Sidebar Component
 *
 * The main navigation sidebar for the ChainLinked LinkedIn content management platform.
 * Provides access to all major features including:
 * - Dashboard and analytics
 * - Content composition and scheduling
 * - Team collaboration
 * - Content templates and inspiration
 * - Settings and help
 *
 * @example
 * \`\`\`tsx
 * <SidebarProvider>
 *   <AppSidebar />
 *   <SidebarInset>
 *     <main>Page content</main>
 *   </SidebarInset>
 * </SidebarProvider>
 * \`\`\`
 *
 * @param props - Standard React component props extending Sidebar component props
 * @returns The rendered sidebar component with full navigation structure
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Sidebar Header - Company Branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconLink className="!size-5" />
                <span className="text-base font-semibold">ChainLinked</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content - Navigation Groups */}
      <SidebarContent>
        {/* Main Navigation - Primary features */}
        <NavMain items={data.navMain} />

        {/* Content Section - Collapsible content management */}
        <NavContent
          items={data.navContent}
          label="Content"
          defaultOpen={true}
        />

        {/* Secondary Navigation - Settings and support */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* Sidebar Footer - User profile and actions */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
