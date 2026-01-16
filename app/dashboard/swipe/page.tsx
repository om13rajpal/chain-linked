"use client"

/**
 * Swipe Page
 * @description Tinder-style swipe interface for AI-generated post suggestions with rich animations
 * @module app/dashboard/swipe/page
 */

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  IconX,
  IconHeart,
  IconPencil,
  IconMoodEmpty,
  IconRefresh,
  IconFilter,
  IconChartBar,
  IconAlertCircle,
  IconInfoCircle,
  IconSparkles,
} from "@tabler/icons-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SwipeCard, SwipeCardStack, SwipeCardEmpty, type SwipeCardData } from "@/components/features/swipe-card"
import { SiteHeader } from "@/components/site-header"
import { SwipeSkeleton } from "@/components/skeletons/page-skeletons"
import { useSwipeSuggestions } from "@/hooks/use-swipe-suggestions"
import { useSwipeActions } from "@/hooks/use-swipe-actions"
import { useAuthContext } from "@/lib/auth/auth-provider"
import { useDraft } from "@/lib/store/draft-context"
import { swipeToast } from "@/lib/toast-utils"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  pageVariants,
  staggerContainerVariants,
  staggerItemVariants,
  fadeSlideUpVariants,
} from "@/lib/animations"
import type { PostSuggestion } from "@/components/features/swipe-interface"

/** Threshold in pixels for swipe to be considered a decision */
const SWIPE_THRESHOLD = 100

/**
 * Empty state when no more suggestions are available
 */
function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <motion.div
      className="flex h-[400px] w-full max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/30 via-muted/20 to-primary/5 p-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
      >
        <IconMoodEmpty className="size-12 text-muted-foreground/70" />
      </motion.div>
      <motion.h3
        className="mb-2 text-lg font-semibold"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        No more suggestions
      </motion.h3>
      <motion.p
        className="mb-4 text-sm text-muted-foreground max-w-[280px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        You've reviewed all available suggestions. Check back later for fresh AI-generated post ideas.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button onClick={onRefresh} variant="outline" className="gap-2 border-primary/30 hover:border-primary/50">
          <IconRefresh className="size-4" />
          Refresh Suggestions
        </Button>
      </motion.div>
    </motion.div>
  )
}

/**
 * Stats card showing swipe session progress
 */
function SwipeStatsCard({
  sessionStats,
  captureRate,
  suggestionsShown,
}: {
  sessionStats: { likes: number; dislikes: number; total: number; likeRate: number }
  captureRate: number
  suggestionsShown: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="w-full max-w-md overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 400 }}
            >
              <IconChartBar className="size-4 text-primary" />
            </motion.div>
            Session Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capture Rate</span>
            <motion.span
              className="font-medium tabular-nums"
              key={captureRate}
              initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
              animate={{ scale: 1, color: "hsl(var(--foreground))" }}
              transition={{ duration: 0.3 }}
            >
              {captureRate}%
            </motion.span>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
          >
            <Progress value={captureRate} className="h-2" />
          </motion.div>

          <motion.div
            className="grid grid-cols-3 gap-2 pt-2"
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
          >
            <motion.div className="text-center" variants={staggerItemVariants}>
              <motion.div
                className="text-lg font-bold text-green-600 dark:text-green-400 tabular-nums"
                key={sessionStats.likes}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {sessionStats.likes}
              </motion.div>
              <div className="text-xs text-muted-foreground">Liked</div>
            </motion.div>
            <motion.div className="text-center" variants={staggerItemVariants}>
              <motion.div
                className="text-lg font-bold text-red-600 dark:text-red-400 tabular-nums"
                key={sessionStats.dislikes}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {sessionStats.dislikes}
              </motion.div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </motion.div>
            <motion.div className="text-center" variants={staggerItemVariants}>
              <motion.div
                className="text-lg font-bold tabular-nums"
                key={suggestionsShown}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {suggestionsShown}
              </motion.div>
              <div className="text-xs text-muted-foreground">Shown</div>
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {sessionStats.total >= 5 && (
              <motion.div
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-muted/50 to-primary/5 p-2 text-xs border border-border/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <IconInfoCircle className="size-4 text-primary shrink-0" />
                <span className="text-muted-foreground">
                  {sessionStats.likeRate >= 50
                    ? "You're finding lots of content you like!"
                    : "Keep swiping to find content that matches your style."}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/**
 * Main swipe interface content
 */
function SwipeContent() {
  const router = useRouter()
  const { loadForRemix } = useDraft()

  // Suggestion management
  const {
    remainingSuggestions,
    isLoading: suggestionsLoading,
    error: suggestionsError,
    refetch,
    markAsSeen,
    categories,
    filters,
    setFilters,
  } = useSwipeSuggestions()

  // Swipe action recording
  const {
    recordSwipe,
    sessionStats,
    captureRate,
    suggestionsShown,
    incrementShown,
  } = useSwipeActions()

  // Local UI state
  const [swipeOffset, setSwipeOffset] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = React.useState(false)
  const [exitDirection, setExitDirection] = React.useState<"left" | "right" | null>(null)

  // Refs for drag handling
  const containerRef = React.useRef<HTMLDivElement>(null)
  const startXRef = React.useRef(0)

  // Current card is the first in remaining suggestions
  const currentCard = remainingSuggestions.length > 0 ? remainingSuggestions[0] : null

  // Track when a new card is shown
  React.useEffect(() => {
    if (currentCard && !isAnimatingOut) {
      incrementShown()
    }
  }, [currentCard?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handles the swipe action
   */
  const handleSwipe = React.useCallback(
    async (direction: "left" | "right") => {
      if (!currentCard || isAnimatingOut) return

      // Trigger exit animation
      setIsAnimatingOut(true)
      setExitDirection(direction)

      // Record the swipe
      const action = direction === "right" ? "like" : "dislike"
      await recordSwipe(currentCard.id, action, currentCard.content)

      // Mark as seen after animation
      setTimeout(() => {
        markAsSeen(currentCard.id)
        setSwipeOffset(0)
        setIsAnimatingOut(false)
        setExitDirection(null)

        // Show toast for feedback
        if (direction === "right") {
          swipeToast.liked()
        } else {
          swipeToast.skipped()
        }
      }, 300)
    },
    [currentCard, isAnimatingOut, recordSwipe, markAsSeen]
  )

  /**
   * Handle Edit & Post action
   */
  const handleEditAndPost = React.useCallback(() => {
    if (!currentCard) return

    // Record as a like
    recordSwipe(currentCard.id, "like", currentCard.content)
    markAsSeen(currentCard.id)

    // Load into composer
    loadForRemix(currentCard.id, currentCard.content, "AI Suggestion")

    // Show toast and navigate
    swipeToast.editAndPost()
    router.push("/dashboard/compose")
  }, [currentCard, recordSwipe, markAsSeen, loadForRemix, router])

  // Drag handlers
  const handleDragStart = React.useCallback(
    (clientX: number) => {
      if (isAnimatingOut) return
      setIsDragging(true)
      startXRef.current = clientX
    },
    [isAnimatingOut]
  )

  const handleDragMove = React.useCallback(
    (clientX: number) => {
      if (!isDragging) return
      const deltaX = clientX - startXRef.current
      setSwipeOffset(deltaX)
    },
    [isDragging]
  )

  const handleDragEnd = React.useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    if (Math.abs(swipeOffset) > SWIPE_THRESHOLD) {
      handleSwipe(swipeOffset > 0 ? "right" : "left")
    } else {
      setSwipeOffset(0)
    }
  }, [isDragging, swipeOffset, handleSwipe])

  // Mouse event handlers
  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX)
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX)
  const onMouseUp = () => handleDragEnd()
  const onMouseLeave = () => {
    if (isDragging) handleDragEnd()
  }

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX)
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX)
  const onTouchEnd = () => handleDragEnd()

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        handleSwipe("left")
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        handleSwipe("right")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSwipe])

  // Transform PostSuggestion to SwipeCardData
  const cardData: SwipeCardData[] = remainingSuggestions.map(s => ({
    id: s.id,
    content: s.content,
    category: s.category,
    estimatedEngagement: s.estimatedEngagement,
  }))

  // Error state
  if (suggestionsError) {
    return (
      <motion.div
        className="flex flex-col items-center gap-6 p-4 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full max-w-md border-destructive/50 bg-gradient-to-br from-destructive/5 to-destructive/10">
          <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
            >
              <IconAlertCircle className="size-12 text-destructive" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-semibold">Failed to Load Suggestions</h3>
              <p className="text-sm text-muted-foreground">{suggestionsError}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="outline" onClick={refetch} className="gap-2 border-destructive/30 hover:border-destructive/50">
                <IconRefresh className="size-4" />
                Try Again
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Loading state
  if (suggestionsLoading) {
    return <SwipeSkeleton />
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-6 p-4 md:p-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Category Filter */}
      <motion.div
        className="flex w-full max-w-md items-center justify-between gap-4"
        variants={fadeSlideUpVariants}
      >
        <div className="flex items-center gap-2">
          <IconFilter className="size-4 text-muted-foreground" />
          <Select
            value={filters.category || "all"}
            onValueChange={(value) => setFilters({ category: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Badge variant="outline" className="shrink-0 border-primary/30">
          <IconSparkles className="size-3 mr-1 text-primary" />
          {remainingSuggestions.length} remaining
        </Badge>
      </motion.div>

      {/* Card Stack */}
      {currentCard ? (
        <div
          ref={containerRef}
          className="relative h-[400px] w-full max-w-md select-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <SwipeCardStack
            cards={cardData}
            topCardOffset={swipeOffset}
            isDragging={isDragging}
            isExiting={isAnimatingOut}
            exitDirection={exitDirection}
          />
        </div>
      ) : (
        <EmptyState onRefresh={refetch} />
      )}

      {/* Action Buttons */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-full border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950 shadow-sm transition-all duration-200"
            onClick={() => handleSwipe("left")}
            disabled={isAnimatingOut || !currentCard}
            aria-label="Skip suggestion"
          >
            <IconX className="size-6" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-full border-green-200 text-green-500 hover:border-green-300 hover:bg-green-50 hover:text-green-600 dark:border-green-800 dark:hover:border-green-700 dark:hover:bg-green-950 shadow-sm transition-all duration-200"
            onClick={() => handleSwipe("right")}
            disabled={isAnimatingOut || !currentCard}
            aria-label="Like suggestion"
          >
            <IconHeart className="size-6" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="default"
            className="rounded-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
            onClick={handleEditAndPost}
            disabled={isAnimatingOut || !currentCard}
          >
            <IconPencil className="size-4" />
            Edit & Post
          </Button>
        </motion.div>
      </motion.div>

      {/* Keyboard Hint */}
      <motion.p
        className="text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Use <kbd className="rounded border border-primary/20 bg-muted px-1.5 py-0.5 font-mono text-[10px]">←</kbd>{" "}
        <kbd className="rounded border border-primary/20 bg-muted px-1.5 py-0.5 font-mono text-[10px]">→</kbd> arrow
        keys to swipe
      </motion.p>

      {/* Session Stats */}
      <SwipeStatsCard
        sessionStats={sessionStats}
        captureRate={captureRate}
        suggestionsShown={suggestionsShown}
      />
    </motion.div>
  )
}

/**
 * Swipe page component
 * @returns Swipe page with Tinder-style interface for reviewing AI suggestions
 */
export default function SwipePage() {
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
        <SiteHeader title="Swipe" />
        <main id="main-content" className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col items-center gap-2">
            {authLoading ? <SwipeSkeleton /> : <SwipeContent />}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
