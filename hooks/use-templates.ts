/**
 * Templates Hook
 * @description Fetches and manages post templates from Supabase
 * @module hooks/use-templates
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables, TablesUpdate } from '@/types/database'
import type { Template } from '@/components/features/template-library'

/**
 * Hook return type for templates
 */
interface UseTemplatesReturn {
  /** Formatted templates for the library */
  templates: Template[]
  /** Raw template data from database */
  rawTemplates: Tables<'templates'>[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Refetch templates */
  refetch: () => Promise<void>
  /** Create a new template */
  createTemplate: (template: Omit<Template, 'id' | 'usageCount' | 'createdAt'>) => Promise<boolean>
  /** Update an existing template */
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<boolean>
  /** Delete a template */
  deleteTemplate: (id: string) => Promise<boolean>
  /** Increment usage count for a template */
  incrementUsage: (id: string) => Promise<void>
}

/**
 * Hook to fetch and manage post templates
 * @returns Templates data, loading state, and CRUD functions
 * @example
 * const { templates, isLoading, createTemplate, deleteTemplate } = useTemplates()
 */
export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<Template[]>([])
  const [rawTemplates, setRawTemplates] = useState<Tables<'templates'>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  /**
   * Fetch templates from database
   */
  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setTemplates([])
        setRawTemplates([])
        setIsLoading(false)
        return
      }

      // Fetch templates for the user (own templates + public templates)
      const { data: templatesData, error: fetchError } = await supabase
        .from('templates')
        .select('*')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      if (!templatesData || templatesData.length === 0) {
        setTemplates([])
        setRawTemplates([])
        setIsLoading(false)
        return
      }

      // Transform to Template format
      const transformedTemplates: Template[] = templatesData.map((template) => ({
        id: template.id,
        name: template.name,
        content: template.content,
        category: template.category || 'Other',
        tags: Array.isArray(template.tags) ? (template.tags as string[]) : [],
        usageCount: template.usage_count,
        isPublic: template.is_public,
        createdAt: template.created_at,
      }))

      setTemplates(transformedTemplates)
      setRawTemplates(templatesData)
    } catch (err) {
      console.error('Templates fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
      setTemplates([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  /**
   * Create a new template
   */
  const createTemplate = useCallback(async (
    template: Omit<Template, 'id' | 'usageCount' | 'createdAt'>
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to create templates')
        return false
      }

      const { error: insertError } = await supabase
        .from('templates')
        .insert({
          user_id: user.id,
          name: template.name,
          content: template.content,
          category: template.category,
          tags: template.tags,
          is_public: template.isPublic,
          usage_count: 0,
        })

      if (insertError) {
        throw insertError
      }

      // Refetch to get the new template
      await fetchTemplates()
      return true
    } catch (err) {
      console.error('Template create error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create template')
      return false
    }
  }, [supabase, fetchTemplates])

  /**
   * Update an existing template
   */
  const updateTemplate = useCallback(async (
    id: string,
    updates: Partial<Template>
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to update templates')
        return false
      }

      // Map Template fields to database fields
      const dbUpdates: Partial<TablesUpdate<'templates'>> = {}
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.content !== undefined) dbUpdates.content = updates.content
      if (updates.category !== undefined) dbUpdates.category = updates.category
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags
      if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic

      const { error: updateError } = await supabase
        .from('templates')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id) // Only allow updating own templates

      if (updateError) {
        throw updateError
      }

      // Refetch to get the updated template
      await fetchTemplates()
      return true
    } catch (err) {
      console.error('Template update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update template')
      return false
    }
  }, [supabase, fetchTemplates])

  /**
   * Delete a template
   */
  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to delete templates')
        return false
      }

      const { error: deleteError } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Only allow deleting own templates

      if (deleteError) {
        throw deleteError
      }

      // Refetch to update the list
      await fetchTemplates()
      return true
    } catch (err) {
      console.error('Template delete error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete template')
      return false
    }
  }, [supabase, fetchTemplates])

  /**
   * Increment usage count for a template
   */
  const incrementUsage = useCallback(async (id: string): Promise<void> => {
    try {
      // Use RPC to increment atomically, or just update
      const template = rawTemplates.find((t) => t.id === id)
      if (!template) return

      await supabase
        .from('templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', id)

      // Update local state without refetching
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
        )
      )
    } catch (err) {
      console.error('Template usage increment error:', err)
    }
  }, [supabase, rawTemplates])

  // Fetch on mount
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return {
    templates,
    rawTemplates,
    isLoading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
  }
}
