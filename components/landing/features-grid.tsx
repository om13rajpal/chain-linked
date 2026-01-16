"use client"

/**
 * Features Grid Component
 * @description Grid of feature cards for the landing page
 * @module components/landing/features-grid
 */

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  IconChartBar,
  IconCalendarEvent,
  IconTemplate,
  IconBulb,
  IconUsers,
  IconCarouselHorizontal,
  IconTarget,
  IconRocket,
} from '@tabler/icons-react'
import {
  staggerContainerVariants,
  staggerItemVariants,
  cardHoverProps,
  viewportConfig,
} from '@/lib/animations'

/**
 * Feature data type
 */
interface Feature {
  icon: React.ElementType
  title: string
  description: string
  color: 'primary' | 'secondary' | 'accent'
}

/**
 * Feature items
 */
const features: Feature[] = [
  {
    icon: IconChartBar,
    title: 'Advanced Analytics',
    description:
      'Track impressions, engagement rates, follower growth, and more with beautiful visualizations and actionable insights.',
    color: 'primary',
  },
  {
    icon: IconCalendarEvent,
    title: 'Smart Scheduling',
    description:
      'Plan your content calendar, schedule posts at optimal times, and never miss a day with automated publishing.',
    color: 'secondary',
  },
  {
    icon: IconTemplate,
    title: 'Template Library',
    description:
      'Access proven post templates, customize them to your brand, and save your own for consistent content creation.',
    color: 'primary',
  },
  {
    icon: IconBulb,
    title: 'Content Inspiration',
    description:
      'Discover viral posts in your niche, swipe through AI-powered suggestions, and never run out of ideas.',
    color: 'secondary',
  },
  {
    icon: IconUsers,
    title: 'Team Collaboration',
    description:
      'Work together seamlessly with shared calendars, team analytics, activity feeds, and performance leaderboards.',
    color: 'primary',
  },
  {
    icon: IconCarouselHorizontal,
    title: 'Carousel Creator',
    description:
      'Design stunning LinkedIn carousels with our drag-and-drop editor and export as ready-to-upload PDFs.',
    color: 'secondary',
  },
]

/**
 * Color classes mapping
 */
const colorClasses = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'group-hover:border-primary/30',
    glow: 'group-hover:shadow-primary/10',
  },
  secondary: {
    bg: 'bg-secondary/10',
    text: 'text-secondary',
    border: 'group-hover:border-secondary/30',
    glow: 'group-hover:shadow-secondary/10',
  },
  accent: {
    bg: 'bg-accent',
    text: 'text-accent-foreground',
    border: 'group-hover:border-accent/30',
    glow: 'group-hover:shadow-accent/10',
  },
}

/**
 * Single feature card component
 */
function FeatureCard({ feature }: { feature: Feature }) {
  const colors = colorClasses[feature.color]
  const Icon = feature.icon

  return (
    <motion.div
      className="group relative"
      variants={staggerItemVariants}
      {...cardHoverProps}
    >
      <div
        className={`relative h-full rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 ${colors.border} ${colors.glow} hover:shadow-lg`}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Content */}
        <div className="relative">
          {/* Icon */}
          <div className={`inline-flex rounded-xl ${colors.bg} p-3`}>
            <Icon className={`size-6 ${colors.text}`} />
          </div>

          {/* Title */}
          <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>

          {/* Description */}
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Features grid section
 */
export function FeaturesGrid() {
  const [ref, inView] = useInView(viewportConfig)

  return (
    <section
      id="features"
      className="relative overflow-hidden py-20 sm:py-28"
    >
      {/* Background decorations */}
      <div className="absolute left-1/2 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container relative mx-auto px-4">
        {/* Section header */}
        <motion.div
          ref={ref}
          className="mx-auto max-w-2xl text-center"
          variants={staggerContainerVariants}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
        >
          <motion.span
            className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary"
            variants={staggerItemVariants}
          >
            <IconRocket className="size-4" />
            Powerful Features
          </motion.span>

          <motion.h2
            className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl"
            variants={staggerItemVariants}
          >
            Everything you need to{' '}
            <span className="text-gradient-primary">dominate LinkedIn</span>
          </motion.h2>

          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            variants={staggerItemVariants}
          >
            From analytics to automation, ChainLinked gives you all the tools to
            grow your presence and engage your audience effectively.
          </motion.p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainerVariants}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>

        {/* Bottom stats */}
        <motion.div
          className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
          variants={staggerContainerVariants}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
        >
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '50M+', label: 'Posts Analyzed' },
            { value: '99.9%', label: 'Uptime' },
            { value: '4.9/5', label: 'User Rating' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="rounded-xl border border-border/50 bg-card/50 p-4 text-center"
              variants={staggerItemVariants}
            >
              <p className="text-2xl font-bold text-gradient-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
