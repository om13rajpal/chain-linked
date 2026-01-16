# AGI-44: LinkedIn Official API Integration

## Overview

This document outlines the implementation plan for integrating LinkedIn's Official API to enable direct posting from ChainLinked. The integration uses LinkedIn's Share API (ugcPosts) for posting content and OAuth 2.0 for authentication.

## Architecture

### OAuth 2.0 Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   ChainLinked   │────>│    LinkedIn      │────>│   ChainLinked   │
│   Frontend      │     │   OAuth Server   │     │   API Callback  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                                │
        │ 1. User clicks "Connect LinkedIn"             │
        v                                                │
┌─────────────────┐                                      │
│ Generate state  │                                      │
│ & redirect URL  │                                      │
└─────────────────┘                                      │
        │                                                │
        │ 2. Redirect to LinkedIn authorization         │
        v                                                │
┌─────────────────────────────────────┐                 │
│ LinkedIn: User grants permissions   │                 │
└─────────────────────────────────────┘                 │
        │                                                │
        │ 3. Redirect back with auth code               │
        v                                                │
┌─────────────────────────────────────┐                 │
│ Exchange code for access_token      │<────────────────┘
│ + refresh_token                     │
└─────────────────────────────────────┘
        │
        │ 4. Store encrypted tokens in Supabase
        v
┌─────────────────────────────────────┐
│ linkedin_tokens table               │
│ - user_id (FK)                      │
│ - access_token (encrypted)          │
│ - refresh_token (encrypted)         │
│ - expires_at                        │
│ - linkedin_urn                      │
└─────────────────────────────────────┘
```

### Token Refresh Strategy

1. **Proactive Refresh**: Check token expiry before each API call
2. **Buffer Time**: Refresh tokens 5 minutes before actual expiration
3. **Automatic Retry**: If a 401 is received, attempt token refresh and retry once
4. **Fallback**: If refresh fails, prompt user to re-authenticate

### LinkedIn API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/oauth/v2/authorization` | GET | Initiate OAuth flow |
| `/oauth/v2/accessToken` | POST | Exchange code for tokens |
| `/oauth/v2/accessToken` | POST | Refresh tokens |
| `/v2/userinfo` | GET | Get user's LinkedIn URN |
| `/v2/ugcPosts` | POST | Create text/media posts |
| `/v2/assets?action=registerUpload` | POST | Register media upload |
| `/v2/assets/{assetId}` | PUT | Upload media binary |

## Database Schema

### linkedin_tokens Table

```sql
CREATE TABLE linkedin_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  linkedin_urn TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['w_member_social', 'r_liteprofile'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policy
ALTER TABLE linkedin_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own tokens"
  ON linkedin_tokens FOR ALL
  USING (auth.uid() = user_id);
```

## Implementation Files

### 1. `lib/linkedin/types.ts`
Type definitions for LinkedIn API requests/responses.

### 2. `lib/linkedin/oauth.ts`
- `generateAuthUrl()`: Create LinkedIn authorization URL with state
- `exchangeCodeForTokens()`: Exchange auth code for tokens
- `refreshAccessToken()`: Refresh expired tokens
- `revokeToken()`: Revoke access (disconnect)

### 3. `lib/linkedin/api-client.ts`
- `LinkedInApiClient` class with authenticated requests
- Automatic token refresh on 401
- Rate limiting awareness
- Error handling and retry logic

### 4. `lib/linkedin/post.ts`
- `createTextPost()`: Post text-only content
- `createImagePost()`: Post with image attachment
- `createMultiImagePost()`: Post with multiple images
- `uploadMedia()`: Handle media upload flow

### 5. `app/api/linkedin/callback/route.ts`
OAuth callback handler that:
- Validates state parameter
- Exchanges code for tokens
- Stores tokens in Supabase
- Redirects to success/error page

### 6. `app/api/linkedin/post/route.ts`
POST endpoint for creating LinkedIn posts:
- Validates user authentication
- Retrieves/refreshes tokens
- Calls LinkedIn API
- Updates post status in database

### 7. `hooks/use-linkedin-post.ts`
React hook for posting from UI:
- `postToLinkedIn()`: Main posting function
- `isPosting`: Loading state
- `error`: Error state
- `isConnected`: LinkedIn connection status

## Error Handling

### Error Categories

1. **Authentication Errors** (401)
   - Token expired: Attempt refresh
   - Token invalid: Prompt re-authentication

2. **Authorization Errors** (403)
   - Missing scope: Show required permissions

3. **Rate Limit Errors** (429)
   - Implement exponential backoff
   - Queue posts for retry

4. **Validation Errors** (400)
   - Return user-friendly error messages

5. **Server Errors** (5xx)
   - Retry with exponential backoff (max 3 attempts)

### Retry Logic

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
}
```

## Security Considerations

1. **Token Storage**: Tokens stored in Supabase with RLS policies
2. **State Parameter**: CSRF protection using crypto-random state
3. **HTTPS Only**: All API calls over HTTPS
4. **Scope Limitation**: Request minimum required scopes
5. **Environment Variables**: Credentials in environment only

## Environment Variables

```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=https://yourapp.com/api/linkedin/callback
```

## Testing Plan

1. **Unit Tests**
   - Token refresh logic
   - Error handling
   - Post content validation

2. **Integration Tests**
   - OAuth flow (mock LinkedIn)
   - Post creation
   - Media upload

3. **E2E Tests**
   - Full posting flow
   - Error scenarios
   - Token expiration handling

## Success Metrics

- 99% posting success rate
- < 2s average post creation time
- 0 token-related authentication failures
- All media types supported (text, image, multi-image)

## Timeline

1. **Phase 1**: Core OAuth implementation (oauth.ts, callback route)
2. **Phase 2**: API client with retry logic (api-client.ts)
3. **Phase 3**: Post creation (post.ts, post route)
4. **Phase 4**: React hook and UI integration (use-linkedin-post.ts)
5. **Phase 5**: Testing and error handling refinement
