/**
 * LinkedIn OAuth Callback Route Handler
 * @description Handles LinkedIn OAuth callback and token exchange
 * @module app/api/linkedin/callback
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  exchangeCodeForTokens,
  getLinkedInUserInfo,
  calculateExpiresAt,
  LINKEDIN_SCOPES,
} from '@/lib/linkedin'

/**
 * Cookie name for storing OAuth state
 */
const STATE_COOKIE_NAME = 'linkedin_oauth_state'

/**
 * Handles OAuth callback from LinkedIn
 * @param request - Incoming request with auth code and state
 * @returns Redirect to success or error page
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const cookieStore = await cookies()

  // Handle OAuth errors from LinkedIn
  if (error) {
    console.error('LinkedIn OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/dashboard/settings?linkedin_error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  // Verify state parameter for CSRF protection
  const storedState = cookieStore.get(STATE_COOKIE_NAME)?.value

  if (!state || !storedState || state !== storedState) {
    console.error('LinkedIn OAuth state mismatch')
    return NextResponse.redirect(
      `${origin}/dashboard/settings?linkedin_error=${encodeURIComponent('Invalid state parameter')}`
    )
  }

  // Clear the state cookie
  cookieStore.delete(STATE_COOKIE_NAME)

  if (!code) {
    console.error('LinkedIn OAuth missing code')
    return NextResponse.redirect(
      `${origin}/dashboard/settings?linkedin_error=${encodeURIComponent('Missing authorization code')}`
    )
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Get user info to get LinkedIn URN
    const userInfo = await getLinkedInUserInfo(tokens.access_token)
    const linkedInUrn = `urn:li:person:${userInfo.sub}`

    // Get current user from Supabase
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('User not authenticated:', authError)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('Please log in first')}`
      )
    }

    // Calculate token expiration
    const expiresAt = calculateExpiresAt(tokens.expires_in)

    // Store tokens in database (upsert to handle reconnection)
    const { error: upsertError } = await supabase
      .from('linkedin_tokens')
      .upsert(
        {
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          expires_at: expiresAt,
          linkedin_urn: linkedInUrn,
          scopes: [...LINKEDIN_SCOPES],
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )

    if (upsertError) {
      console.error('Failed to store LinkedIn tokens:', upsertError)
      return NextResponse.redirect(
        `${origin}/dashboard/settings?linkedin_error=${encodeURIComponent('Failed to save connection')}`
      )
    }

    // Optionally update user's linkedin_profile with fresh data
    const { error: profileError } = await supabase
      .from('linkedin_profiles')
      .upsert(
        {
          user_id: user.id,
          profile_urn: linkedInUrn,
          first_name: userInfo.given_name,
          last_name: userInfo.family_name,
          profile_picture_url: userInfo.picture || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )

    if (profileError) {
      // Log but don't fail - profile update is not critical
      console.error('Failed to update LinkedIn profile:', profileError)
    }

    // Redirect to settings with success message
    return NextResponse.redirect(
      `${origin}/dashboard/settings?linkedin_connected=true`
    )

  } catch (err) {
    console.error('LinkedIn OAuth callback error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.redirect(
      `${origin}/dashboard/settings?linkedin_error=${encodeURIComponent(errorMessage)}`
    )
  }
}
