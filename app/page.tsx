/**
 * Landing Page
 * @description Main landing page for ChainLinked - LinkedIn content management platform
 * @module app/page
 */

import { Hero } from '@/components/landing/hero'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { AboutSection } from '@/components/landing/about-section'
import { CTABanner } from '@/components/landing/cta-banner'
import { Footer } from '@/components/landing/footer'
import { Navbar } from '@/components/landing/navbar'

/**
 * Landing page component
 * @returns Landing page with hero, features, about, CTA, and footer sections
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Main content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Features Grid */}
        <FeaturesGrid />

        {/* About Section */}
        <AboutSection />

        {/* CTA Banner */}
        <CTABanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
