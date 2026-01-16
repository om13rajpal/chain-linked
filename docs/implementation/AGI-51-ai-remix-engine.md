# AGI-51: AI Remix Engine Implementation Plan

## Overview
Build an AI-powered post remix feature that allows users to rewrite inspiration posts using their own OpenAI API keys (BYOK - Bring Your Own Key).

## Architecture

### 1. API Route Architecture (`app/api/remix/route.ts`)

```
POST /api/remix
├── Request Body
│   ├── content: string (original post content)
│   ├── tone: 'professional' | 'casual' | 'thought-leader' | 'storyteller' | 'preserve'
│   └── instructions?: string (optional custom instructions)
├── Authentication
│   └── Requires authenticated user (via Supabase auth)
├── BYOK Key Retrieval
│   └── Fetch encrypted OpenAI key from user_api_keys table
├── OpenAI API Call
│   └── Chat completion with system prompt + user content
└── Response
    ├── remixedContent: string
    ├── originalContent: string
    └── tokensUsed: number
```

### 2. System Prompt Design

The AI remix engine uses carefully crafted system prompts to:
- Maintain the core message/value proposition
- Transform writing style based on selected tone
- Preserve key hashtags and mentions
- Ensure LinkedIn best practices (hook, body, CTA)
- Keep appropriate post length (100-250 words optimal)

**Tone Profiles:**
1. **Professional** - Formal, polished, corporate-appropriate
2. **Casual** - Conversational, relatable, personal
3. **Thought Leader** - Bold opinions, industry insights, contrarian views
4. **Storyteller** - Narrative arc, emotional hooks, personal anecdotes
5. **Preserve** - Keep original tone, just rephrase/restructure

### 3. Tone Analysis Approach

For "preserve" mode, the system:
1. Analyzes sentence structure (short/punchy vs long/flowing)
2. Detects emoji usage patterns
3. Identifies formatting preferences (lists, line breaks)
4. Notes vocabulary level (technical vs accessible)
5. Replicates these patterns in the remix

### 4. Modal Component Structure

```tsx
<RemixModal>
├── Header (title + close button)
├── Original Post Preview (read-only)
├── Tone Selector (radio group)
├── Custom Instructions (optional textarea)
├── AI Output Section
│   ├── Loading state (skeleton)
│   ├── Generated content (editable textarea)
│   └── Token usage indicator
├── Action Buttons
│   ├── Regenerate (try different variation)
│   ├── Use This (load into composer)
│   └── Cancel
└── Error Handling
    └── API key missing → Settings link
    └── Rate limit → Retry with backoff
    └── Other errors → User-friendly message
```

## File Structure

```
lib/
├── ai/
│   ├── openai-client.ts      # OpenAI client with BYOK support
│   └── remix-prompts.ts      # System prompts for remix
app/
└── api/
    └── remix/
        └── route.ts          # POST endpoint for remix
components/
└── features/
    └── remix-modal.tsx       # Modal UI component
hooks/
└── use-remix.ts              # Hook for remix functionality
types/
└── database.ts               # Add user_api_keys table type
```

## Database Schema

### user_api_keys Table
```sql
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'openai',
  encrypted_key TEXT NOT NULL,
  key_hint VARCHAR(10), -- Last 4 chars for display
  is_valid BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only access their own keys
CREATE POLICY "Users can manage their own API keys"
  ON user_api_keys
  FOR ALL
  USING (auth.uid() = user_id);
```

## Security Considerations

1. **API Key Storage**: Keys are encrypted at rest using Supabase Vault (or base64 for MVP)
2. **Key Transmission**: Keys never sent to client, only used server-side
3. **Rate Limiting**: Implement request throttling per user
4. **Input Sanitization**: Validate and sanitize all user inputs
5. **Error Messages**: Never expose API key or internal errors to client

## Implementation Steps

1. [x] Create implementation plan
2. [x] Add user_api_keys to database types (already existed)
3. [x] Create OpenAI client with BYOK support
4. [x] Create remix prompts library
5. [x] Create remix API route
6. [x] Create useRemix hook
7. [x] Create RemixModal component
8. [x] Add remix toast utilities
9. [ ] Update Settings to save/load API keys to database
10. [ ] Test end-to-end flow
11. [x] Run build verification (passed - no TypeScript errors in remix files)

## API Key Flow

```
1. User enters API key in Settings
   └─> Key validated with test call
   └─> Key encrypted and stored in user_api_keys

2. User clicks "Remix" on inspiration post
   └─> Modal opens with original content
   └─> User selects tone/instructions

3. User clicks "Generate"
   └─> API route fetches encrypted key
   └─> Key decrypted server-side
   └─> OpenAI call made with user's key
   └─> Response returned to client

4. User edits and uses remix
   └─> Content loaded into composer
   └─> User can further modify before posting
```

## Acceptance Criteria Mapping

| Criteria | Implementation |
|----------|----------------|
| Remix generates coherent rewritten posts | System prompts + GPT-4 quality |
| Maintains user's tone/style | "Preserve" mode + tone analysis |
| User can edit before posting | Editable textarea in modal |

## Testing Scenarios

1. **Happy Path**: User with valid key generates remix successfully
2. **No API Key**: Modal prompts user to add key in settings
3. **Invalid API Key**: Clear error message, link to settings
4. **Rate Limit**: Graceful handling with retry suggestion
5. **Empty Input**: Validation prevents API call
6. **Long Content**: Handles posts up to 3000 chars
7. **Special Characters**: Properly escapes/handles emojis, unicode
