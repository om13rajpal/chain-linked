/**
 * LinkedIn Connection Status Route Handler
 * @description Returns the current LinkedIn connection status for the user
 * @module app/api/linkedin/status
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isTokenExpired, type LinkedInConnectionStatus } from '@/lib/linkedin'

/**
 * GET - Check LinkedIn connection status
 * @returns Connection status including expiry information
 */
export async function GET() {
  const supabase = await createClient()

  // Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get LinkedIn tokens for user
  const { data: tokenData, error: tokenError } = await supabase
    .from('linkedin_tokens')
    .select('linkedin_urn, expires_at, updated_at')
    .eq('user_id', user.id)
    .single()

  if (tokenError || !tokenData) {
    const status: LinkedInConnectionStatus = {
      isConnected: false,
    }
    return NextResponse.json(status)
  }

  // Check if token is expired
  const expired = isTokenExpired(tokenData.expires_at, 0)

  const status: LinkedInConnectionStatus = {
    isConnected: !expired,
    linkedinUrn: tokenData.linkedin_urn || undefined,
    expiresAt: tokenData.expires_at || undefined,
  }

  return NextResponse.json(status)
}

/**
 * DELETE - Disconnect LinkedIn account
 * @returns Success status
 */
export async function DELETE() {
  const supabase = await createClient()

  // Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Delete LinkedIn tokens
  const { error: deleteError } = await supabase
    .from('linkedin_tokens')
    .delete()
    .eq('user_id', user.id)

  if (deleteError) {
    console.error('Failed to delete LinkedIn tokens:', deleteError)
    return NextResponse.json(
      { error: 'Failed to disconnect LinkedIn' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'LinkedIn disconnected successfully',
  })
}
