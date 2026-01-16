/**
 * AI Remix System Prompts
 * @description System prompts for post rewriting with different tones
 * @module lib/ai/remix-prompts
 */

/**
 * Available tone options for remix
 */
export type RemixTone =
  | 'professional'
  | 'casual'
  | 'thought-leader'
  | 'storyteller'
  | 'preserve'

/**
 * Tone option with label and description
 */
export interface ToneOption {
  /** Unique identifier for the tone */
  id: RemixTone
  /** Display label */
  label: string
  /** Description of the tone style */
  description: string
}

/**
 * Available tone options for the UI
 */
export const TONE_OPTIONS: ToneOption[] = [
  {
    id: 'professional',
    label: 'Professional',
    description: 'Formal, polished, and corporate-appropriate',
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Conversational, relatable, and personal',
  },
  {
    id: 'thought-leader',
    label: 'Thought Leader',
    description: 'Bold opinions, industry insights, contrarian views',
  },
  {
    id: 'storyteller',
    label: 'Storyteller',
    description: 'Narrative arc, emotional hooks, personal anecdotes',
  },
  {
    id: 'preserve',
    label: 'Preserve Original',
    description: 'Keep the original tone, just rephrase and restructure',
  },
]

/**
 * Base system prompt for all remix operations
 */
const BASE_PROMPT = `You are an expert LinkedIn content creator and copywriter. Your task is to rewrite posts while maintaining the core message and value proposition.

## Guidelines:
1. Keep the essential meaning and key points of the original post
2. Maintain any important hashtags, but feel free to suggest better alternatives
3. Follow LinkedIn best practices:
   - Strong opening hook in the first line
   - Use white space and line breaks for readability
   - Include a clear call-to-action when appropriate
   - Optimal length: 100-250 words for maximum engagement
4. Never plagiarize - transform the content significantly
5. Remove any @mentions from the original (respect attribution)
6. Keep emojis minimal and professional unless the tone calls for more

## Output:
Return ONLY the rewritten post content. No explanations, no preamble, no quotes around the text.`

/**
 * Tone-specific prompt additions
 */
const TONE_PROMPTS: Record<RemixTone, string> = {
  professional: `
## Tone: Professional
- Use formal language and industry terminology
- Maintain a polished, corporate-appropriate voice
- Focus on data, insights, and professional value
- Avoid slang, contractions, and casual expressions
- Structure content with clear logic and progression`,

  casual: `
## Tone: Casual
- Write like you're talking to a friend or colleague
- Use contractions and conversational language
- Include personal touches and relatable moments
- Feel free to use appropriate emojis sparingly
- Be authentic and approachable`,

  'thought-leader': `
## Tone: Thought Leader
- Take bold, confident positions on the topic
- Challenge conventional wisdom when appropriate
- Share unique insights and predictions
- Use authoritative language without being arrogant
- Include contrarian or unexpected perspectives
- Position the content as industry-shaping ideas`,

  storyteller: `
## Tone: Storyteller
- Transform the content into a narrative arc
- Start with a compelling hook or scenario
- Build tension or curiosity
- Include sensory details and emotional elements
- End with a meaningful takeaway or lesson
- Make the reader feel something`,

  preserve: `
## Tone: Preserve Original Style
- Analyze the original post's writing style carefully:
  - Sentence length and structure patterns
  - Vocabulary level (technical vs accessible)
  - Emoji usage patterns
  - Formatting preferences (lists, line breaks)
  - Level of formality
- Replicate these stylistic elements in your rewrite
- The goal is to create a fresh version that sounds like it could have been written by the same author`,
}

/**
 * Gets the complete system prompt for a remix operation
 * @param tone - The desired tone for the remix
 * @param customInstructions - Optional custom instructions from the user
 * @returns Complete system prompt
 * @example
 * const prompt = getRemixSystemPrompt('professional')
 */
export function getRemixSystemPrompt(
  tone: RemixTone,
  customInstructions?: string
): string {
  let prompt = BASE_PROMPT + TONE_PROMPTS[tone]

  if (customInstructions?.trim()) {
    prompt += `

## Custom Instructions from User:
${customInstructions.trim()}`
  }

  return prompt
}

/**
 * Formats the user message for the remix request
 * @param originalContent - The original post content to remix
 * @returns Formatted user message
 * @example
 * const message = formatRemixUserMessage('Original post content...')
 */
export function formatRemixUserMessage(originalContent: string): string {
  return `Please rewrite the following LinkedIn post:

---
${originalContent.trim()}
---

Remember: Return ONLY the rewritten content, nothing else.`
}

/**
 * Validates content before sending for remix
 * @param content - The content to validate
 * @returns Object with isValid flag and optional error message
 */
export function validateRemixContent(content: string): {
  isValid: boolean
  error?: string
} {
  const trimmed = content.trim()

  if (!trimmed) {
    return { isValid: false, error: 'Content cannot be empty' }
  }

  if (trimmed.length < 10) {
    return { isValid: false, error: 'Content is too short to remix' }
  }

  if (trimmed.length > 5000) {
    return { isValid: false, error: 'Content exceeds maximum length (5000 characters)' }
  }

  return { isValid: true }
}

/**
 * Estimates the cost of a remix operation
 * @param inputLength - Character length of the input content
 * @returns Estimated cost in USD (approximate)
 */
export function estimateRemixCost(inputLength: number): number {
  // Rough estimation based on GPT-4o-mini pricing
  // Input: ~$0.15/1M tokens, Output: ~$0.60/1M tokens
  // Average ~4 chars per token
  const estimatedInputTokens = Math.ceil(inputLength / 4) + 500 // +500 for system prompt
  const estimatedOutputTokens = Math.ceil(inputLength / 3) // Output usually shorter

  const inputCost = (estimatedInputTokens / 1_000_000) * 0.15
  const outputCost = (estimatedOutputTokens / 1_000_000) * 0.60

  return inputCost + outputCost
}
