"use client"

import * as React from "react"
import {
  IconFlame,
  IconPencil,
  IconCheck,
  IconX,
  IconTarget,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Represents a posting goal with period, target, and progress tracking
 */
export interface Goal {
  /** Unique identifier for the goal */
  id: string
  /** The time period for this goal */
  period: "daily" | "weekly" | "monthly"
  /** Target number of posts for the period */
  target: number
  /** Current number of posts completed */
  current: number
  /** Start date of the goal period (ISO string) */
  startDate: string
  /** End date of the goal period (ISO string) */
  endDate: string
}

/**
 * Props for the GoalsTracker component
 */
export interface GoalsTrackerProps {
  /** Array of goals to display and track */
  goals?: Goal[]
  /** Current posting streak in days */
  currentStreak?: number
  /** Best posting streak achieved in days */
  bestStreak?: number
  /** Callback when a goal target is updated */
  onUpdateGoal?: (goalId: string, target: number) => void
  /** Whether the component is in a loading state */
  isLoading?: boolean
}

/** Sample goals data for demonstration */
const SAMPLE_GOALS: Goal[] = [
  {
    id: "weekly-goal",
    period: "weekly",
    target: 5,
    current: 3,
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "monthly-goal",
    period: "monthly",
    target: 20,
    current: 12,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/** Default values for streak tracking */
const DEFAULT_CURRENT_STREAK = 7
const DEFAULT_BEST_STREAK = 14

/**
 * Returns a human-readable label for the goal period
 * @param period - The period type (daily, weekly, monthly)
 * @returns Formatted period label
 */
function getPeriodLabel(period: Goal["period"]): string {
  switch (period) {
    case "daily":
      return "Today"
    case "weekly":
      return "This Week"
    case "monthly":
      return "This Month"
    default:
      return period
  }
}

/**
 * Calculates the progress percentage for a goal
 * @param current - Current progress value
 * @param target - Target value
 * @returns Progress percentage (0-100)
 */
function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

/**
 * Determines the status of a goal based on progress and time remaining
 * @param goal - The goal to evaluate
 * @returns Object with status type, message, and variant for styling
 */
function getGoalStatus(goal: Goal): {
  type: "on-track" | "behind" | "reached" | "at-risk"
  message: string
  variant: "default" | "secondary" | "destructive" | "outline"
  Icon: typeof IconTrendingUp
} {
  const progress = calculateProgress(goal.current, goal.target)
  const now = new Date()
  const endDate = new Date(goal.endDate)
  const startDate = new Date(goal.startDate)

  // Calculate time progress
  const totalDuration = endDate.getTime() - startDate.getTime()
  const elapsed = now.getTime() - startDate.getTime()
  const timeProgress = Math.min((elapsed / totalDuration) * 100, 100)

  // Goal reached
  if (goal.current >= goal.target) {
    return {
      type: "reached",
      message: "Goal reached!",
      variant: "default",
      Icon: IconCheck,
    }
  }

  // Ahead of schedule (progress > time elapsed)
  if (progress >= timeProgress) {
    return {
      type: "on-track",
      message: "On track",
      variant: "secondary",
      Icon: IconTrendingUp,
    }
  }

  // Significantly behind (less than half expected progress)
  if (progress < timeProgress * 0.5) {
    return {
      type: "behind",
      message: "Falling behind",
      variant: "destructive",
      Icon: IconTrendingDown,
    }
  }

  // Slightly behind
  return {
    type: "at-risk",
    message: "At risk",
    variant: "outline",
    Icon: IconMinus,
  }
}

/**
 * Custom progress bar component with visual percentage indicator
 */
function ProgressBar({
  value,
  className,
  indicatorClassName,
}: {
  value: number
  className?: string
  indicatorClassName?: string
}) {
  return (
    <div
      className={cn(
        "bg-secondary relative h-2.5 w-full overflow-hidden rounded-full",
        className
      )}
    >
      <div
        className={cn(
          "bg-primary h-full transition-all duration-500 ease-out",
          indicatorClassName
        )}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
}

/**
 * Individual goal card component with progress tracking and editing
 */
function GoalCard({
  goal,
  onUpdateGoal,
}: {
  goal: Goal
  onUpdateGoal?: (goalId: string, target: number) => void
}) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(goal.target.toString())

  const progress = calculateProgress(goal.current, goal.target)
  const status = getGoalStatus(goal)

  const handleSave = () => {
    const newTarget = parseInt(editValue, 10)
    if (!isNaN(newTarget) && newTarget > 0) {
      onUpdateGoal?.(goal.id, newTarget)
    } else {
      setEditValue(goal.target.toString())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(goal.target.toString())
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  return (
    <div className="bg-muted/50 space-y-3 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconTarget className="text-muted-foreground size-4" />
          <span className="text-sm font-medium">{getPeriodLabel(goal.period)}</span>
        </div>
        <Badge variant={status.variant} className="gap-1">
          <status.Icon className="size-3" />
          {status.message}
        </Badge>
      </div>

      <ProgressBar
        value={progress}
        indicatorClassName={cn(
          status.type === "reached" && "bg-green-500",
          status.type === "behind" && "bg-destructive",
          status.type === "at-risk" && "bg-yellow-500"
        )}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold tabular-nums">{goal.current}</span>
          <span className="text-muted-foreground text-sm">/</span>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={1}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-7 w-16 text-sm"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleSave}
                className="h-6 w-6"
              >
                <IconCheck className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCancel}
                className="h-6 w-6"
              >
                <IconX className="size-3" />
              </Button>
            </div>
          ) : (
            <>
              <span className="text-lg font-semibold tabular-nums">{goal.target}</span>
              <span className="text-muted-foreground text-sm">posts</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm tabular-nums">
            {progress}%
          </span>
          {!isEditing && onUpdateGoal && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6"
            >
              <IconPencil className="size-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Streak display component with fire icon and best streak comparison
 */
function StreakSection({
  currentStreak,
  bestStreak,
}: {
  currentStreak: number
  bestStreak: number
}) {
  const isNewBest = currentStreak >= bestStreak && currentStreak > 0

  return (
    <div className="bg-muted/50 flex items-center justify-between rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            currentStreak > 0
              ? "bg-orange-500/10 text-orange-500"
              : "bg-muted text-muted-foreground"
          )}
        >
          <IconFlame className="size-5" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums">{currentStreak}</span>
            <span className="text-muted-foreground text-sm">
              {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>
          <p className="text-muted-foreground text-xs">Current Streak</p>
        </div>
      </div>

      <div className="text-right">
        {isNewBest && currentStreak > 0 ? (
          <Badge variant="default" className="gap-1">
            <IconTrendingUp className="size-3" />
            New best!
          </Badge>
        ) : (
          <div className="text-muted-foreground text-sm">
            Best: <span className="font-medium tabular-nums">{bestStreak}</span> days
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Loading skeleton for the goals tracker
 */
function GoalsTrackerSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Goal card skeletons */}
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3 rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-2.5 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        ))}
        {/* Streak skeleton */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * GoalsTracker component for tracking posting goals with visual progress indicators.
 *
 * Displays posting goals for different time periods (daily, weekly, monthly) with:
 * - Progress bars showing completion percentage
 * - Status badges indicating if user is on track, behind, or has reached their goal
 * - Editable target values for customizing goals
 * - Streak tracking with current and best streak display
 *
 * @example
 * ```tsx
 * // With default sample data
 * <GoalsTracker />
 *
 * // With custom goals and handlers
 * <GoalsTracker
 *   goals={[
 *     { id: "1", period: "weekly", target: 5, current: 3, startDate: "...", endDate: "..." }
 *   ]}
 *   currentStreak={10}
 *   bestStreak={15}
 *   onUpdateGoal={(id, target) => console.log(`Goal ${id} updated to ${target}`)}
 * />
 *
 * // Loading state
 * <GoalsTracker isLoading />
 * ```
 */
export function GoalsTracker({
  goals = SAMPLE_GOALS,
  currentStreak = DEFAULT_CURRENT_STREAK,
  bestStreak = DEFAULT_BEST_STREAK,
  onUpdateGoal,
  isLoading = false,
}: GoalsTrackerProps) {
  if (isLoading) {
    return <GoalsTrackerSkeleton />
  }

  // Sort goals by period priority (daily > weekly > monthly)
  const sortedGoals = [...goals].sort((a, b) => {
    const priority = { daily: 0, weekly: 1, monthly: 2 }
    return priority[a.period] - priority[b.period]
  })

  // Calculate overall progress summary
  const totalCurrent = goals.reduce((sum, g) => sum + g.current, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0)
  const overallProgress = calculateProgress(totalCurrent, totalTarget)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTarget className="size-5" />
          Posting Goals
        </CardTitle>
        <CardDescription>
          Track your content creation progress across different time periods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall progress summary */}
        {goals.length > 0 && (
          <div className="bg-primary/5 space-y-2 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium tabular-nums">{overallProgress}%</span>
            </div>
            <ProgressBar value={overallProgress} className="h-1.5" />
          </div>
        )}

        {/* Individual goal cards */}
        {sortedGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} onUpdateGoal={onUpdateGoal} />
        ))}

        {/* Empty state */}
        {goals.length === 0 && (
          <div className="text-muted-foreground py-8 text-center text-sm">
            No goals set. Create a goal to start tracking your progress.
          </div>
        )}

        {/* Streak section */}
        <StreakSection currentStreak={currentStreak} bestStreak={bestStreak} />
      </CardContent>
    </Card>
  )
}
