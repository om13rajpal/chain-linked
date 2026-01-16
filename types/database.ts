/**
 * Database Types for Supabase
 * @description TypeScript types matching the Supabase database schema
 * @module types/database
 */

/**
 * JSON type for flexible JSONB columns
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Database schema type definition
 */
export interface Database {
  public: {
    Tables: {
      /** User accounts with Google OAuth integration */
      users: {
        Row: {
          id: string
          google_id: string | null
          email: string
          name: string | null
          avatar_url: string | null
          linkedin_profile_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          google_id?: string | null
          email: string
          name?: string | null
          avatar_url?: string | null
          linkedin_profile_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          google_id?: string | null
          email?: string
          name?: string | null
          avatar_url?: string | null
          linkedin_profile_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** LinkedIn profile snapshots */
      linkedin_profiles: {
        Row: {
          id: string
          user_id: string
          profile_urn: string | null
          public_identifier: string | null
          first_name: string | null
          last_name: string | null
          headline: string | null
          location: string | null
          industry: string | null
          profile_picture_url: string | null
          background_image_url: string | null
          connections_count: number | null
          followers_count: number | null
          summary: string | null
          raw_data: Json | null
          captured_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          profile_urn?: string | null
          public_identifier?: string | null
          first_name?: string | null
          last_name?: string | null
          headline?: string | null
          location?: string | null
          industry?: string | null
          profile_picture_url?: string | null
          background_image_url?: string | null
          connections_count?: number | null
          followers_count?: number | null
          summary?: string | null
          raw_data?: Json | null
          captured_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          profile_urn?: string | null
          public_identifier?: string | null
          first_name?: string | null
          last_name?: string | null
          headline?: string | null
          location?: string | null
          industry?: string | null
          profile_picture_url?: string | null
          background_image_url?: string | null
          connections_count?: number | null
          followers_count?: number | null
          summary?: string | null
          raw_data?: Json | null
          captured_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      /** Creator analytics snapshots */
      linkedin_analytics: {
        Row: {
          id: string
          user_id: string
          page_type: string
          impressions: number | null
          members_reached: number | null
          engagements: number | null
          new_followers: number | null
          profile_views: number | null
          search_appearances: number | null
          top_posts: Json | null
          raw_data: Json | null
          captured_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          page_type: string
          impressions?: number | null
          members_reached?: number | null
          engagements?: number | null
          new_followers?: number | null
          profile_views?: number | null
          search_appearances?: number | null
          top_posts?: Json | null
          raw_data?: Json | null
          captured_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          page_type?: string
          impressions?: number | null
          members_reached?: number | null
          engagements?: number | null
          new_followers?: number | null
          profile_views?: number | null
          search_appearances?: number | null
          top_posts?: Json | null
          raw_data?: Json | null
          captured_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** 90-day trend data */
      analytics_history: {
        Row: {
          id: string
          user_id: string
          date: string
          impressions: number | null
          members_reached: number | null
          engagements: number | null
          followers: number | null
          profile_views: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          impressions?: number | null
          members_reached?: number | null
          engagements?: number | null
          followers?: number | null
          profile_views?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          impressions?: number | null
          members_reached?: number | null
          engagements?: number | null
          followers?: number | null
          profile_views?: number | null
          created_at?: string
        }
        Relationships: []
      }
      /** Individual post performance */
      post_analytics: {
        Row: {
          id: string
          user_id: string
          activity_urn: string
          post_content: string | null
          post_type: string | null
          impressions: number | null
          members_reached: number | null
          unique_views: number | null
          reactions: number | null
          comments: number | null
          reposts: number | null
          engagement_rate: number | null
          profile_viewers: number | null
          followers_gained: number | null
          demographics: Json | null
          raw_data: Json | null
          posted_at: string | null
          captured_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_urn: string
          post_content?: string | null
          post_type?: string | null
          impressions?: number | null
          members_reached?: number | null
          unique_views?: number | null
          reactions?: number | null
          comments?: number | null
          reposts?: number | null
          engagement_rate?: number | null
          profile_viewers?: number | null
          followers_gained?: number | null
          demographics?: Json | null
          raw_data?: Json | null
          posted_at?: string | null
          captured_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_urn?: string
          post_content?: string | null
          post_type?: string | null
          impressions?: number | null
          members_reached?: number | null
          unique_views?: number | null
          reactions?: number | null
          comments?: number | null
          reposts?: number | null
          engagement_rate?: number | null
          profile_viewers?: number | null
          followers_gained?: number | null
          demographics?: Json | null
          raw_data?: Json | null
          posted_at?: string | null
          captured_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** Follower demographics and audience info */
      audience_data: {
        Row: {
          id: string
          user_id: string
          total_followers: number | null
          follower_growth: number | null
          demographics_preview: Json | null
          top_job_titles: Json | null
          top_companies: Json | null
          top_locations: Json | null
          top_industries: Json | null
          raw_data: Json | null
          captured_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_followers?: number | null
          follower_growth?: number | null
          demographics_preview?: Json | null
          top_job_titles?: Json | null
          top_companies?: Json | null
          top_locations?: Json | null
          top_industries?: Json | null
          raw_data?: Json | null
          captured_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_followers?: number | null
          follower_growth?: number | null
          demographics_preview?: Json | null
          top_job_titles?: Json | null
          top_companies?: Json | null
          top_locations?: Json | null
          top_industries?: Json | null
          raw_data?: Json | null
          captured_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** User's own posts */
      my_posts: {
        Row: {
          id: string
          user_id: string
          activity_urn: string
          content: string | null
          media_type: string | null
          reactions: number | null
          comments: number | null
          reposts: number | null
          impressions: number | null
          posted_at: string | null
          raw_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_urn: string
          content?: string | null
          media_type?: string | null
          reactions?: number | null
          comments?: number | null
          reposts?: number | null
          impressions?: number | null
          posted_at?: string | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_urn?: string
          content?: string | null
          media_type?: string | null
          reactions?: number | null
          comments?: number | null
          reposts?: number | null
          impressions?: number | null
          posted_at?: string | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** Posts captured from LinkedIn feed */
      feed_posts: {
        Row: {
          id: string
          user_id: string
          activity_urn: string
          author_urn: string | null
          author_name: string | null
          author_headline: string | null
          author_profile_url: string | null
          content: string | null
          hashtags: Json | null
          media_type: string | null
          reactions: number | null
          comments: number | null
          reposts: number | null
          engagement_score: number | null
          posted_at: string | null
          raw_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_urn: string
          author_urn?: string | null
          author_name?: string | null
          author_headline?: string | null
          author_profile_url?: string | null
          content?: string | null
          hashtags?: Json | null
          media_type?: string | null
          reactions?: number | null
          comments?: number | null
          reposts?: number | null
          engagement_score?: number | null
          posted_at?: string | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_urn?: string
          author_urn?: string | null
          author_name?: string | null
          author_headline?: string | null
          author_profile_url?: string | null
          content?: string | null
          hashtags?: Json | null
          media_type?: string | null
          reactions?: number | null
          comments?: number | null
          reposts?: number | null
          engagement_score?: number | null
          posted_at?: string | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** Scheduled posts queue */
      scheduled_posts: {
        Row: {
          id: string
          user_id: string
          content: string
          media_urls: Json | null
          scheduled_for: string
          timezone: string | null
          status: string
          posted_at: string | null
          linkedin_post_id: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          media_urls?: Json | null
          scheduled_for: string
          timezone?: string | null
          status?: string
          posted_at?: string | null
          linkedin_post_id?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          media_urls?: Json | null
          scheduled_for?: string
          timezone?: string | null
          status?: string
          posted_at?: string | null
          linkedin_post_id?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** Post templates */
      templates: {
        Row: {
          id: string
          user_id: string | null
          team_id: string | null
          name: string
          content: string
          category: string | null
          tags: Json | null
          is_public: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          team_id?: string | null
          name: string
          content: string
          category?: string | null
          tags?: Json | null
          is_public?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          team_id?: string | null
          name?: string
          content?: string
          category?: string | null
          tags?: Json | null
          is_public?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** Inspiration/viral posts */
      inspiration_posts: {
        Row: {
          id: string
          author_name: string | null
          author_headline: string | null
          author_profile_url: string | null
          author_avatar_url: string | null
          content: string
          category: string | null
          niche: string | null
          reactions: number | null
          comments: number | null
          reposts: number | null
          engagement_score: number | null
          posted_at: string | null
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          author_name?: string | null
          author_headline?: string | null
          author_profile_url?: string | null
          author_avatar_url?: string | null
          content: string
          category?: string | null
          niche?: string | null
          reactions?: number | null
          comments?: number | null
          reposts?: number | null
          engagement_score?: number | null
          posted_at?: string | null
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          author_name?: string | null
          author_headline?: string | null
          author_profile_url?: string | null
          author_avatar_url?: string | null
          content?: string
          category?: string | null
          niche?: string | null
          reactions?: number | null
          comments?: number | null
          reposts?: number | null
          engagement_score?: number | null
          posted_at?: string | null
          source?: string | null
          created_at?: string
        }
        Relationships: []
      }
      /** Swipe preferences for AI learning */
      swipe_preferences: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          suggestion_content: string | null
          action: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          suggestion_content?: string | null
          action: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          suggestion_content?: string | null
          action?: string
          created_at?: string
        }
        Relationships: []
      }
      /** Companies - Parent organizations for teams */
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          owner_id: string
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          owner_id: string
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          owner_id?: string
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** Teams/Companies */
      teams: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          owner_id: string
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          owner_id: string
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          owner_id?: string
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** Team members */
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: []
      }
      /** Team invitations for onboarding */
      team_invitations: {
        Row: {
          id: string
          team_id: string
          email: string
          role: string
          token: string
          invited_by: string
          status: string
          expires_at: string
          created_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          email: string
          role?: string
          token: string
          invited_by: string
          status?: string
          expires_at?: string
          created_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          email?: string
          role?: string
          token?: string
          invited_by?: string
          status?: string
          expires_at?: string
          created_at?: string
          accepted_at?: string | null
        }
        Relationships: []
      }
      /** Extension settings */
      extension_settings: {
        Row: {
          id: string
          user_id: string
          auto_capture_enabled: boolean | null
          capture_feed: boolean | null
          capture_analytics: boolean | null
          capture_profile: boolean | null
          capture_messaging: boolean | null
          sync_enabled: boolean | null
          sync_interval: number | null
          dark_mode: boolean | null
          notifications_enabled: boolean | null
          raw_settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          auto_capture_enabled?: boolean | null
          capture_feed?: boolean | null
          capture_analytics?: boolean | null
          capture_profile?: boolean | null
          capture_messaging?: boolean | null
          sync_enabled?: boolean | null
          sync_interval?: number | null
          dark_mode?: boolean | null
          notifications_enabled?: boolean | null
          raw_settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          auto_capture_enabled?: boolean | null
          capture_feed?: boolean | null
          capture_analytics?: boolean | null
          capture_profile?: boolean | null
          capture_messaging?: boolean | null
          sync_enabled?: boolean | null
          sync_interval?: number | null
          dark_mode?: boolean | null
          notifications_enabled?: boolean | null
          raw_settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      /** Sync metadata tracking */
      sync_metadata: {
        Row: {
          id: string
          user_id: string
          table_name: string
          last_synced_at: string
          sync_status: string
          pending_changes: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          table_name: string
          last_synced_at?: string
          sync_status?: string
          pending_changes?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          table_name?: string
          last_synced_at?: string
          sync_status?: string
          pending_changes?: number
          created_at?: string
        }
        Relationships: []
      }
      /** Posting goals */
      posting_goals: {
        Row: {
          id: string
          user_id: string
          period: string
          target_posts: number
          current_posts: number
          start_date: string
          end_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          period: string
          target_posts: number
          current_posts?: number
          start_date: string
          end_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          period?: string
          target_posts?: number
          current_posts?: number
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** User API keys for BYOK (encrypted storage) */
      user_api_keys: {
        Row: {
          id: string
          user_id: string
          provider: string
          encrypted_key: string
          key_hint: string | null
          is_valid: boolean
          last_validated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider?: string
          encrypted_key: string
          key_hint?: string | null
          is_valid?: boolean
          last_validated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          encrypted_key?: string
          key_hint?: string | null
          is_valid?: boolean
          last_validated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** User niches for content personalization */
      user_niches: {
        Row: {
          id: string
          user_id: string
          niche: string
          confidence: number | null
          source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          niche: string
          confidence?: number | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          niche?: string
          confidence?: number | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** Saved/bookmarked inspiration posts */
      saved_inspirations: {
        Row: {
          id: string
          user_id: string
          inspiration_post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          inspiration_post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          inspiration_post_id?: string
          created_at?: string
        }
        Relationships: []
      }
      /** LinkedIn OAuth tokens for API access */
      linkedin_tokens: {
        Row: {
          id: string
          user_id: string
          access_token: string
          refresh_token: string | null
          expires_at: string
          linkedin_urn: string | null
          scopes: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          refresh_token?: string | null
          expires_at: string
          linkedin_urn?: string | null
          scopes?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          refresh_token?: string | null
          expires_at?: string
          linkedin_urn?: string | null
          scopes?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** Brand kits extracted from websites */
      brand_kits: {
        Row: {
          id: string
          user_id: string
          team_id: string | null
          website_url: string
          primary_color: string
          secondary_color: string | null
          accent_color: string | null
          background_color: string | null
          text_color: string | null
          font_primary: string | null
          font_secondary: string | null
          logo_url: string | null
          logo_storage_path: string | null
          raw_extraction: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id?: string | null
          website_url: string
          primary_color: string
          secondary_color?: string | null
          accent_color?: string | null
          background_color?: string | null
          text_color?: string | null
          font_primary?: string | null
          font_secondary?: string | null
          logo_url?: string | null
          logo_storage_path?: string | null
          raw_extraction?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string | null
          website_url?: string
          primary_color?: string
          secondary_color?: string | null
          accent_color?: string | null
          background_color?: string | null
          text_color?: string | null
          font_primary?: string | null
          font_secondary?: string | null
          logo_url?: string | null
          logo_storage_path?: string | null
          raw_extraction?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      /** LinkedIn Voyager API credentials (session cookies) */
      linkedin_credentials: {
        Row: {
          id: string
          user_id: string
          li_at: string
          jsessionid: string
          liap: string | null
          csrf_token: string | null
          user_agent: string | null
          cookies_set_at: string
          expires_at: string | null
          is_valid: boolean
          last_used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          li_at: string
          jsessionid: string
          liap?: string | null
          csrf_token?: string | null
          user_agent?: string | null
          cookies_set_at?: string
          expires_at?: string | null
          is_valid?: boolean
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          li_at?: string
          jsessionid?: string
          liap?: string | null
          csrf_token?: string | null
          user_agent?: string | null
          cookies_set_at?: string
          expires_at?: string | null
          is_valid?: boolean
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/** Helper type to extract table row types */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

/** Helper type to extract insert types */
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']

/** Helper type to extract update types */
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

/**
 * Company type alias for convenience
 */
export type Company = Tables<'companies'>

/**
 * Company insert type alias
 */
export type CompanyInsert = TablesInsert<'companies'>

/**
 * Company update type alias
 */
export type CompanyUpdate = TablesUpdate<'companies'>

/**
 * Team type alias for convenience
 */
export type Team = Tables<'teams'>

/**
 * Team member type alias for convenience
 */
export type TeamMember = Tables<'team_members'>

/**
 * Team invitation type alias for convenience
 */
export type TeamInvitation = Tables<'team_invitations'>

/**
 * Team invitation insert type alias
 */
export type TeamInvitationInsert = TablesInsert<'team_invitations'>

/**
 * Invitation status enum type
 */
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

/**
 * Team member role enum type
 */
export type TeamMemberRole = 'owner' | 'admin' | 'member'

/**
 * Company with related team data
 */
export interface CompanyWithTeam extends Company {
  team?: Team | null
  team_members?: TeamMember[]
}

/**
 * Team invitation with inviter info
 */
export interface TeamInvitationWithInviter extends TeamInvitation {
  inviter?: {
    name: string | null
    email: string
    avatar_url: string | null
  }
  team?: {
    name: string
    company?: {
      name: string
      logo_url: string | null
    }
  }
}
