import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const collapsibleSchema: ComponentSchemaDefinition = {
	name: "collapsible",
	displayName: "Collapsible",
	description: "A single section that can be expanded or collapsed. For multiple independent sections use Accordion with type='multiple'.",
	category: "component",
	subcategory: "disclosure",
	props: [
		{ name: "open", type: "boolean", required: false, description: "Controlled open state" },
		{ name: "defaultOpen", type: "boolean", required: false, default: false, description: "Default open state" },
		{ name: "onOpenChange", type: "function", required: false, description: "Callback on open change: (open: boolean) => void" },
		{ name: "disabled", type: "boolean", required: false, default: false, description: "Disable toggling" },
	],
	variants: [],
	slots: [
		{ name: "children", description: "CollapsibleTrigger + CollapsibleContent", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@radix-ui/react-collapsible"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [],
	examples: [
		{
			title: "Show more",
			description: "Expand additional content below a preview",
			code: '<Collapsible>\n  <div>Yesterday at 9:00 AM</div>\n  <CollapsibleTrigger asChild>\n    <Button variant="ghost" size="sm">Toggle</Button>\n  </CollapsibleTrigger>\n  <CollapsibleContent>\n    <div>Additional details here</div>\n  </CollapsibleContent>\n</Collapsible>',
		},
	],
	ai: {
		whenToUse:
			"Use for a single show-more/show-less section: 'View full details', 'Advanced settings', preview cards with expandable notes.",
		whenNotToUse:
			"Don't use for multiple related sections (use Accordion). Don't use for overlays (use Dialog/Popover). Don't use for navigation (use DropdownMenu).",
		commonMistakes: [
			"Using Collapsible for multiple sections instead of Accordion",
			"Missing asChild when passing a Button as trigger",
			"Not animating content height (Radix exposes --radix-collapsible-content-height for CSS keyframes)",
		],
		relatedComponents: ["accordion", "dropdown-menu"],
		accessibilityNotes:
			"Radix sets aria-expanded on the trigger and aria-controls → content id. Trigger is keyboard-operable (Enter/Space).",
		tokenBudget: 580,
	},
	tags: ["collapsible", "disclosure", "expand", "show-more"],
};
