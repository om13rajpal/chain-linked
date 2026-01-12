"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

/**
 * Collapsible component for expandable/collapsible content sections.
 * Built on Radix UI Collapsible primitive.
 */
const Collapsible = CollapsiblePrimitive.Root

/**
 * Trigger element that toggles the collapsible content visibility.
 */
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

/**
 * Content container that is shown/hidden based on the collapsible state.
 */
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
