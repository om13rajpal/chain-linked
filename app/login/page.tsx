/**
 * Login Page
 * @description Authentication page with Google OAuth sign-in
 * @module app/login
 */

'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { IconBrandGoogle, IconLoader2, IconLink } from '@tabler/icons-react'
import { toast } from 'sonner'

/**
 * Login form component with Google OAuth
 * @returns Login form JSX
 */
function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  /**
   * Handle Google OAuth sign in
   */
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('OAuth error:', error)
        toast.error('Failed to sign in with Google')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <CardContent className="space-y-4">
      <Button
        variant="outline"
        className="w-full h-12 text-base"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <IconBrandGoogle className="mr-2 h-5 w-5" />
        )}
        Continue with Google
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </CardContent>
  )
}

/**
 * Login form loading skeleton
 * @returns Loading skeleton JSX
 */
function LoginFormSkeleton() {
  return (
    <CardContent className="space-y-4">
      <Skeleton className="w-full h-12" />
      <Skeleton className="w-full h-4" />
    </CardContent>
  )
}

/**
 * Login page component with Google OAuth
 * @returns Login page JSX
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <IconLink className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to ChainLinked</CardTitle>
            <CardDescription className="mt-2">
              LinkedIn content management for teams. Sign in to access your dashboard.
            </CardDescription>
          </div>
        </CardHeader>
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  )
}
