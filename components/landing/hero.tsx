"use client"

/**
 * Hero Section Component
 * @description Main hero section for the landing page with animated elements
 * @module components/landing/hero
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  IconArrowRight,
  IconPlayerPlay,
  IconSparkles,
  IconTrendingUp,
  IconUsers,
  IconBrandLinkedin,
} from '@tabler/icons-react'
import {
  fadeSlideUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  floatVariants,
  buttonHoverProps,
} from '@/lib/animations'

/**
 * Floating stat badge component
 */
function StatBadge({
  icon: Icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  value: string
  delay?: number
}) {
  return (
    <motion.div
      className="absolute glass rounded-xl border border-border/50 px-4 py-3 shadow-lg"
      variants={floatVariants}
      initial="initial"
      animate="animate"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Hero section with animated heading, CTA buttons, and dashboard preview
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      {/* Decorative circles */}
      <div className="absolute -left-20 -top-20 size-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-20 top-40 size-80 rounded-full bg-secondary/5 blur-3xl" />

      <div className="container relative mx-auto px-4 py-20 sm:py-28 lg:py-36">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={staggerItemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <IconSparkles className="size-4" />
              LinkedIn Content Management for Teams
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            variants={staggerItemVariants}
          >
            Supercharge Your{' '}
            <span className="text-gradient-primary">LinkedIn</span>{' '}
            Content Strategy
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="mt-6 text-lg text-muted-foreground sm:text-xl"
            variants={staggerItemVariants}
          >
            Schedule posts, analyze performance, and collaborate with your team.
            All in one powerful platform designed for LinkedIn success.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            variants={staggerItemVariants}
          >
            <motion.div {...buttonHoverProps}>
              <Button
                asChild
                size="lg"
                className="h-12 gap-2 bg-gradient-primary px-8 text-base shadow-primary hover:shadow-lg"
              >
                <Link href="/signup">
                  Get Started Free
                  <IconArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div {...buttonHoverProps}>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 gap-2 px-8 text-base"
              >
                <Link href="#demo">
                  <IconPlayerPlay className="size-4" />
                  Watch Demo
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
            variants={staggerItemVariants}
          >
            <div className="flex items-center gap-2">
              <IconUsers className="size-5 text-primary" />
              <span>2,500+ Teams</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-2">
              <IconTrendingUp className="size-5 text-secondary" />
              <span>3x Engagement</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-2">
              <IconBrandLinkedin className="size-5 text-[#0A66C2]" />
              <span>1M+ Posts</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          className="relative mt-16 sm:mt-20 lg:mt-24"
          variants={fadeSlideUpVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          {/* Floating badges */}
          <div className="hidden lg:block">
            <StatBadge
              icon={IconTrendingUp}
              label="Impressions"
              value="+127%"
              delay={0}
            />
            <div className="absolute right-0 top-20">
              <StatBadge
                icon={IconUsers}
                label="Followers"
                value="+2,847"
                delay={0.5}
              />
            </div>
          </div>

          {/* Main preview container */}
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effect behind */}
            <div className="absolute inset-0 -z-10 translate-y-8 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl" />

            {/* Dashboard mockup */}
            <div className="rounded-2xl border border-border/50 bg-card/80 p-2 shadow-2xl backdrop-blur-sm">
              <div className="rounded-xl bg-muted/50 p-1">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-destructive/60" />
                    <div className="size-3 rounded-full bg-warning/60" />
                    <div className="size-3 rounded-full bg-success/60" />
                  </div>
                  <div className="ml-4 flex-1 rounded-md bg-background/50 px-4 py-1.5 text-xs text-muted-foreground">
                    app.chainlinked.com/dashboard
                  </div>
                </div>

                {/* Dashboard content preview */}
                <div className="aspect-[16/9] overflow-hidden rounded-b-xl bg-background p-6">
                  {/* Simplified dashboard preview */}
                  <div className="grid grid-cols-4 gap-4">
                    {/* Sidebar placeholder */}
                    <div className="space-y-3">
                      <div className="h-8 w-full rounded-lg bg-primary/10" />
                      <div className="h-6 w-3/4 rounded bg-muted" />
                      <div className="h-6 w-full rounded bg-muted" />
                      <div className="h-6 w-5/6 rounded bg-muted" />
                      <div className="h-6 w-full rounded bg-accent" />
                    </div>

                    {/* Main content */}
                    <div className="col-span-3 space-y-4">
                      {/* Stats row */}
                      <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-border/50 bg-card p-3"
                          >
                            <div className="h-3 w-1/2 rounded bg-muted" />
                            <div className="mt-2 h-6 w-3/4 rounded bg-primary/20" />
                            <div className="mt-1 h-2 w-1/3 rounded bg-success/30" />
                          </div>
                        ))}
                      </div>

                      {/* Chart placeholder */}
                      <div className="rounded-lg border border-border/50 bg-card p-4">
                        <div className="h-4 w-1/4 rounded bg-muted" />
                        <div className="mt-4 flex h-32 items-end gap-2">
                          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map(
                            (height, i) => (
                              <div
                                key={i}
                                className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary/10"
                                style={{ height: `${height}%` }}
                              />
                            )
                          )}
                        </div>
                      </div>

                      {/* Activity feed placeholder */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-border/50 bg-card p-3">
                          <div className="h-3 w-1/3 rounded bg-muted" />
                          <div className="mt-3 space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-secondary/20" />
                                <div className="h-3 flex-1 rounded bg-muted" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-card p-3">
                          <div className="h-3 w-1/3 rounded bg-muted" />
                          <div className="mt-3 space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-primary/20" />
                                <div className="h-3 flex-1 rounded bg-muted" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
