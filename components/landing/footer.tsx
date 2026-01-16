"use client"

/**
 * Footer Component
 * @description Site footer with navigation links and social links
 * @module components/landing/footer
 */

import Link from 'next/link'
import {
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandGithub,
  IconLink,
} from '@tabler/icons-react'

/**
 * Footer navigation links
 */
const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#changelog' },
    { label: 'Roadmap', href: '#roadmap' },
  ],
  company: [
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Help Center', href: '/help' },
    { label: 'API Reference', href: '/api' },
    { label: 'Status', href: '/status' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
  ],
}

/**
 * Social links
 */
const socialLinks = [
  { icon: IconBrandTwitter, href: 'https://twitter.com/chainlinked', label: 'Twitter' },
  { icon: IconBrandLinkedin, href: 'https://linkedin.com/company/chainlinked', label: 'LinkedIn' },
  { icon: IconBrandGithub, href: 'https://github.com/chainlinked', label: 'GitHub' },
]

/**
 * Footer section
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-1.5">
                <IconLink className="size-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ChainLinked</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The all-in-one LinkedIn content management platform for professionals and teams.
            </p>
            {/* Social links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    aria-label={social.label}
                  >
                    <Icon className="size-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold">Product</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h4 className="font-semibold">Resources</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold">Legal</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ChainLinked. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for LinkedIn creators
          </p>
        </div>
      </div>
    </footer>
  )
}
