/**
 * Company Setup Form Component
 * @description Form for creating a new company during onboarding
 * @module components/features/company-setup-form
 */

'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  IconBuilding,
  IconCamera,
  IconCheck,
  IconLoader2,
  IconX,
} from '@tabler/icons-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCompany, type CreateCompanyInput } from '@/hooks/use-company'
import type { CompanyWithTeam } from '@/types/database'

/**
 * Props for the CompanySetupForm component
 */
export interface CompanySetupFormProps {
  /** Callback fired when company is created successfully */
  onComplete: (company: CompanyWithTeam) => void
  /** Callback fired when user chooses to skip (optional) */
  onSkip?: () => void
  /** Whether to show skip button */
  showSkip?: boolean
  /** Custom class name */
  className?: string
}

/**
 * Maximum file size for logo upload (2MB)
 */
const MAX_LOGO_SIZE = 2 * 1024 * 1024

/**
 * Allowed logo file types
 */
const ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

/**
 * Company Setup Form Component
 *
 * A form for creating a new company with name and optional logo.
 * Used during the onboarding flow when a user doesn't have a company yet.
 *
 * Features:
 * - Company name input with validation
 * - Logo upload with preview (drag & drop support)
 * - Auto-generated slug from company name
 * - Loading state during creation
 * - Error handling with user feedback
 *
 * @param props - Component props
 * @returns Company setup form JSX
 * @example
 * ```tsx
 * <CompanySetupForm
 *   onComplete={(company) => router.push('/onboarding/invite')}
 *   onSkip={() => router.push('/dashboard')}
 *   showSkip={false}
 * />
 * ```
 */
export function CompanySetupForm({
  onComplete,
  onSkip,
  showSkip = false,
  className,
}: CompanySetupFormProps) {
  const { createCompany, isLoading: isCreating, error: createError } = useCompany()

  // Form state
  const [companyName, setCompanyName] = React.useState('')
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  /**
   * Validate company name
   * @param name - Company name to validate
   * @returns Error message or null if valid
   */
  const validateCompanyName = (name: string): string | null => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return 'Company name is required'
    }
    if (trimmedName.length < 2) {
      return 'Company name must be at least 2 characters'
    }
    if (trimmedName.length > 100) {
      return 'Company name must be less than 100 characters'
    }
    return null
  }

  /**
   * Handle file selection for logo
   * @param file - Selected file
   */
  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setValidationError('Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)')
      return
    }

    // Validate file size
    if (file.size > MAX_LOGO_SIZE) {
      setValidationError('Logo must be less than 2MB')
      return
    }

    setValidationError(null)
    setLogoFile(file)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setLogoUrl(previewUrl)

    // TODO: In production, upload to Supabase Storage here
    // For now, we just show the preview
    // setIsUploading(true)
    // const uploadedUrl = await uploadToStorage(file)
    // setLogoUrl(uploadedUrl)
    // setIsUploading(false)
  }

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  /**
   * Handle drag over
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  /**
   * Handle drag leave
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  /**
   * Handle drop
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  /**
   * Remove selected logo
   */
  const handleRemoveLogo = () => {
    if (logoUrl) {
      URL.revokeObjectURL(logoUrl)
    }
    setLogoUrl(null)
    setLogoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate company name
    const nameError = validateCompanyName(companyName)
    if (nameError) {
      setValidationError(nameError)
      return
    }

    setValidationError(null)

    // Create company
    const input: CreateCompanyInput = {
      name: companyName.trim(),
      logoUrl: logoUrl || undefined, // TODO: Use uploaded URL from storage
    }

    const company = await createCompany(input)

    if (company) {
      onComplete(company)
    }
  }

  // Clean up preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (logoUrl && logoFile) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [logoUrl, logoFile])

  const isSubmitting = isCreating || isUploading
  const displayError = validationError || createError

  return (
    <Card className={cn('w-full max-w-lg', className)}>
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <IconBuilding className="h-8 w-8 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">Create your company</CardTitle>
          <CardDescription className="mt-2">
            Set up your company to start collaborating with your team
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name Input */}
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              type="text"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value)
                setValidationError(null)
              }}
              disabled={isSubmitting}
              autoComplete="organization"
              autoFocus
              className={cn(displayError && 'border-destructive')}
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Company Logo (optional)</Label>
            <div
              className={cn(
                'relative flex flex-col items-center justify-center gap-4 p-6 rounded-lg border-2 border-dashed transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                isSubmitting && 'opacity-50 pointer-events-none'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {logoUrl ? (
                <div className="relative">
                  <div className="relative size-24 rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src={logoUrl}
                      alt="Company logo preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 size-6"
                    onClick={handleRemoveLogo}
                    disabled={isSubmitting}
                  >
                    <IconX className="size-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="size-16 rounded-lg bg-muted flex items-center justify-center">
                    <IconCamera className="size-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      <IconCamera className="size-4" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Drag and drop or click to upload
                      <br />
                      PNG, JPG, GIF, WebP, or SVG (max 2MB)
                    </p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_LOGO_TYPES.join(',')}
                onChange={handleFileInputChange}
                className="sr-only"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Error Message */}
          {displayError && (
            <p className="text-sm text-destructive" role="alert">
              {displayError}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isSubmitting || !companyName.trim()}
            >
              {isSubmitting ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconCheck className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Creating...' : 'Create Company'}
            </Button>

            {showSkip && onSkip && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onSkip}
                disabled={isSubmitting}
              >
                Skip for now
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
