# AGI-52: Swipe Interface for Post Suggestions

## Overview
Build a Tinder-style swipe interface for AI-generated post suggestions that allows users to quickly review content ideas, express preferences through swiping, and directly edit/post liked suggestions.

## Requirements

### Functional Requirements
- [x] Tinder-style card component with animations
- [x] AI-generated post suggestions (from inspiration_posts table)
- [x] Left swipe (Not my style) action
- [x] Right swipe (I like this) action
- [x] Swipe data capture to database (swipe_preferences table)
- [x] Post from swipe flow (right swipe to edit and post)

### Acceptance Criteria
- [x] Swipe data captured for 80% of suggestions shown
- [x] Smooth swipe animations using CSS transforms
- [x] Can post directly from right swipe

## Architecture

### Component Structure
```
app/
  dashboard/
    swipe/
      page.tsx              # Dedicated swipe page
components/
  features/
    swipe-card.tsx          # Enhanced swipe card component (existing)
    swipe-interface.tsx     # Main swipe interface (existing)
hooks/
  use-swipe-suggestions.ts  # AI suggestion management
  use-swipe-actions.ts      # Swipe action handling and DB persistence
```

### Database Schema (Existing)
The `swipe_preferences` table already exists in the database:
```sql
swipe_preferences {
  id: string (uuid)
  user_id: string (uuid)
  post_id: string | null
  suggestion_content: string | null
  action: string ('like' | 'dislike')
  created_at: string (timestamp)
}
```

### Data Flow
1. User navigates to Swipe page
2. `useSwipeSuggestions` hook fetches suggestions from `inspiration_posts`
3. Suggestions are displayed in a card stack
4. User swipes left/right or uses buttons
5. `useSwipeActions` captures the swipe to `swipe_preferences`
6. On right swipe, user can click "Edit & Post" to open composer
7. Content is loaded via `DraftContext` and user navigates to compose

### Animation Strategy
Using CSS transforms and transitions (no Framer Motion dependency):
- Transform: `translateX()` for horizontal movement
- Rotation: Small rotation based on swipe direction
- Opacity: Fade indicators based on swipe direction
- Exit: 300ms transition for smooth card exit
- Stack: Background cards scale/translate for depth effect

## Implementation Details

### Enhanced SwipeInterface Component
The existing `swipe-interface.tsx` already has:
- Drag/touch handling
- Keyboard navigation (arrow keys)
- Visual feedback indicators
- Card stack with depth effect
- Loading and empty states

Enhancements needed:
- Better integration with new hooks
- Improved accessibility
- Category filtering
- Suggestion refresh capability

### useSwipeSuggestions Hook
```typescript
interface UseSwipeSuggestionsReturn {
  suggestions: PostSuggestion[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  hasMore: boolean
  loadMore: () => Promise<void>
  seenIds: Set<string>
}
```

### useSwipeActions Hook
```typescript
interface UseSwipeActionsReturn {
  recordSwipe: (suggestionId: string, action: 'like' | 'dislike', content?: string) => Promise<void>
  swipeStats: { likes: number; dislikes: number; total: number }
  captureRate: number // Percentage of suggestions with recorded swipes
  recentSwipes: SwipeRecord[]
  isRecording: boolean
}
```

### Swipe Page Layout
Full-screen focused swipe experience:
- Centered card stack
- Action buttons below
- Stats/progress in header
- Quick access to compose on right swipe

## Files Changed

### New Files
1. `app/dashboard/swipe/page.tsx` - Dedicated swipe page
2. `hooks/use-swipe-suggestions.ts` - Suggestion fetching/management
3. `hooks/use-swipe-actions.ts` - Swipe recording and stats

### Modified Files
1. `components/features/swipe-interface.tsx` - Enhanced with new hooks
2. `components/app-sidebar.tsx` - Add Swipe nav item
3. `components/skeletons/page-skeletons.tsx` - Add SwipeSkeleton
4. `lib/toast-utils.ts` - Add swipe toast utilities

## Testing Checklist
- [ ] Component renders without errors
- [ ] All props are properly typed
- [ ] Loading states work correctly
- [ ] Error states are handled
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Dark mode works correctly
- [ ] Accessibility basics (focus states, aria labels)
- [ ] No console errors or warnings
- [ ] Build succeeds without errors
- [ ] Swipe data persists to database
- [ ] Edit & Post flow works correctly
