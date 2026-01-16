/**
 * Invitations Hook
 * @description React hook for team invitation management
 * @module hooks/use-invitations
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  TeamInvitation,
  TeamInvitationInsert,
  TeamInvitationWithInviter,
  InvitationStatus,
  TeamMemberRole,
} from '@/types/database'

/**
 * Hook return type for invitation operations
 */
interface UseInvitationsReturn {
  /** List of team invitations */
  invitations: TeamInvitationWithInviter[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Send invitations to multiple emails */
  sendInvitations: (teamId: string, emails: string[], role?: TeamMemberRole) => Promise<SendInvitationsResult>
  /** Get invitation by token */
  getInvitationByToken: (token: string) => Promise<TeamInvitationWithInviter | null>
  /** Accept an invitation */
  acceptInvitation: (token: string) => Promise<AcceptInvitationResult>
  /** Cancel an invitation */
  cancelInvitation: (id: string) => Promise<boolean>
  /** Resend an invitation */
  resendInvitation: (id: string) => Promise<boolean>
  /** Refetch invitations */
  refetch: () => Promise<void>
}

/**
 * Result type for sending invitations
 */
export interface SendInvitationsResult {
  /** Whether all invitations were sent successfully */
  success: boolean
  /** Successfully sent invitations */
  sent: string[]
  /** Failed invitations with reasons */
  failed: { email: string; reason: string }[]
}

/**
 * Result type for accepting invitation
 */
export interface AcceptInvitationResult {
  /** Whether the invitation was accepted successfully */
  success: boolean
  /** Error message if failed */
  error?: string
  /** Team ID if successful */
  teamId?: string
}

/**
 * Input for fetching invitations
 */
interface UseInvitationsOptions {
  /** Team ID to fetch invitations for */
  teamId?: string
  /** Only fetch pending invitations */
  pendingOnly?: boolean
}

/**
 * Generate cryptographically secure random token
 * @returns Secure random token string
 */
function generateSecureToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Whether email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Hook to manage team invitations
 * @param options - Options for fetching invitations
 * @returns Invitation data and operations
 * @example
 * const { invitations, sendInvitations, acceptInvitation } = useInvitations({ teamId: '...' })
 *
 * // Send invitations
 * const result = await sendInvitations(teamId, ['user@example.com'], 'member')
 */
export function useInvitations(options: UseInvitationsOptions = {}): UseInvitationsReturn {
  const { teamId, pendingOnly = false } = options
  const [invitations, setInvitations] = useState<TeamInvitationWithInviter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  /**
   * Fetch invitations for the team
   */
  const fetchInvitations = useCallback(async () => {
    if (!teamId) {
      setInvitations([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from('team_invitations')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })

      if (pendingOnly) {
        query = query.eq('status', 'pending')
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      // Fetch inviter info and team/company info for each invitation
      const enrichedInvitations: TeamInvitationWithInviter[] = await Promise.all(
        (data || []).map(async (invitation) => {
          // Get inviter info
          const { data: inviter } = await supabase
            .from('users')
            .select('name, email, avatar_url')
            .eq('id', invitation.invited_by)
            .single()

          // Get team and company info
          const { data: team } = await supabase
            .from('teams')
            .select('name, company_id')
            .eq('id', invitation.team_id)
            .single()

          let companyInfo = null
          if (team?.company_id) {
            const { data: company } = await supabase
              .from('companies')
              .select('name, logo_url')
              .eq('id', team.company_id)
              .single()
            companyInfo = company
          }

          return {
            ...invitation,
            inviter: inviter || undefined,
            team: team ? {
              name: team.name,
              company: companyInfo || undefined,
            } : undefined,
          }
        })
      )

      setInvitations(enrichedInvitations)
    } catch (err) {
      console.error('Invitations fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch invitations')
      setInvitations([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase, teamId, pendingOnly])

  /**
   * Send invitations to multiple email addresses
   * @param teamId - Team to invite users to
   * @param emails - List of email addresses
   * @param role - Role to assign (default: member)
   * @returns Result of invitation sending
   */
  const sendInvitations = useCallback(async (
    teamId: string,
    emails: string[],
    role: TeamMemberRole = 'member'
  ): Promise<SendInvitationsResult> => {
    const result: SendInvitationsResult = {
      success: true,
      sent: [],
      failed: [],
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return {
          success: false,
          sent: [],
          failed: emails.map(email => ({ email, reason: 'Not authenticated' })),
        }
      }

      // Verify user has permission to invite (is team owner or admin)
      const { data: membership } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single()

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return {
          success: false,
          sent: [],
          failed: emails.map(email => ({ email, reason: 'No permission to invite' })),
        }
      }

      // Check for existing team members
      const { data: existingMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)

      const memberUserIds = existingMembers?.map(m => m.user_id) || []

      // Get emails of existing members
      const { data: memberUsers } = await supabase
        .from('users')
        .select('email')
        .in('id', memberUserIds)

      const existingEmails = new Set(memberUsers?.map(u => u.email.toLowerCase()) || [])

      // Check for pending invitations
      const { data: pendingInvitations } = await supabase
        .from('team_invitations')
        .select('email')
        .eq('team_id', teamId)
        .eq('status', 'pending')

      const pendingEmails = new Set(pendingInvitations?.map(i => i.email.toLowerCase()) || [])

      // Process each email
      for (const email of emails) {
        const normalizedEmail = email.trim().toLowerCase()

        // Validate email format
        if (!isValidEmail(normalizedEmail)) {
          result.failed.push({ email: normalizedEmail, reason: 'Invalid email format' })
          continue
        }

        // Check if already a team member
        if (existingEmails.has(normalizedEmail)) {
          result.failed.push({ email: normalizedEmail, reason: 'Already a team member' })
          continue
        }

        // Check if already has pending invitation
        if (pendingEmails.has(normalizedEmail)) {
          result.failed.push({ email: normalizedEmail, reason: 'Invitation already pending' })
          continue
        }

        // Generate secure token
        const token = generateSecureToken()

        // Calculate expiration (7 days from now)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        // Create invitation
        const invitation: TeamInvitationInsert = {
          team_id: teamId,
          email: normalizedEmail,
          role: role === 'owner' ? 'admin' : role, // Can't invite as owner
          token,
          invited_by: user.id,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        }

        const { error: insertError } = await supabase
          .from('team_invitations')
          .insert(invitation)

        if (insertError) {
          console.error('Invitation insert error:', insertError)
          result.failed.push({ email: normalizedEmail, reason: 'Failed to create invitation' })
          continue
        }

        // TODO: Send email using Supabase Edge Function or email service
        // For now, we just create the invitation record
        // The email sending would be implemented via:
        // - Supabase Edge Function with Resend
        // - Or direct API call to email service

        result.sent.push(normalizedEmail)
      }

      result.success = result.failed.length === 0

      // Refetch invitations to update the list
      if (result.sent.length > 0) {
        await fetchInvitations()
      }

      return result
    } catch (err) {
      console.error('Send invitations error:', err)
      return {
        success: false,
        sent: [],
        failed: emails.map(email => ({
          email,
          reason: err instanceof Error ? err.message : 'Unknown error',
        })),
      }
    }
  }, [supabase, fetchInvitations])

  /**
   * Get invitation by token (for acceptance flow)
   * @param token - Invitation token
   * @returns Invitation details or null
   */
  const getInvitationByToken = useCallback(async (token: string): Promise<TeamInvitationWithInviter | null> => {
    try {
      const { data: invitation, error: fetchError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .single()

      if (fetchError || !invitation) {
        return null
      }

      // Get inviter info
      const { data: inviter } = await supabase
        .from('users')
        .select('name, email, avatar_url')
        .eq('id', invitation.invited_by)
        .single()

      // Get team and company info
      const { data: team } = await supabase
        .from('teams')
        .select('name, company_id')
        .eq('id', invitation.team_id)
        .single()

      let companyInfo = null
      if (team?.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('name, logo_url')
          .eq('id', team.company_id)
          .single()
        companyInfo = company
      }

      return {
        ...invitation,
        inviter: inviter || undefined,
        team: team ? {
          name: team.name,
          company: companyInfo || undefined,
        } : undefined,
      }
    } catch (err) {
      console.error('Get invitation error:', err)
      return null
    }
  }, [supabase])

  /**
   * Accept an invitation
   * @param token - Invitation token
   * @returns Result of acceptance
   */
  const acceptInvitation = useCallback(async (token: string): Promise<AcceptInvitationResult> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'You must be logged in to accept an invitation' }
      }

      // Get invitation
      const { data: invitation, error: fetchError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .single()

      if (fetchError || !invitation) {
        return { success: false, error: 'Invitation not found' }
      }

      // Verify email matches
      if (invitation.email.toLowerCase() !== user.email?.toLowerCase()) {
        return { success: false, error: 'This invitation was sent to a different email address' }
      }

      // Check if already accepted
      if (invitation.status === 'accepted') {
        return { success: false, error: 'This invitation has already been accepted' }
      }

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        // Update status to expired
        await supabase
          .from('team_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id)
        return { success: false, error: 'This invitation has expired' }
      }

      // Check if cancelled
      if (invitation.status === 'cancelled') {
        return { success: false, error: 'This invitation has been cancelled' }
      }

      // Check if user is already a team member
      const { data: existingMembership } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', invitation.team_id)
        .eq('user_id', user.id)
        .single()

      if (existingMembership) {
        // Update invitation to accepted anyway
        await supabase
          .from('team_invitations')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
          })
          .eq('id', invitation.id)
        return { success: true, teamId: invitation.team_id }
      }

      // Add user to team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: invitation.team_id,
          user_id: user.id,
          role: invitation.role,
        })

      if (memberError) {
        console.error('Add team member error:', memberError)
        return { success: false, error: 'Failed to join team' }
      }

      // Update invitation status
      await supabase
        .from('team_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id)

      return { success: true, teamId: invitation.team_id }
    } catch (err) {
      console.error('Accept invitation error:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to accept invitation',
      }
    }
  }, [supabase])

  /**
   * Cancel a pending invitation
   * @param id - Invitation ID
   * @returns Whether cancellation was successful
   */
  const cancelInvitation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (updateError) {
        console.error('Cancel invitation error:', updateError)
        return false
      }

      // Update local state
      setInvitations(prev =>
        prev.map(inv =>
          inv.id === id ? { ...inv, status: 'cancelled' } : inv
        )
      )

      return true
    } catch (err) {
      console.error('Cancel invitation error:', err)
      return false
    }
  }, [supabase])

  /**
   * Resend an invitation (generates new token and expiry)
   * @param id - Invitation ID
   * @returns Whether resend was successful
   */
  const resendInvitation = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Generate new token
      const newToken = generateSecureToken()

      // Calculate new expiration
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({
          token: newToken,
          expires_at: expiresAt.toISOString(),
          status: 'pending',
        })
        .eq('id', id)

      if (updateError) {
        console.error('Resend invitation error:', updateError)
        return false
      }

      // TODO: Send email with new invitation link

      // Refetch invitations
      await fetchInvitations()

      return true
    } catch (err) {
      console.error('Resend invitation error:', err)
      return false
    }
  }, [supabase, fetchInvitations])

  // Fetch invitations on mount and when teamId changes
  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  return {
    invitations,
    isLoading,
    error,
    sendInvitations,
    getInvitationByToken,
    acceptInvitation,
    cancelInvitation,
    resendInvitation,
    refetch: fetchInvitations,
  }
}
