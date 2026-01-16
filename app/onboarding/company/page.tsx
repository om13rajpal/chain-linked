/**
 * Company Setup Page
 * @description Onboarding page for creating a new company
 * @module app/onboarding/company
 */

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'

import { CompanySetupForm } from '@/components/features/company-setup-form'
import { useCompany } from '@/hooks/use-company'
import type { CompanyWithTeam } from '@/types/database'

/**
 * Company Setup Page Component
 *
 * Onboarding step 1: Create a company.
 * Redirects to invite page after successful company creation.
 * If user already has a company, redirects to dashboard.
 *
 * @returns Company setup page JSX
 */
export default function CompanySetupPage() {
  const router = useRouter()
  const { company, isLoading, hasCompany } = useCompany()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // If user already has a company, redirect to dashboard
  useEffect(() => {
    if (!isLoading && hasCompany) {
      router.replace('/dashboard')
    }
  }, [isLoading, hasCompany, router])

  /**
   * Handle successful company creation
   * @param createdCompany - Newly created company data
   */
  const handleComplete = (createdCompany: CompanyWithTeam) => {
    setIsRedirecting(true)
    // Navigate to invite page with team ID
    const teamId = createdCompany.team?.id
    if (teamId) {
      router.push(`/onboarding/invite?teamId=${teamId}&company=${encodeURIComponent(createdCompany.name)}`)
    } else {
      router.push('/dashboard')
    }
  }

  // Show loading state while checking company status
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {isRedirecting ? 'Setting up your company...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  // If user has company, show loading while redirect happens
  if (hasCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      {/* Progress Indicator */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            1
          </div>
          <span className="text-sm font-medium">Create Company</span>
        </div>
        <div className="w-8 h-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
            2
          </div>
          <span className="text-sm text-muted-foreground">Invite Team</span>
        </div>
      </div>

      <CompanySetupForm
        onComplete={handleComplete}
        showSkip={false}
      />
    </div>
  )
}
