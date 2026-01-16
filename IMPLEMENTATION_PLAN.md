# ChainLinked Data Mapping Implementation Plan

## Overview
Remove all mock/sample data from the frontend and map real Supabase data to all pages.

## Current State Analysis

### User Data Available (omrajpal.exe@gmail.com)
- **User ID**: `c8cf2bfa-ad7a-4cb4-95c7-30dadecbac41`
- **Email**: omrajpal.exe@gmail.com
- **Name**: Om Rajpal (from LinkedIn profile)

### LinkedIn Profile Data (HAS DATA)
- Headline: "Intern @NOTatMRP | Intern @DRDO | SIH'24 Winner | Junior at TIET"
- Location: Hisar, Haryana, India
- Connections: 116
- Followers: 263
- Profile Picture: Available via raw_data.profilePhotoUrl
- Background Image: Available via raw_data.backgroundPhotoUrl

### LinkedIn Analytics (HAS DATA - 6 records)
- Impressions: 34
- Profile Views: 95
- Search Appearances: 44
- Followers: 263
- Impression Growth: -63.1%

### Tables WITH Data
| Table | Records | Notes |
|-------|---------|-------|
| users | 1 | User profile |
| linkedin_profiles | 1 | LinkedIn profile data |
| linkedin_analytics | 6 | Analytics snapshots |
| templates | 3 | Public templates |
| inspiration_posts | 3 | Inspiration content |

### Tables WITHOUT Data (Empty for this user)
| Table | Notes |
|-------|-------|
| my_posts | User hasn't captured their posts |
| scheduled_posts | No scheduled posts |
| post_analytics | No post-level analytics |
| analytics_history | No historical data |
| audience_data | No audience demographics |
| team_members | No team membership |
| posting_goals | No goals set |

---

## Mock Data Locations Identified

### Components with Sample Data Exports

| File | Export Name | Issue |
|------|-------------|-------|
| `components/features/team-activity-feed.tsx` | `sampleTeamPosts` | 5 mock posts |
| `components/features/team-leaderboard.tsx` | `sampleTeamMembers` | 8 mock members |
| `components/features/analytics-chart.tsx` | `generateSampleData()` | Generates 30-day mock data |
| `components/features/schedule-calendar.tsx` | `sampleScheduledPostItems` | 10 mock scheduled posts |
| `components/features/goals-tracker.tsx` | `SAMPLE_GOALS`, `DEFAULT_CURRENT_STREAK` | Mock goals |
| `components/features/post-performance.tsx` | `samplePostPerformance` | Mock post metrics |
| `components/features/inspiration-feed.tsx` | `sampleInspirationPosts` | 10 mock posts |
| `components/features/template-library.tsx` | `SAMPLE_TEMPLATES` | 8 mock templates |

### Pages with Fallback Patterns

| Page | Pattern | Problem |
|------|---------|---------|
| `app/dashboard/page.tsx` | `posts.length > 0 ? posts : sampleTeamPosts` | Falls back to mock |
| `app/dashboard/page.tsx` | `scheduledPosts.length > 0 ? scheduledPosts : sampleScheduledPostItems` | Falls back to mock |
| `app/dashboard/team/page.tsx` | `posts.length > 0 ? posts : sampleTeamPosts` | Falls back to mock |
| `app/dashboard/team/page.tsx` | `members.length > 0 ? members : sampleTeamMembers` | Falls back to mock |

---

## Implementation Strategy

### Strategy: Replace Mock Fallbacks with Empty States

Instead of showing fake data when real data is empty, show meaningful empty states that encourage users to take action (capture data via extension, create posts, etc.)

---

## Phase 1: Dashboard Page Fix

### Task 1.1: Update Dashboard Page
**File**: `app/dashboard/page.tsx`

**Changes**:
1. Remove imports for sample data
2. Remove fallback pattern - use real data directly
3. Pass `isLoading` to components for loading states
4. Components will handle empty states internally

**Before**:
```typescript
const displayTeamPosts = teamPosts.length > 0 ? teamPosts : sampleTeamPosts
const displayScheduledPosts = scheduledPosts.length > 0 ? scheduledPosts : sampleScheduledPostItems
```

**After**:
```typescript
// Use real data directly - components handle empty states
<TeamActivityFeed posts={teamPosts} isLoading={postsLoading} />
<ScheduleCalendar posts={scheduledPosts} isLoading={scheduleLoading} />
```

### Task 1.2: Update TeamActivityFeed Component
**File**: `components/features/team-activity-feed.tsx`

**Changes**:
1. Keep `sampleTeamPosts` export for backward compatibility (marked deprecated)
2. Add empty state UI when `posts.length === 0`
3. Show message: "No team activity yet. Posts from your team will appear here."

### Task 1.3: Update ScheduleCalendar Component
**File**: `components/features/schedule-calendar.tsx`

**Changes**:
1. Keep `sampleScheduledPostItems` export (marked deprecated)
2. Add empty state UI when `posts.length === 0`
3. Show message: "No scheduled posts. Create your first post to get started!"

---

## Phase 2: Analytics Page Fix

### Task 2.1: Update Analytics Chart
**File**: `components/features/analytics-chart.tsx`

**Changes**:
1. Remove `generateSampleData()` usage
2. When no data provided, show empty state instead of fake chart
3. Use real data from `linkedin_analytics` table

### Task 2.2: Update GoalsTracker
**File**: `components/features/goals-tracker.tsx`

**Changes**:
1. Remove `SAMPLE_GOALS` and `DEFAULT_CURRENT_STREAK` defaults
2. Fetch real goals from `posting_goals` table
3. Show empty state: "Set your first posting goal to track progress"

### Task 2.3: Update PostPerformance Component
**File**: `components/features/post-performance.tsx`

**Changes**:
1. Remove `samplePostPerformance` usage
2. Fetch from `my_posts` or `post_analytics` table
3. Show empty state when no posts captured

---

## Phase 3: Team Page Fix

### Task 3.1: Update Team Page
**File**: `app/dashboard/team/page.tsx`

**Changes**:
1. Remove fallback patterns
2. Pass real data directly to components
3. Components handle empty states

### Task 3.2: Update TeamLeaderboard Component
**File**: `components/features/team-leaderboard.tsx`

**Changes**:
1. Remove `sampleTeamMembers` usage
2. Show empty state: "Join or create a team to see the leaderboard"
3. Keep export marked as deprecated

---

## Phase 4: Schedule Page Fix

### Task 4.1: Verify Schedule Page
**File**: `app/dashboard/schedule/page.tsx`

**Changes**:
1. Ensure no mock data fallbacks
2. Show calendar with empty dates when no posts scheduled

---

## Phase 5: Templates & Inspiration Pages

### Task 5.1: Update Template Library
**File**: `components/features/template-library.tsx`

**Changes**:
1. Create `useTemplates` hook to fetch from database
2. Remove `SAMPLE_TEMPLATES` default
3. Templates table HAS 3 records - should display them
4. Show "Create your first template" when empty

### Task 5.2: Update Inspiration Feed
**File**: `components/features/inspiration-feed.tsx`

**Changes**:
1. Create `useInspirationPosts` hook
2. Fetch from `inspiration_posts` table (has 3 records)
3. Remove `sampleInspirationPosts` usage
4. Show real viral posts from database

---

## Phase 6: Create Missing Hooks

### Task 6.1: Create useTemplates Hook
**File**: `hooks/use-templates.ts`

```typescript
// Fetch templates from Supabase
// Support filtering by category
// Include user's templates + public templates
```

### Task 6.2: Create useInspirationPosts Hook
**File**: `hooks/use-inspiration-posts.ts`

```typescript
// Fetch inspiration_posts from Supabase
// Support pagination
// Filter by category/industry
```

### Task 6.3: Create usePostingGoals Hook
**File**: `hooks/use-posting-goals.ts`

```typescript
// Fetch posting_goals for current user
// Calculate streak from my_posts
// Return goal progress metrics
```

---

## Empty State Design Guidelines

All empty states should:
1. Use a muted icon (from Tabler Icons)
2. Display a friendly message explaining why it's empty
3. Include a CTA button to take action
4. Match the existing UI design system

**Example**:
```tsx
<div className="flex flex-col items-center justify-center p-8 text-center">
  <IconInbox className="size-12 text-muted-foreground/50 mb-4" />
  <h3 className="font-medium">No posts yet</h3>
  <p className="text-sm text-muted-foreground mt-1">
    Your team's posts will appear here once captured.
  </p>
  <Button variant="outline" className="mt-4" asChild>
    <Link href="/dashboard/compose">Create your first post</Link>
  </Button>
</div>
```

---

## Testing Checklist

### Dashboard Page
- [ ] Shows real scheduled posts from `scheduled_posts` table
- [ ] Shows real team activity from `my_posts` table
- [ ] Shows empty state when no data (not mock data)
- [ ] Loading skeleton displays correctly
- [ ] No console errors

### Analytics Page
- [ ] Charts use real data from `linkedin_analytics`
- [ ] Empty charts show empty state, not fake data
- [ ] Goals show real data from `posting_goals`
- [ ] Post performance shows real posts

### Team Page
- [ ] Leaderboard shows real team members
- [ ] Activity feed shows real team posts
- [ ] Empty states display when no team

### Schedule Page
- [ ] Calendar shows real scheduled posts
- [ ] Empty dates are truly empty
- [ ] Create post action works

### Templates Page
- [ ] Shows 3 real templates from database
- [ ] Template preview works
- [ ] Create template works

### Inspiration Page
- [ ] Shows 3 real inspiration posts
- [ ] Swipe interface works
- [ ] No mock data visible

---

## Execution Order

1. **Dashboard Page** (highest traffic)
2. **Analytics Page** (core feature)
3. **Team Page**
4. **Schedule Page**
5. **Templates Page**
6. **Inspiration Page**
7. **Final QA pass**
8. **Commit and cleanup**

---

## Notes

1. Keep sample data exports temporarily for components that might be used elsewhere
2. Mark deprecated exports with JSDoc `@deprecated` tag
3. Each phase gets committed separately after QA
4. Run `npm run build` after each phase to verify no errors
