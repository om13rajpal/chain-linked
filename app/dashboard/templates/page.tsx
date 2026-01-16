"use client"

/**
 * Templates Page
 * @description Template library for managing reusable LinkedIn post templates
 * @module app/dashboard/templates/page
 */

import { AppSidebar } from "@/components/app-sidebar"
import { TemplateLibrary } from "@/components/features/template-library"
import { SiteHeader } from "@/components/site-header"
import { TemplatesSkeleton } from "@/components/skeletons/page-skeletons"
import { useTemplates } from "@/hooks/use-templates"
import { useAuthContext } from "@/lib/auth/auth-provider"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react"

/**
 * Templates page content component with real data
 */
function TemplatesContent() {
  const {
    templates,
    isLoading,
    error,
    refetch,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
  } = useTemplates()

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-destructive">
              <IconAlertCircle className="h-5 w-5" />
              <span>Failed to load templates: {error}</span>
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
    return <TemplatesSkeleton />
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 animate-in fade-in duration-500">
      <TemplateLibrary
        templates={templates}
        onCreateTemplate={createTemplate}
        onEditTemplate={updateTemplate}
        onDeleteTemplate={deleteTemplate}
        onUseTemplate={incrementUsage}
      />
    </div>
  )
}

/**
 * Templates page component
 * @returns Templates page with browsable and searchable template library
 */
export default function TemplatesPage() {
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
        <SiteHeader title="Templates" />
        <main id="main-content" className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {authLoading ? <TemplatesSkeleton /> : <TemplatesContent />}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
