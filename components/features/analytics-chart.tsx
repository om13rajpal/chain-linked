"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/**
 * Data point for LinkedIn analytics chart
 */
interface AnalyticsDataPoint {
  /** Date string in ISO format (YYYY-MM-DD) */
  date: string
  /** Number of impressions for this date */
  impressions: number
  /** Number of engagements for this date */
  engagements: number
}

/**
 * Props for the AnalyticsChart component
 */
export interface AnalyticsChartProps {
  /**
   * Analytics data array containing date, impressions, and engagements.
   * If not provided, sample data will be generated for demo purposes.
   */
  data?: AnalyticsDataPoint[]
}

/**
 * Available time range options for filtering chart data
 */
type TimeRange = "7d" | "30d" | "90d"

/**
 * Chart configuration for Recharts styling
 */
const chartConfig = {
  impressions: {
    label: "Impressions",
    color: "hsl(var(--primary))",
  },
  engagements: {
    label: "Engagements",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

/**
 * Generates sample analytics data for demonstration purposes.
 * Creates 90 days of data with realistic impression and engagement patterns.
 *
 * @returns Array of analytics data points spanning 90 days
 */
function generateSampleData(): AnalyticsDataPoint[] {
  const data: AnalyticsDataPoint[] = []
  const today = new Date()

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Generate realistic-looking data with some variation
    // Weekdays tend to have higher engagement
    const dayOfWeek = date.getDay()
    const isWeekday = dayOfWeek > 0 && dayOfWeek < 6
    const baseMultiplier = isWeekday ? 1.2 : 0.8

    // Add some randomness and trending growth
    const trendFactor = 1 + (90 - i) * 0.005 // Slight upward trend
    const randomFactor = 0.7 + Math.random() * 0.6 // Random variation

    const impressions = Math.round(
      1000 * baseMultiplier * trendFactor * randomFactor
    )
    // Engagement rate typically 2-8% of impressions
    const engagementRate = 0.02 + Math.random() * 0.06
    const engagements = Math.round(impressions * engagementRate)

    data.push({
      date: date.toISOString().split("T")[0],
      impressions,
      engagements,
    })
  }

  return data
}

/**
 * Filters data based on selected time range
 *
 * @param data - Full analytics data array
 * @param timeRange - Selected time range (7d, 30d, or 90d)
 * @returns Filtered data array
 */
function filterDataByTimeRange(
  data: AnalyticsDataPoint[],
  timeRange: TimeRange
): AnalyticsDataPoint[] {
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
  return data.slice(-days)
}

/**
 * Formats a date string for display in tooltips
 *
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Formats a date for X-axis display
 *
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @param timeRange - Current time range selection
 * @returns Formatted date string appropriate for the time range
 */
function formatAxisDate(dateString: string, timeRange: TimeRange): string {
  const date = new Date(dateString)
  if (timeRange === "7d") {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/**
 * LinkedIn Analytics Chart Component
 *
 * Displays LinkedIn performance metrics (impressions and engagements) over time
 * using an interactive area chart. Features time range selection with responsive
 * design - toggle group on desktop and select dropdown on mobile.
 *
 * @example
 * ```tsx
 * // With custom data
 * <AnalyticsChart data={myAnalyticsData} />
 *
 * // With sample data (for demos)
 * <AnalyticsChart />
 * ```
 *
 * @param props - Component props
 * @returns React component
 */
export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("30d")

  // Use provided data or generate sample data
  const chartData = React.useMemo(() => {
    const sourceData = data ?? generateSampleData()
    return filterDataByTimeRange(sourceData, timeRange)
  }, [data, timeRange])

  // Calculate tick interval for X-axis based on time range
  const tickInterval = React.useMemo(() => {
    switch (timeRange) {
      case "7d":
        return 1 // Show every day
      case "30d":
        return 4 // Show roughly weekly
      case "90d":
        return 13 // Show roughly bi-weekly
      default:
        return 4
    }
  }, [timeRange])

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Track your LinkedIn impressions and engagement metrics
          </CardDescription>
        </div>
        <div className="flex items-center px-6 py-4">
          {/* Desktop: Toggle Group */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => {
              if (value) setTimeRange(value as TimeRange)
            }}
            variant="outline"
            className="hidden sm:flex"
          >
            <ToggleGroupItem value="7d" aria-label="Last 7 days">
              7D
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" aria-label="Last 30 days">
              30D
            </ToggleGroupItem>
            <ToggleGroupItem value="90d" aria-label="Last 90 days">
              90D
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Mobile: Select Dropdown */}
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger className="sm:hidden" aria-label="Select time range">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              {/* Gradient for Impressions */}
              <linearGradient id="fillImpressions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-impressions)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-impressions)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              {/* Gradient for Engagements */}
              <linearGradient id="fillEngagements" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-engagements)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-engagements)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              interval={tickInterval}
              tickFormatter={(value) => formatAxisDate(value, timeRange)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
              }
              width={48}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDate(value as string)}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="impressions"
              type="monotone"
              fill="url(#fillImpressions)"
              stroke="var(--color-impressions)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="engagements"
              type="monotone"
              fill="url(#fillEngagements)"
              stroke="var(--color-engagements)"
              strokeWidth={2}
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default AnalyticsChart
