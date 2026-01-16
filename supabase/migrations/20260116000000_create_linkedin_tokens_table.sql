-- LinkedIn OAuth Tokens Table
-- Stores OAuth access and refresh tokens for LinkedIn API integration

CREATE TABLE IF NOT EXISTS linkedin_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  linkedin_urn TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['openid', 'profile', 'w_member_social'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_linkedin_tokens_user_id ON linkedin_tokens(user_id);

-- Enable Row Level Security
ALTER TABLE linkedin_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own tokens
CREATE POLICY "Users can only access their own tokens"
  ON linkedin_tokens FOR ALL
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_linkedin_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER linkedin_tokens_updated_at
  BEFORE UPDATE ON linkedin_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_linkedin_tokens_updated_at();

-- Add comment for documentation
COMMENT ON TABLE linkedin_tokens IS 'Stores LinkedIn OAuth tokens for API posting functionality';
COMMENT ON COLUMN linkedin_tokens.access_token IS 'OAuth access token for LinkedIn API calls';
COMMENT ON COLUMN linkedin_tokens.refresh_token IS 'OAuth refresh token to obtain new access tokens';
COMMENT ON COLUMN linkedin_tokens.expires_at IS 'Timestamp when the access token expires';
COMMENT ON COLUMN linkedin_tokens.linkedin_urn IS 'LinkedIn user URN (e.g., urn:li:person:ABC123)';
COMMENT ON COLUMN linkedin_tokens.scopes IS 'OAuth scopes granted by the user';
