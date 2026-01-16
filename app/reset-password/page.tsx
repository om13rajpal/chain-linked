/**
 * Reset Password Page
 * @description Password reset form for users with reset token
 * @module app/reset-password
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconLoader2, IconLink, IconLock, IconCheck } from '@tabler/icons-react'
import { toast } from 'sonner'

/**
 * Reset password page component
 * @returns Reset password page JSX
 */
export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const router = useRouter()

  // Check if user has a valid session (from reset link)
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setHasSession(!!session)
    }
    checkSession()
  }, [])

  /**
   * Handle password update
   */
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      toast.error('Please enter a new password')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        console.error('Password update error:', error)
        toast.error(error.message || 'Failed to update password')
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      toast.success('Password updated successfully')
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <IconCheck className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Password updated</CardTitle>
              <CardDescription className="mt-2">
                Your password has been successfully updated
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push('/dashboard')}
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <IconLock className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Invalid or expired link</CardTitle>
              <CardDescription className="mt-2">
                This password reset link is invalid or has expired
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/forgot-password" className="block">
              <Button className="w-full">
                Request a new reset link
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <IconLink className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Set new password</CardTitle>
            <CardDescription className="mt-2">
              Enter your new password below
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconLock className="mr-2 h-4 w-4" />
              )}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
