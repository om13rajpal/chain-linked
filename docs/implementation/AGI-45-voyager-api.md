# AGI-45: Voyager API Fallback Implementation

## Overview

LinkedIn's Voyager API is the internal REST API that powers the LinkedIn web application. This implementation provides a fallback mechanism when the official LinkedIn API fails or is unavailable.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ChainLinked Application                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  Official API    │    │  Voyager API     │                   │
│  │  (Primary)       │    │  (Fallback)      │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                       │                              │
│           └───────────┬───────────┘                              │
│                       │                                          │
│           ┌───────────▼───────────┐                              │
│           │   Unified LinkedIn    │                              │
│           │   Service Layer       │                              │
│           └───────────┬───────────┘                              │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │    Supabase     │
              │  (Credentials   │
              │   Storage)      │
              └─────────────────┘
```

## Voyager API Endpoints

### Authentication
Voyager requires LinkedIn session cookies for authentication:
- `li_at` - Primary authentication cookie (session token)
- `JSESSIONID` - Session identifier (CSRF token)
- `liap` - LinkedIn application cookie (optional)

### Key Endpoints

#### Profile Data
```
GET /voyager/api/me
GET /voyager/api/identity/profiles/{profileId}
GET /voyager/api/identity/dash/profiles
```

#### Posts (UGC - User Generated Content)
```
POST /voyager/api/contentcreation/normShares
POST /voyager/api/feed/shares
GET /voyager/api/feed/updates
```

#### Analytics
```
GET /voyager/api/analytics/dashAnalyticsSummary
GET /voyager/api/analytics/dashPostAnalytics
GET /voyager/api/identity/dash/profile/{urn}/statistics
```

#### Feed Operations
```
GET /voyager/api/feed/updates?q=networkShares&decorationId=com.linkedin.voyager.feed.render.FeedUpdate
POST /voyager/api/voyagerSocialDashActivityActions
```

## Cookie Management Strategy

### Storage Architecture
Cookies are stored in a new Supabase table `linkedin_credentials`:

```sql
CREATE TABLE linkedin_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  li_at TEXT NOT NULL,           -- Encrypted session token
  jsessionid TEXT NOT NULL,      -- CSRF token
  liap TEXT,                     -- Optional app cookie
  csrf_token TEXT,               -- x-csrf-token header value
  user_agent TEXT,               -- Browser user agent for consistency
  cookies_set_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,        -- When cookies expire
  is_valid BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Security Considerations
1. **Encryption at rest**: Cookies encrypted using AES-256-GCM before storage
2. **Transmission**: All API calls use HTTPS
3. **Access control**: Row Level Security (RLS) ensures users can only access their own credentials
4. **Token rotation**: Detect expired sessions and prompt re-authentication

## Proxy Rotation Strategy

To avoid IP-based rate limiting and detection:

### Recommended Proxy Providers
1. **Residential Proxies**: Bright Data, Oxylabs, or SmartProxy
2. **Configuration**: Rotate per-request or per-session

### Implementation
```typescript
interface ProxyConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  protocol: 'http' | 'https' | 'socks5';
}

// Environment variables for proxy configuration
// PROXY_HOST, PROXY_PORT, PROXY_USERNAME, PROXY_PASSWORD
```

## Fallback Trigger Logic

The system will trigger Voyager fallback when:

1. **Official API returns error codes**:
   - 401 Unauthorized (token expired)
   - 403 Forbidden (rate limited or blocked)
   - 429 Too Many Requests
   - 5xx Server errors

2. **Network failures**:
   - Timeout after 10 seconds
   - Connection refused
   - DNS resolution failure

3. **Manual override**:
   - User preference to use Voyager
   - Scheduled jobs prefer Voyager for reliability

## Rate Limiting

### Recommended Limits
- **Posts per day**: Max 20 (LinkedIn's daily limit)
- **Profile requests**: 60 per hour
- **Analytics requests**: 30 per hour
- **Feed requests**: 100 per hour

### Implementation
```typescript
interface RateLimitConfig {
  windowMs: number;       // Time window in milliseconds
  maxRequests: number;    // Max requests per window
  retryAfterMs: number;   // Wait time after hitting limit
}
```

## Request Headers

Required headers for Voyager requests:
```typescript
{
  'accept': 'application/vnd.linkedin.normalized+json+2.1',
  'accept-language': 'en-US,en;q=0.9',
  'csrf-token': '<JSESSIONID_VALUE>',
  'x-li-lang': 'en_US',
  'x-li-page-instance': 'urn:li:page:d_flagship3_feed;RANDOM_ID',
  'x-li-track': '{"clientVersion":"1.13.0","mpVersion":"1.13.0",...}',
  'x-restli-protocol-version': '2.0.0',
  'cookie': 'li_at=...; JSESSIONID=...',
  'user-agent': '<Consistent browser UA>'
}
```

## File Structure

```
lib/linkedin/
├── voyager-client.ts      # Core Voyager HTTP client
├── voyager-post.ts        # Post creation functionality
├── voyager-metrics.ts     # Analytics retrieval
├── voyager-profile.ts     # Profile data fetching
├── voyager-types.ts       # TypeScript type definitions
├── voyager-constants.ts   # API endpoints and constants
└── cookie-manager.ts      # Cookie storage and validation

app/api/linkedin/voyager/
├── post/route.ts          # Create posts via Voyager
├── metrics/route.ts       # Get post/profile metrics
└── profile/route.ts       # Get profile data
```

## Error Handling

### Error Categories
1. **Authentication errors**: Trigger re-authentication flow
2. **Rate limit errors**: Implement exponential backoff
3. **Network errors**: Retry with proxy rotation
4. **API changes**: Log and alert for investigation

### Retry Strategy
```typescript
interface RetryConfig {
  maxRetries: number;          // Default: 3
  initialDelayMs: number;      // Default: 1000
  maxDelayMs: number;          // Default: 30000
  backoffMultiplier: number;   // Default: 2
}
```

## Monitoring and Logging

### Metrics to Track
- API success/failure rates
- Average response times
- Cookie validity duration
- Rate limit hits
- Proxy performance

### Alerts
- Cookie expiration warnings (24h before)
- Unusual error rate spikes
- Account restriction detection

## Implementation Checklist

- [ ] Create `linkedin_credentials` table in Supabase
- [ ] Implement `voyager-client.ts` with HTTP client
- [ ] Implement `voyager-post.ts` for content creation
- [ ] Implement `voyager-metrics.ts` for analytics
- [ ] Create API routes for Voyager endpoints
- [ ] Add fallback logic to existing services
- [ ] Implement rate limiting
- [ ] Add error handling and retry logic
- [ ] Set up monitoring and logging
- [ ] Write tests for critical paths

## Risk Mitigation

### Account Safety
1. **Mimick human behavior**: Random delays between requests
2. **Use consistent fingerprints**: Same UA, timezone, language
3. **Respect rate limits**: Conservative request frequency
4. **Monitor for warnings**: Watch for "unusual activity" signals

### Legal Considerations
- Users must provide their own credentials
- No credential sharing between accounts
- Clear terms of service disclosure
- Data handling in compliance with privacy laws
