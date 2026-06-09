import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const popoverSchema: ComponentSchemaDefinition = {
	name: "popover",
	displayName: "Popover",
	description:
		"Floating content anchored to a trigger element. Non-modal by default — clicks outside dismiss it. Use for inline forms, info, or quick actions.",
	category: "component",
	subcategory: "overlay",
	props: [
		{ name: "open", type: "boolean", required: false, description: "Controlled open state" },
		{
			name: "defaultOpen",
			type: "boolean",
			required: false,
			default: false,
			description: "Default open state",
		},
		{
			name: "onOpenChange",
			type: "function",
			required: false,
			description: "Callback on open state change: (open: boolean) => void",
		},
		{
			name: "modal",
			type: "boolean",
			required: false,
			default: false,
			description: "When true, content outside the popover is inert",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "PopoverTrigger + PopoverContent",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-popover", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["popover", "popover-foreground", "border"],
	examples: [
		{
			title: "Basic popover",
			description: "Quick settings anchored to a button",
			code: '<Popover>\n  <PopoverTrigger asChild>\n    <Button variant="outline">Open</Button>\n  </PopoverTrigger>\n  <PopoverContent>\n    <div className="space-y-2">\n      <h4 className="font-medium">Dimensions</h4>\n      <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>\n    </div>\n  </PopoverContent>\n</Popover>',
		},
	],
	ai: {
		whenToUse:
			"Use for inline forms, quick settings, info panels, or color pickers. Anchored to a trigger, non-modal, dismisses on outside click.",
		whenNotToUse:
			"Don't use for critical tasks that interrupt (use Dialog). Don't use for hover-only info (use Tooltip or HoverCard). Don't use for menu actions (use DropdownMenu).",
		commonMistakes: [
			"Using Popover when the user must address the content (should be Dialog)",
			"Missing asChild on PopoverTrigger when using a styled Button",
			"Popover content too wide — keep it focused and compact",
		],
		relatedComponents: ["tooltip", "hover-card", "dialog", "dropdown-menu"],
		accessibilityNotes:
			"Radix manages focus, aria-expanded on the trigger, and closes on Escape. Content is portalled to body so stacking contexts don't clip it.",
		tokenBudget: 625,
	},
	tags: ["popover", "overlay", "floating", "inline", "anchored"],
};
