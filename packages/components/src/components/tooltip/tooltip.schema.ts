import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const tooltipSchema: ComponentSchemaDefinition = {
	name: "tooltip",
	displayName: "Tooltip",
	description:
		"A small floating label that reveals on hover or focus. Wrap your app in TooltipProvider, then use Tooltip/TooltipTrigger/TooltipContent per tooltip.",
	category: "component",
	subcategory: "overlay",
	props: [
		{
			name: "delayDuration",
			type: "number",
			required: false,
			default: 700,
			description:
				"[TooltipProvider prop] Milliseconds before the tooltip appears on hover",
		},
		{
			name: "disableHoverableContent",
			type: "boolean",
			required: false,
			default: false,
			description:
				"[TooltipProvider prop] When true, tooltip dismisses when cursor enters it",
		},
		{
			name: "open",
			type: "boolean",
			required: false,
			description: "[Tooltip root prop] Controlled open state",
		},
		{
			name: "defaultOpen",
			type: "boolean",
			required: false,
			default: false,
			description: "[Tooltip root prop] Default open state for uncontrolled usage",
		},
		{
			name: "onOpenChange",
			type: "function",
			required: false,
			description:
				"[Tooltip root prop] Callback on open state change: (open: boolean) => void",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "TooltipTrigger + TooltipContent, all inside a TooltipProvider",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-tooltip", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["primary", "primary-foreground"],
	examples: [
		{
			title: "Basic tooltip",
			description: "Icon button with hover label",
			code: '<TooltipProvider>\n  <Tooltip>\n    <TooltipTrigger asChild>\n      <Button variant="outline" size="icon" aria-label="Add">+</Button>\n    </TooltipTrigger>\n    <TooltipContent>\n      <p>Add item</p>\n    </TooltipContent>\n  </Tooltip>\n</TooltipProvider>',
		},
	],
	ai: {
		whenToUse:
			"Use for terse hover/focus-reveal info: icon button labels, abbreviation expansions, keyboard shortcut hints. Content should fit in one line.",
		whenNotToUse:
			"Don't use for rich content with images or actions (use HoverCard or Popover). Don't use for the only way to convey essential info — it's invisible to touch users.",
		commonMistakes: [
			"Forgetting TooltipProvider at the app root",
			"Tooltip content too long (keep it under one line)",
			"Using Tooltip as the only label for icon buttons (still add aria-label)",
			"Triggering tooltips on non-interactive elements",
		],
		relatedComponents: ["hover-card", "popover"],
		accessibilityNotes:
			"Triggers on focus and hover. Radix sets role='tooltip' and aria-describedby. Still pair icon buttons with aria-label since tooltips don't announce on touch.",
		tokenBudget: 676,
	},
	tags: ["tooltip", "hint", "label", "hover", "overlay"],
};
