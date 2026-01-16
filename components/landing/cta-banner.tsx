"use client"

/**
 * CTA Banner Component
 * @description Final call-to-action banner for the landing page
 * @module components/landing/cta-banner
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { Button } from '@/components/ui/button'
import { IconArrowRight, IconSparkles } from '@tabler/icons-react'
import {
  fadeSlideUpVariants,
  buttonHoverProps,
  viewportConfig,
} from '@/lib/animations'

/**
 * CTA banner with gradient background
 */
export function CTABanner() {
  const [ref, inView] = useInView(viewportConfig)

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="container relative mx-auto px-4">
        <motion.div
          ref={ref}
          className="relative overflow-hidden rounded-3xl"
          variants={fadeSlideUpVariants}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />

          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-white/10 blur-3xl" />

          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Content */}
          <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
              <IconSparkles className="size-4" />
              Start Free Today
            </span>

            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to transform your
              <br />
              LinkedIn presence?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Join thousands of professionals and teams who are already growing
              their influence with ChainLinked. No credit card required.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.div {...buttonHoverProps}>
                <Button
                  asChild
                  size="lg"
                  className="h-12 gap-2 bg-white px-8 text-base text-primary hover:bg-white/90"
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
                  className="h-12 border-white/30 bg-transparent px-8 text-base text-white hover:bg-white/10"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </motion.div>
            </div>

            <p className="mt-6 text-sm text-white/60">
              Free 14-day trial • No credit card • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
