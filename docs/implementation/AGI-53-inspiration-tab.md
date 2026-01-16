# AGI-53: Inspiration Tab with Curated Viral Posts

## Overview

Build an inspiration feed with categorized high-performing viral posts, personalized by user niche with remix capabilities.

## Data Sources

1. **Internal viral posts** - Tagged when users' posts go viral (engagement threshold)
2. **Bright Data scraped posts** - High engagement threshold from external sources

## Component Architecture

```
app/
  dashboard/
    inspiration/
      page.tsx                    # Main inspiration page (enhanced)
      [postId]/
        page.tsx                  # Post detail view (new)

components/
  features/
    inspiration-feed.tsx          # Main feed component (enhanced)
    inspiration-post-card.tsx     # Individual post card (new)
    inspiration-post-detail.tsx   # Post detail modal/view (new)
    inspiration-filters.tsx       # Category/niche filter component (new)

hooks/
  use-inspiration.ts              # Main data hook (enhanced)
  use-user-niche.ts               # User niche detection (new)
```

## Database Schema

### Existing Table: `inspiration_posts`
Already has the necessary fields:
- `id` - UUID primary key
- `author_name`, `author_headline`, `author_profile_url`, `author_avatar_url`
- `content` - Post text
- `category` - Post category (thought-leadership, personal-stories, etc.)
- `niche` - Industry/topic niche for personalization
- `reactions`, `comments`, `reposts` - Engagement metrics
- `engagement_score` - Calculated engagement score
- `posted_at` - Original post date
- `source` - 'internal' | 'bright_data'
- `created_at` - Record creation date

### New Table: `user_niches` (for personalization)
```sql
CREATE TABLE user_niches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  niche VARCHAR(100) NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.5,
  source VARCHAR(50), -- 'profile_analysis', 'swipe_learning', 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, niche)
);

CREATE INDEX idx_user_niches_user_id ON user_niches(user_id);
```

### New Table: `saved_inspirations` (bookmarks)
```sql
CREATE TABLE saved_inspirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  inspiration_post_id UUID REFERENCES inspiration_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, inspiration_post_id)
);

CREATE INDEX idx_saved_inspirations_user_id ON saved_inspirations(user_id);
```

## Categories

| ID | Label | Description |
|----|-------|-------------|
| `thought-leadership` | Thought Leadership | Industry expertise, opinions, trends |
| `personal-stories` | Personal Stories | Career journeys, lessons learned |
| `industry-news` | Industry News | Commentary on news, trends |
| `how-to` | How-To / Educational | Tutorials, tips, frameworks |
| `engagement-hooks` | Engagement Hooks | Controversial, question-based posts |
| `sales-biz-dev` | Sales/Biz Dev | Outreach, business development |

## Personalization Logic

### Phase 1: Profile Analysis
1. Read user's LinkedIn profile from `linkedin_profiles` table
2. Extract: headline, industry, summary
3. Map to predefined niches using keyword matching

### Phase 2: Swipe Learning
1. Track swipe preferences in `swipe_preferences` table
2. Analyze liked posts to detect patterns
3. Update `user_niches` with learned preferences

### Phase 3: Feed Ranking
```typescript
// Scoring formula for post ranking
const score = (
  (baseEngagementScore * 0.4) +
  (nicheMatchScore * 0.35) +
  (categoryPreferenceScore * 0.15) +
  (recencyBonus * 0.1)
);
```

## API Endpoints (via Supabase)

### Fetch Inspiration Posts
```typescript
// With personalization
const { data } = await supabase
  .from('inspiration_posts')
  .select('*')
  .in('category', selectedCategories)
  .in('niche', userNiches.length > 0 ? userNiches : allNiches)
  .order('engagement_score', { ascending: false })
  .range(offset, offset + limit - 1);
```

### Save/Unsave Post
```typescript
// Save
await supabase.from('saved_inspirations').insert({ user_id, inspiration_post_id });

// Unsave
await supabase.from('saved_inspirations').delete()
  .eq('user_id', userId)
  .eq('inspiration_post_id', postId);
```

## UI/UX Design

### Inspiration Feed Page
- **Header**: Title, search bar, view toggle (grid/list)
- **Filters**: Category tabs (horizontal scroll), niche dropdown
- **Feed**: Responsive grid (1/2/3 columns based on viewport)
- **Pagination**: Infinite scroll or "Load More" button

### Post Card
- Author avatar, name, headline
- Category badge
- Truncated content (expandable)
- Engagement metrics (reactions, comments, reposts)
- Posted time (relative)
- Actions: Remix, Save, Expand

### Post Detail View (Modal/Page)
- Full post content
- Complete metrics
- Author profile link
- Remix button (prominent)
- Related posts suggestions

### Remix Flow
1. User clicks "Remix" on any post
2. Content loaded into draft context with attribution
3. Redirect to compose page
4. User edits and personalizes the content

## Implementation Steps

### Step 1: Database Updates
- Add `user_niches` table type to `types/database.ts`
- Add `saved_inspirations` table type
- Update `inspiration_posts` type if needed

### Step 2: Hook Enhancements
- Add pagination support to `use-inspiration`
- Add category filtering
- Add niche-based personalization
- Add save/unsave functionality

### Step 3: Component Development
- Create `inspiration-post-card.tsx` with proper typing
- Create `inspiration-filters.tsx` for category selection
- Update `inspiration-feed.tsx` with new features

### Step 4: Page Updates
- Enhance `app/dashboard/inspiration/page.tsx`
- Add post detail view capability

### Step 5: QA & Testing
- Run TypeScript build
- Test all interactions
- Verify responsive design
- Test dark mode

## Success Criteria

- [ ] 500+ categorized posts can be displayed (pagination)
- [ ] Posts personalized by user niche (when available)
- [ ] Can remix any inspiration post to compose page
- [ ] Category filtering works correctly
- [ ] Search functionality works
- [ ] Save/bookmark functionality works
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode support
- [ ] Build passes with no TypeScript errors
