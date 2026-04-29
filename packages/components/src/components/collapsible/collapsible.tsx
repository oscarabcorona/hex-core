"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

/** Root container controlling the expanded state of the content. */
const Collapsible = CollapsiblePrimitive.Root;

/** The element that toggles the Collapsible open/closed. */
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

/** The collapsible content shown/hidden by the trigger. */
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
