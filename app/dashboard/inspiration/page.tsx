"use client"

/**
 * Inspiration Page
 * @description Content inspiration feed with curated viral posts, filtering,
 * pagination, save functionality, and swipe interface for AI learning
 * @module app/dashboard/inspiration/page
 */

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { InspirationFeed } from "@/components/features/inspiration-feed"
import { SwipeInterface } from "@/components/features/swipe-interface"
import { SiteHeader } from "@/components/site-header"
import { InspirationSkeleton } from "@/components/skeletons/page-skeletons"
import { useInspiration } from "@/hooks/use-inspiration"
import { useAuthContext } from "@/lib/auth/auth-provider"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  IconAlertCircle,
  IconRefresh,
  IconThumbUp,
  IconMessageCircle,
  IconShare,
  IconSparkles,
  IconBookmark,
  IconBookmarkFilled,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import { useDraft } from "@/lib/store/draft-context"
import { inspirationToast } from "@/lib/toast-utils"
import { useRouter } from "next/navigation"
import type { InspirationPost } from "@/components/features/inspiration-feed"

/**
 * Category badge variants mapping
 */
const CATEGORY_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  "thought-leadership": "default",
  "personal-stories": "secondary",
  "industry-news": "default",
  "how-to": "secondary",
  "engagement-hooks": "outline",
  "sales-biz-dev": "default",
}

/**
 * Category labels mapping
 */
const CATEGORY_LABELS: Record<string, string> = {
  "thought-leadership": "Thought Leadership",
  "personal-stories": "Personal Stories",
  "industry-news": "Industry News",
  "how-to": "How-To",
  "engagement-hooks": "Engagement Hooks",
  "sales-biz-dev": "Sales/Biz Dev",
  "general": "General",
}

/**
 * Formats a number into a compact, human-readable string
 * @param num - The number to format
 * @returns Formatted string (e.g., "1.2K", "3.4M")
 */
function formatMetricNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Generates initials from a full name
 * @param name - Full name to extract initials from
 * @returns Two-letter initials string
 */
function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Post detail modal component
 * @param post - The post to display in detail
 * @param open - Whether the modal is open
 * @param onOpenChange - Callback when modal open state changes
 * @param isSaved - Whether the post is saved
 * @param onSave - Callback when save is clicked
 * @param onUnsave - Callback when unsave is clicked
 * @param onRemix - Callback when remix is clicked
 */
function PostDetailModal({
  post,
  open,
  onOpenChange,
  isSaved,
  onSave,
  onUnsave,
  onRemix,
}: {
  post: InspirationPost | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isSaved: boolean
  onSave?: (postId: string) => void
  onUnsave?: (postId: string) => void
  onRemix?: (post: InspirationPost) => void
}) {
  if (!post) return null

  const relativeTime = formatDistanceToNow(new Date(post.postedAt), {
    addSuffix: true,
  })

  const categoryLabel = CATEGORY_LABELS[post.category] || post.category
  const categoryVariant = CATEGORY_VARIANTS[post.category] || "outline"

  const handleSaveToggle = () => {
    if (isSaved) {
      onUnsave?.(post.id)
    } else {
      onSave?.(post.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Avatar className="size-12 shrink-0">
              {post.author.avatar && (
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
              )}
              <AvatarFallback className="text-sm font-medium">
                {getInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2 flex-wrap">
                <span className="truncate">{post.author.name}</span>
                <Badge variant={categoryVariant} className="text-xs shrink-0">
                  {categoryLabel}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-sm">
                {post.author.headline}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="space-y-4 py-4">
            {/* Full Post Content */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Metrics */}
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <IconThumbUp className="size-4" />
                <span className="text-sm">{formatMetricNumber(post.metrics.reactions)} reactions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconMessageCircle className="size-4" />
                <span className="text-sm">{formatMetricNumber(post.metrics.comments)} comments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconShare className="size-4" />
                <span className="text-sm">{formatMetricNumber(post.metrics.reposts)} reposts</span>
              </div>
            </div>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground">
              Posted {relativeTime}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="default"
            onClick={() => {
              onRemix?.(post)
              onOpenChange(false)
            }}
            className="flex-1 gap-2"
          >
            <IconSparkles className="size-4" />
            Remix This Post
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveToggle}
            className="gap-2"
          >
            {isSaved ? (
              <>
                <IconBookmarkFilled className="size-4 text-primary" />
                Saved
              </>
            ) : (
              <>
                <IconBookmark className="size-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Inspiration page content component with real data
 * Integrates the enhanced useInspiration hook with filtering, pagination,
 * and save functionality
 */
function InspirationContent() {
  const router = useRouter()
  const { loadForRemix } = useDraft()

  const {
    posts,
    suggestions,
    savedPostIds,
    filters,
    pagination,
    isLoading,
    error,
    refetch,
    setFilters,
    loadMore,
    savePost,
    unsavePost,
    saveSwipePreference,
    isPostSaved,
  } = useInspiration()

  // Post detail modal state
  const [selectedPost, setSelectedPost] = React.useState<InspirationPost | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  /**
   * Handle expanding a post to show detail modal
   * @param post - The post to expand
   */
  const handleExpand = React.useCallback((post: InspirationPost) => {
    setSelectedPost(post)
    setIsDetailOpen(true)
  }, [])

  /**
   * Handle remixing a post - loads into composer and navigates
   * @param post - The post to remix
   */
  const handleRemix = React.useCallback((post: InspirationPost) => {
    loadForRemix(post.id, post.content, post.author.name)
    inspirationToast.remixed()
    router.push("/dashboard/compose")
  }, [loadForRemix, router])

  /**
   * Handle saving a post with toast notification
   * @param postId - ID of the post to save
   */
  const handleSave = React.useCallback((postId: string) => {
    savePost(postId)
    inspirationToast.saved()
  }, [savePost])

  // Show error state
  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-destructive">
              <IconAlertCircle className="h-5 w-5" />
              <span>Failed to load inspiration: {error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={refetch}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state only on initial load
  if (isLoading && posts.length === 0) {
    return <InspirationSkeleton />
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Swipe Interface - Takes 1 column on desktop */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <SwipeInterface
            suggestions={suggestions}
            onSwipe={(id, direction) => {
              // Find the suggestion content for AI learning
              const suggestion = suggestions.find(s => s.id === id)
              const action = direction === 'right' ? 'like' : 'dislike'
              saveSwipePreference(id, action, suggestion?.content)
            }}
          />
        </div>

        {/* Inspiration Feed - Takes 2 columns on desktop */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <InspirationFeed
            posts={posts}
            savedPostIds={savedPostIds}
            filters={filters}
            pagination={pagination}
            isLoading={isLoading}
            error={error}
            onFiltersChange={setFilters}
            onLoadMore={loadMore}
            onSave={handleSave}
            onUnsave={unsavePost}
            onExpand={handleExpand}
            onRemix={handleRemix}
          />
        </div>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        isSaved={selectedPost ? isPostSaved(selectedPost.id) : false}
        onSave={handleSave}
        onUnsave={unsavePost}
        onRemix={handleRemix}
      />
    </div>
  )
}

/**
 * Inspiration page component
 * @returns Inspiration page with curated viral posts, filtering, pagination,
 * swipeable content feed, and post detail view
 */
export default function InspirationPage() {
  const { isLoading: authLoading } = useAuthContext()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Inspiration" />
        <main id="main-content" className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {authLoading ? <InspirationSkeleton /> : <InspirationContent />}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
