/**
 * useRemix Hook
 * @description Hook for AI-powered post remix functionality
 * @module hooks/use-remix
 */

'use client'

import { useState, useCallback } from 'react'
import type { RemixTone } from '@/lib/ai/remix-prompts'

/**
 * Remix request parameters
 */
export interface RemixParams {
  /** Original post content to remix */
  content: string
  /** Desired tone for the remix */
  tone: RemixTone
  /** Optional custom instructions */
  instructions?: string
}

/**
 * Remix API response
 */
export interface RemixResult {
  /** Remixed content */
  remixedContent: string
  /** Original content (echoed back) */
  originalContent: string
  /** Tokens used in the request */
  tokensUsed: {
    prompt: number
    completion: number
    total: number
  }
  /** Model used for generation */
  model: string
}

/**
 * Remix error response
 */
export interface RemixError {
  /** Error message */
  message: string
  /** Error code for categorization */
  code: string
}

/**
 * Remix hook state
 */
export interface UseRemixState {
  /** Whether a remix is in progress */
  isLoading: boolean
  /** The remix result if successful */
  result: RemixResult | null
  /** Error if remix failed */
  error: RemixError | null
}

/**
 * Remix hook actions
 */
export interface UseRemixActions {
  /** Execute a remix request */
  remix: (params: RemixParams) => Promise<RemixResult | null>
  /** Clear the current result */
  clearResult: () => void
  /** Clear any error */
  clearError: () => void
  /** Reset all state */
  reset: () => void
}

/**
 * Combined remix hook return type
 */
export type UseRemixReturn = UseRemixState & UseRemixActions

/**
 * Hook for AI-powered post remix functionality
 * @returns Remix state and actions
 * @example
 * const { isLoading, result, error, remix, reset } = useRemix()
 *
 * const handleRemix = async () => {
 *   const result = await remix({
 *     content: 'Original post content...',
 *     tone: 'professional',
 *   })
 *   if (result) {
 *     console.log('Remixed:', result.remixedContent)
 *   }
 * }
 */
export function useRemix(): UseRemixReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<RemixResult | null>(null)
  const [error, setError] = useState<RemixError | null>(null)

  /**
   * Execute a remix request
   */
  const remix = useCallback(async (params: RemixParams): Promise<RemixResult | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: params.content,
          tone: params.tone,
          instructions: params.instructions,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorResult: RemixError = {
          message: data.error || 'An unexpected error occurred',
          code: data.code || 'unknown',
        }
        setError(errorResult)
        setIsLoading(false)
        return null
      }

      const remixResult: RemixResult = data
      setResult(remixResult)
      setIsLoading(false)
      return remixResult
    } catch (err) {
      const errorResult: RemixError = {
        message: err instanceof Error ? err.message : 'Network error. Please try again.',
        code: 'network_error',
      }
      setError(errorResult)
      setIsLoading(false)
      return null
    }
  }, [])

  /**
   * Clear the current result
   */
  const clearResult = useCallback(() => {
    setResult(null)
  }, [])

  /**
   * Clear any error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setIsLoading(false)
    setResult(null)
    setError(null)
  }, [])

  return {
    isLoading,
    result,
    error,
    remix,
    clearResult,
    clearError,
    reset,
  }
}

/**
 * Checks if the error indicates missing API key
 * @param error - The remix error
 * @returns True if API key is missing
 */
export function isApiKeyMissingError(error: RemixError | null): boolean {
  return error?.code === 'no_api_key'
}

/**
 * Checks if the error indicates invalid API key
 * @param error - The remix error
 * @returns True if API key is invalid
 */
export function isApiKeyInvalidError(error: RemixError | null): boolean {
  return error?.code === 'invalid_api_key'
}

/**
 * Checks if the error indicates rate limiting
 * @param error - The remix error
 * @returns True if rate limited
 */
export function isRateLimitError(error: RemixError | null): boolean {
  return error?.code === 'rate_limit'
}
