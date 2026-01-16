"use client"

/**
 * About Section Component
 * @description Company mission, values, and team information
 * @module components/landing/about-section
 */

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  IconHeart,
  IconShield,
  IconBolt,
  IconTarget,
  IconQuote,
} from '@tabler/icons-react'
import {
  staggerContainerVariants,
  staggerItemVariants,
  viewportConfig,
} from '@/lib/animations'

/**
 * Company values
 */
const values = [
  {
    icon: IconHeart,
    title: 'User-First',
    description:
      'Every feature we build starts with understanding what our users truly need.',
  },
  {
    icon: IconShield,
    title: 'Trust & Privacy',
    description:
      'Your data is yours. We never sell it and maintain the highest security standards.',
  },
  {
    icon: IconBolt,
    title: 'Innovation',
    description:
      'We continuously push boundaries to bring you cutting-edge content tools.',
  },
  {
    icon: IconTarget,
    title: 'Results-Driven',
    description:
      'Our success is measured by your growth. Your wins are our wins.',
  },
]

/**
 * Testimonials
 */
const testimonials = [
  {
    quote:
      'ChainLinked transformed how our marketing team collaborates on LinkedIn. Our engagement has tripled in just 3 months.',
    author: 'Sarah Chen',
    role: 'Marketing Director',
    company: 'TechFlow Inc.',
  },
  {
    quote:
      'The analytics alone are worth it. Finally, I can see exactly what content resonates with my audience.',
    author: 'Marcus Johnson',
    role: 'Founder',
    company: 'Growth Labs',
  },
  {
    quote:
      'Best investment for our sales team. The template library and scheduling features save us hours every week.',
    author: 'Emily Rodriguez',
    role: 'VP of Sales',
    company: 'SalesForce Pro',
  },
]

/**
 * About section with mission, values, and testimonials
 */
export function AboutSection() {
  const [ref, inView] = useInView(viewportConfig)

  return (
    <section id="about" className="relative overflow-hidden py-20 sm:py-28">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

      <div className="container relative mx-auto px-4">
        {/* Mission */}
        <motion.div
          ref={ref}
          className="mx-auto max-w-3xl text-center"
          variants={staggerContainerVariants}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
        >
          <motion.h2
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            variants={staggerItemVariants}
          >
            Our Mission
          </motion.h2>

          <motion.p
            className="mt-6 text-xl leading-relaxed text-muted-foreground"
            variants={staggerItemVariants}
          >
            We believe everyone deserves the tools to build their professional
            brand. ChainLinked empowers individuals and teams to create
            meaningful content, build authentic connections, and grow their
            influence on LinkedIn.
          </motion.p>
        </motion.div>

        {/* Values */}
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainerVariants}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
        >
          {values.map((value) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
                className="rounded-2xl border border-border/50 bg-card p-6 text-center"
                variants={staggerItemVariants}
              >
                <div className="mx-auto inline-flex rounded-xl bg-primary/10 p-3">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          className="mt-20"
          variants={staggerContainerVariants}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
        >
          <motion.h3
            className="text-center text-2xl font-bold"
            variants={staggerItemVariants}
          >
            Loved by teams everywhere
          </motion.h3>

          <motion.div
            className="mt-10 grid gap-6 md:grid-cols-3"
            variants={staggerContainerVariants}
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.author}
                className="relative rounded-2xl border border-border/50 bg-card p-6"
                variants={staggerItemVariants}
              >
                {/* Quote icon */}
                <IconQuote className="absolute right-4 top-4 size-8 text-primary/10" />

                {/* Quote */}
                <p className="relative text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Company logos */}
        <motion.div
          className="mt-16 text-center"
          variants={staggerItemVariants}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
        >
          <p className="text-sm text-muted-foreground">
            Trusted by teams at leading companies
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
            {['Google', 'Microsoft', 'Stripe', 'Notion', 'Figma', 'Vercel'].map(
              (company) => (
                <div
                  key={company}
                  className="text-lg font-semibold text-muted-foreground"
                >
                  {company}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
