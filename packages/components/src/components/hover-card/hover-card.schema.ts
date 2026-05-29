import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const hoverCardSchema: ComponentSchemaDefinition = {
	name: "hover-card",
	displayName: "Hover Card",
	description: "Rich floating content revealed on hover or focus. Use when Tooltip is too small and Popover requires a click.",
	category: "component",
	subcategory: "overlay",
	props: [
		{ name: "open", type: "boolean", required: false, description: "Controlled open state" },
		{ name: "defaultOpen", type: "boolean", required: false, default: false, description: "Default open state" },
		{ name: "onOpenChange", type: "function", required: false, description: "Callback on open change" },
		{ name: "openDelay", type: "number", required: false, default: 700, description: "Milliseconds before the card appears" },
		{ name: "closeDelay", type: "number", required: false, default: 300, description: "Milliseconds before the card closes after leaving" },
	],
	variants: [],
	slots: [
		{ name: "children", description: "HoverCardTrigger + HoverCardContent", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@radix-ui/react-hover-card", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["popover", "popover-foreground", "border"],
	examples: [
		{
			title: "User profile preview",
			description: "Username link that expands into a mini profile on hover",
			code: '<HoverCard>\n  <HoverCardTrigger asChild>\n    <a href="#">@shadcn</a>\n  </HoverCardTrigger>\n  <HoverCardContent>\n    <div className="flex gap-3">\n      <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar>\n      <div>\n        <h4 className="font-semibold">@shadcn</h4>\n        <p className="text-xs text-muted-foreground">Builds UI components</p>\n      </div>\n    </div>\n  </HoverCardContent>\n</HoverCard>',
		},
	],
	ai: {
		whenToUse:
			"Use for rich hover previews: user profile cards, link previews, inline references. Contains multiple elements — more than a tooltip can hold.",
		whenNotToUse:
			"Don't use for simple hover labels (use Tooltip). Don't use for click-triggered content (use Popover). Don't use as primary info on touch devices — hover doesn't exist there.",
		commonMistakes: [
			"Using HoverCard for critical info (invisible on touch)",
			"Too-short openDelay causes flicker on mouse-over traffic",
			"Omitting asChild on HoverCardTrigger with a custom element",
		],
		relatedComponents: ["tooltip", "popover"],
		accessibilityNotes:
			"Radix opens on hover and keyboard focus. Content must be meaningful on focus as well as hover. Consider an alternative for touch users.",
		tokenBudget: 695,
	},
	tags: ["hover-card", "preview", "overlay", "rich-tooltip"],
};
