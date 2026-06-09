import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const toggleSchema: ComponentSchemaDefinition = {
	name: "toggle",
	displayName: "Toggle",
	description:
		"A two-state button that stays pressed when toggled on. Used for formatting toolbars (bold/italic) or option toggles.",
	category: "primitive",
	subcategory: "forms",
	props: [
		{
			name: "pressed",
			type: "boolean",
			required: false,
			description: "Controlled pressed state",
		},
		{
			name: "defaultPressed",
			type: "boolean",
			required: false,
			default: false,
			description: "Default pressed state for uncontrolled usage",
		},
		{
			name: "onPressedChange",
			type: "function",
			required: false,
			description: "Callback on pressed change: (pressed: boolean) => void",
		},
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "default",
			description: "Visual style",
			enumValues: ["default", "outline"],
		},
		{
			name: "size",
			type: "enum",
			required: false,
			default: "default",
			description: "Toggle size",
			enumValues: ["default", "sm", "lg"],
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable the toggle",
		},
	],
	variants: [
		{
			name: "variant",
			description: "Visual variants",
			values: [
				{ value: "default", description: "Transparent ghost-style toggle" },
				{ value: "outline", description: "Bordered toggle" },
			],
			default: "default",
		},
		{
			name: "size",
			description: "Size variants",
			values: [
				{ value: "default", description: "Standard size (h-10)" },
				{ value: "sm", description: "Compact size (h-9)" },
				{ value: "lg", description: "Large size (h-11)" },
			],
			default: "default",
		},
	],
	slots: [
		{
			name: "children",
			description: "Toggle label or icon",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-toggle", "class-variance-authority", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["muted", "muted-foreground", "accent", "accent-foreground", "input", "ring"],
	examples: [
		{
			title: "Basic toggle",
			description: "Bold text toggle",
			code: '<Toggle aria-label="Toggle bold">B</Toggle>',
		},
	],
	ai: {
		whenToUse:
			"Use for binary on/off actions that persist: toolbar formatting buttons (bold, italic), layout mode switches, filter toggles. Not submitted as form data.",
		whenNotToUse:
			"Don't use for instant settings (use Switch). Don't use for form boolean fields (use Checkbox). Don't use for choosing one of many (use ToggleGroup).",
		commonMistakes: [
			"Using for form field submission (use Checkbox instead)",
			"Forgetting aria-label on icon-only toggles",
			"Using Toggle when ToggleGroup's single-select mode is needed",
		],
		relatedComponents: ["toggle-group", "switch", "checkbox", "button"],
		accessibilityNotes:
			"Radix sets aria-pressed correctly. Icon-only toggles MUST have aria-label. Space/Enter toggles state.",
		tokenBudget: 804,
	},
	tags: ["toggle", "button", "pressed", "two-state", "toolbar"],
};
