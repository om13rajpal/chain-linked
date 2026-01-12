"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"

/**
 * Global providers wrapper component.
 * Includes theme provider and toast notifications.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={4000}
      />
    </ThemeProvider>
  )
}
