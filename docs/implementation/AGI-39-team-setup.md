# AGI-39: Company/Team Setup Flow Implementation Plan

## Overview
This document outlines the implementation plan for the company/team onboarding and management flow in ChainLinked.

## Requirements
- Users can create a company
- Invites sent via email (using Supabase Edge Functions)
- Invited users can join team
- Company creation screen with name and logo upload
- Email invite system for teammates
- Team member acceptance flow

## Database Schema

### New Tables

#### 1. `companies` Table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Users can view companies they belong to
CREATE POLICY "Users can view their companies" ON companies
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id IN (
        SELECT id FROM teams WHERE teams.company_id = companies.id
      )
      AND team_members.user_id = auth.uid()
    )
  );

-- Only owner can update company
CREATE POLICY "Owner can update company" ON companies
  FOR UPDATE USING (owner_id = auth.uid());

-- Authenticated users can create companies
CREATE POLICY "Authenticated users can create companies" ON companies
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

#### 2. `team_invitations` Table
```sql
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT UNIQUE NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired, cancelled
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,

  CONSTRAINT valid_role CHECK (role IN ('admin', 'member')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);

-- RLS Policies
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Team admins/owners can view invitations
CREATE POLICY "Team admins can view invitations" ON team_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- Anyone can view their own invitation by token (for acceptance flow)
CREATE POLICY "Users can view their invitation by email" ON team_invitations
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
```

### Modify Existing Tables

#### Update `teams` Table
Add company_id reference:
```sql
ALTER TABLE teams ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
```

Note: The existing `teams` and `team_members` tables already exist in the schema and will be reused.

## Architecture

### File Structure
```
app/
  onboarding/
    company/
      page.tsx          # Company creation wizard
    invite/
      page.tsx          # Invite teammates screen
  invite/
    [token]/
      page.tsx          # Public invitation acceptance page

components/
  features/
    company-setup-form.tsx    # Company creation form
    invite-teammates-form.tsx # Email invitation form

hooks/
  use-company.ts        # Company CRUD operations
  use-invitations.ts    # Invitation management

lib/
  supabase/
    edge-functions/     # Supabase Edge Functions (if needed)
```

### Onboarding Flow

1. **User Signs Up / Logs In**
   - Check if user has a company
   - If no company, redirect to `/onboarding/company`

2. **Company Creation (`/onboarding/company`)**
   - User enters company name
   - Optional: Upload company logo
   - Creates company + default team
   - Adds user as team owner
   - Redirects to `/onboarding/invite`

3. **Invite Teammates (`/onboarding/invite`)**
   - User can enter email addresses
   - Generate unique invitation tokens
   - Send emails via Supabase Edge Function or Resend
   - Option to skip this step
   - Redirects to `/dashboard`

4. **Accept Invitation (`/invite/[token]`)**
   - Public page accessible without auth
   - Validates token and expiration
   - If logged in with matching email, accepts invitation
   - If not logged in, redirects to signup with invitation token preserved
   - After signup/login, auto-joins team

### Email Integration

For sending invitation emails, we have two options:

**Option A: Supabase Edge Function with Resend**
- Create edge function that sends emails via Resend API
- Pros: Serverless, scalable
- Cons: Requires Resend API key configuration

**Option B: Use Supabase Auth Magic Link (Simplified)**
- Use existing email infrastructure
- Customize email template
- Pros: Built-in, no additional setup
- Cons: Less customization

**Recommended: Option A** - Provides more control over email content and branding.

## Component Design

### CompanySetupForm
```typescript
interface CompanySetupFormProps {
  onComplete: (company: Company) => void
  onSkip?: () => void
}

// Features:
// - Company name input with validation
// - Logo upload with preview
// - Slug auto-generation from name
// - Loading state during creation
// - Error handling
```

### InviteTeammatesForm
```typescript
interface InviteTeammatesFormProps {
  teamId: string
  companyName: string
  onComplete: () => void
  onSkip: () => void
}

// Features:
// - Multiple email input (comma-separated or line-by-line)
// - Email validation
// - Role selection (admin/member)
// - Bulk invite support
// - Invitation status display
// - Skip option for later
```

## API Routes / Server Actions

### Company Operations
- `createCompany(name, logoUrl?)` - Create new company
- `updateCompany(id, updates)` - Update company details
- `getCompany(id)` - Get company by ID
- `getUserCompany()` - Get current user's company

### Invitation Operations
- `sendInvitations(teamId, emails[], role)` - Send bulk invitations
- `getInvitation(token)` - Get invitation by token
- `acceptInvitation(token)` - Accept invitation
- `cancelInvitation(id)` - Cancel pending invitation
- `resendInvitation(id)` - Resend invitation email

## Security Considerations

1. **Token Security**
   - Generate cryptographically secure random tokens
   - Tokens expire after 7 days
   - Single-use (marked as accepted after use)

2. **Email Validation**
   - Verify email format before sending
   - Rate limit invitation sends

3. **Authorization**
   - Only team owners/admins can send invitations
   - RLS policies enforce data access

4. **Invitation Acceptance**
   - Verify token validity and expiration
   - Match invitation email with user email
   - Prevent duplicate team membership

## Implementation Steps

1. **Phase 1: Database Setup** (via Supabase Dashboard)
   - Create `companies` table
   - Create `team_invitations` table
   - Update `teams` table with `company_id`
   - Add RLS policies

2. **Phase 2: Types & Hooks**
   - Add TypeScript types for new tables
   - Create `use-company.ts` hook
   - Create `use-invitations.ts` hook

3. **Phase 3: Components**
   - Build `company-setup-form.tsx`
   - Build `invite-teammates-form.tsx`

4. **Phase 4: Pages**
   - Create `/onboarding/company` page
   - Create `/onboarding/invite` page
   - Create `/invite/[token]` page

5. **Phase 5: Middleware & Auth**
   - Update middleware for onboarding flow
   - Update auth provider to include company info

6. **Phase 6: Email Integration**
   - Set up Supabase Edge Function for emails
   - Configure email templates

## Testing Checklist

- [ ] User can create a company with name and logo
- [ ] Company slug is auto-generated and unique
- [ ] User is automatically added as team owner
- [ ] Invitations can be sent to multiple emails
- [ ] Invitation emails are received
- [ ] Invitation links work correctly
- [ ] Expired invitations are rejected
- [ ] Accepted invitations cannot be reused
- [ ] Team members see correct company/team data
- [ ] Non-authenticated users redirected to login
- [ ] Existing users can join teams via invitation
- [ ] New users can signup via invitation link
