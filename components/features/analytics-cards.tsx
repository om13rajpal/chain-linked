"use client"

import {
  IconEye,
  IconThumbUp,
  IconUser,
  IconUserPlus,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/**
 * Metric data structure for analytics cards
 */
interface MetricData {
  /** The numeric value to display */
  value: number
  /** The percentage change (positive or negative) */
  change: number
}

/**
 * Props for the AnalyticsCards component
 */
export interface AnalyticsCardsProps {
  /** Total impressions metric with value and percentage change */
  impressions?: MetricData
  /** Engagement rate metric with percentage value and change */
  engagementRate?: MetricData
  /** New followers metric with count and percentage change */
  followers?: MetricData
  /** Profile views metric with count and percentage change */
  profileViews?: MetricData
}

/** Default demo values for the analytics cards */
const DEFAULT_METRICS: Required<AnalyticsCardsProps> = {
  impressions: { value: 125420, change: 12.5 },
  engagementRate: { value: 4.8, change: 0.6 },
  followers: { value: 847, change: 8.2 },
  profileViews: { value: 3254, change: -3.4 },
}

/**
 * Formats a number with thousands separators using Intl.NumberFormat
 * @param value - The number to format
 * @returns Formatted string with locale-appropriate separators
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

/**
 * Formats a percentage value with sign indicator
 * @param value - The percentage value
 * @returns Formatted percentage string with + or - prefix
 */
function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Determines the trend direction based on the change value
 * @param change - The percentage change value
 * @returns Object with isPositive boolean and appropriate icon
 */
function getTrend(change: number) {
  const isPositive = change >= 0
  return {
    isPositive,
    Icon: isPositive ? IconTrendingUp : IconTrendingDown,
  }
}

/**
 * Analytics cards component displaying LinkedIn-specific metrics.
 *
 * Displays four key LinkedIn analytics metrics in a responsive grid:
 * - Total Impressions: How many times your content was viewed
 * - Engagement Rate: Percentage of interactions vs impressions
 * - New Followers: Number of new profile followers
 * - Profile Views: Number of profile visits
 *
 * Each card shows the metric value, a trend badge with percentage change,
 * and a footer with trend context.
 *
 * @example
 * ```tsx
 * // With default demo values
 * <AnalyticsCards />
 *
 * // With custom data
 * <AnalyticsCards
 *   impressions={{ value: 50000, change: 15.2 }}
 *   engagementRate={{ value: 5.5, change: 1.2 }}
 *   followers={{ value: 200, change: -5.0 }}
 *   profileViews={{ value: 1500, change: 10.0 }}
 * />
 * ```
 */
export function AnalyticsCards({
  impressions = DEFAULT_METRICS.impressions,
  engagementRate = DEFAULT_METRICS.engagementRate,
  followers = DEFAULT_METRICS.followers,
  profileViews = DEFAULT_METRICS.profileViews,
}: AnalyticsCardsProps) {
  const impressionsTrend = getTrend(impressions.change)
  const engagementTrend = getTrend(engagementRate.change)
  const followersTrend = getTrend(followers.change)
  const profileViewsTrend = getTrend(profileViews.change)

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Impressions Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Impressions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(impressions.value)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <impressionsTrend.Icon />
              {formatPercentage(impressions.change)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {impressionsTrend.isPositive ? (
              <>
                Content reach growing <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Content reach declining <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            <IconEye className="mr-1 inline size-3" />
            Views across all posts this period
          </div>
        </CardFooter>
      </Card>

      {/* Engagement Rate Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Engagement Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {engagementRate.value.toFixed(1)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <engagementTrend.Icon />
              {formatPercentage(engagementRate.change)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {engagementTrend.isPositive ? (
              <>
                Audience more engaged <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Engagement needs focus <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            <IconThumbUp className="mr-1 inline size-3" />
            Likes, comments, and shares
          </div>
        </CardFooter>
      </Card>

      {/* New Followers Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Followers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(followers.value)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <followersTrend.Icon />
              {formatPercentage(followers.change)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {followersTrend.isPositive ? (
              <>
                Network expanding <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Follower growth slowing <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            <IconUserPlus className="mr-1 inline size-3" />
            New connections this period
          </div>
        </CardFooter>
      </Card>

      {/* Profile Views Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Profile Views</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(profileViews.value)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <profileViewsTrend.Icon />
              {formatPercentage(profileViews.change)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {profileViewsTrend.isPositive ? (
              <>
                Profile visibility up <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Profile visibility down <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            <IconUser className="mr-1 inline size-3" />
            Unique visitors to your profile
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
