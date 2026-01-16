# AGI-40: BYOK API Key Setup Implementation Plan

## Overview
Implement Bring Your Own Key (BYOK) setup for OpenAI API keys, allowing users to securely store and manage their own API keys for AI-powered features.

## Security Architecture

### Key Storage Strategy
Since Supabase Vault requires the Vault extension and additional setup, we'll use a secure approach with:

1. **Server-side encryption**: API keys are encrypted before storage using AES-256-GCM
2. **Environment-based encryption key**: Encryption key stored in server environment variables
3. **Row Level Security (RLS)**: Users can only access their own API keys
4. **Masked display**: Keys are never fully displayed on the client - only last 4 characters shown

### Data Flow
```
User Input -> API Route -> Validate with OpenAI -> Encrypt -> Store in DB
                                                            |
DB -> Decrypt (server-side only) -> Use with OpenAI API <--+
```

## Database Schema

### New Table: `user_api_keys`
```sql
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'openai',
  encrypted_key TEXT NOT NULL,
  key_hint VARCHAR(10),  -- Last 4 chars for identification (e.g., "...abc1")
  is_valid BOOLEAN DEFAULT true,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, provider)
);

-- RLS Policies
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON user_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON user_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON user_api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON user_api_keys FOR DELETE
  USING (auth.uid() = user_id);
```

## API Design

### Endpoint: `/api/settings/api-keys`

#### GET - Check if user has API key configured
Response:
```json
{
  "hasKey": true,
  "provider": "openai",
  "keyHint": "...abc1",
  "isValid": true,
  "lastValidated": "2024-01-15T10:30:00Z"
}
```

#### POST - Save/Update API key
Request:
```json
{
  "provider": "openai",
  "apiKey": "sk-..."
}
```

Validation:
1. Check key format (starts with "sk-")
2. Make test call to OpenAI API (list models endpoint)
3. Encrypt and store on success

Response:
```json
{
  "success": true,
  "keyHint": "...abc1",
  "isValid": true
}
```

#### DELETE - Remove API key
Response:
```json
{
  "success": true
}
```

## Component Structure

### `hooks/use-api-keys.ts`
Custom hook for API key management:
- `apiKeyStatus`: Current key status (hasKey, keyHint, isValid)
- `isLoading`: Loading state
- `error`: Error message
- `saveApiKey(key)`: Save or update API key
- `deleteApiKey()`: Remove API key
- `validateApiKey()`: Re-validate existing key

### Updated Settings Component
The existing API Keys tab in `components/features/settings.tsx` will be connected to real data:
- Show "Configured" badge when key exists
- Display masked key hint
- Show validation status
- Allow key update/deletion

## Security Considerations

1. **Never log API keys** - Sensitive data must not appear in logs
2. **HTTPS only** - All API key transmission over encrypted connections
3. **Rate limiting** - Prevent brute force attempts on validation endpoint
4. **Key rotation** - Users can update keys at any time
5. **Minimal exposure** - Decryption only happens server-side when needed

## Implementation Tasks

1. [x] Create implementation plan
2. [ ] Add `user_api_keys` table type to database.ts
3. [ ] Create encryption utilities (lib/crypto.ts)
4. [ ] Create API route: `app/api/settings/api-keys/route.ts`
5. [ ] Create hook: `hooks/use-api-keys.ts`
6. [ ] Update Settings component to use real API key management
7. [ ] Add environment variable for encryption key
8. [ ] Test all flows (save, update, delete, validate)
9. [ ] Run build verification

## Environment Variables Required

```env
# Add to .env.local
API_KEY_ENCRYPTION_SECRET=<32-byte-hex-string>
```

## Files to Create/Modify

### New Files
- `app/api/settings/api-keys/route.ts` - API route for key management
- `hooks/use-api-keys.ts` - Client hook for key management
- `lib/crypto.ts` - Encryption utilities

### Modified Files
- `types/database.ts` - Add user_api_keys table type
- `components/features/settings.tsx` - Connect to real API key data

## Testing Checklist
- [ ] API key saves correctly
- [ ] Invalid keys are rejected with proper error
- [ ] Key validation against OpenAI works
- [ ] Keys display masked (only hint shown)
- [ ] Key deletion works
- [ ] Key update works
- [ ] Unauthorized access is blocked
- [ ] Build passes with no TypeScript errors
