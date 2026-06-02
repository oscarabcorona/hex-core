import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const toggleGroupSchema: ComponentSchemaDefinition = {
	name: "toggle-group",
	displayName: "Toggle Group",
	description:
		"A set of toggles where one or multiple can be pressed. Inherits Toggle's variant/size via context. Useful for alignment/formatting toolbars.",
	category: "primitive",
	subcategory: "forms",
	props: [
		{
			name: "type",
			type: "enum",
			required: true,
			description: "Single allows one pressed at a time, multiple allows many",
			enumValues: ["single", "multiple"],
		},
		{
			name: "value",
			type: "object",
			required: false,
			description:
				"Controlled pressed value(s). string when type='single', string[] when type='multiple'",
		},
		{
			name: "defaultValue",
			type: "object",
			required: false,
			description:
				"Default pressed value(s). string when type='single', string[] when type='multiple'",
		},
		{
			name: "onValueChange",
			type: "function",
			required: false,
			description: "Callback on value change",
		},
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "default",
			description: "Inherited by all ToggleGroupItems",
			enumValues: ["default", "outline"],
		},
		{
			name: "size",
			type: "enum",
			required: false,
			default: "default",
			description: "Inherited by all ToggleGroupItems",
			enumValues: ["default", "sm", "lg"],
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable all items",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "ToggleGroupItem elements",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: [
			"@radix-ui/react-toggle-group",
			"@radix-ui/react-toggle",
			"class-variance-authority",
			"clsx",
			"tailwind-merge",
		],
		internal: ["primitives/toggle/toggle"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["muted", "accent", "accent-foreground", "ring"],
	examples: [
		{
			title: "Text alignment group",
			description: "Single-select toggle group for text alignment",
			code: '<ToggleGroup type="single" defaultValue="left">\n  <ToggleGroupItem value="left" aria-label="Left align">L</ToggleGroupItem>\n  <ToggleGroupItem value="center" aria-label="Center align">C</ToggleGroupItem>\n  <ToggleGroupItem value="right" aria-label="Right align">R</ToggleGroupItem>\n</ToggleGroup>',
		},
		{
			title: "Formatting group",
			description: "Multiple-select toggle group for text formatting",
			code: '<ToggleGroup type="multiple">\n  <ToggleGroupItem value="bold" aria-label="Bold">B</ToggleGroupItem>\n  <ToggleGroupItem value="italic" aria-label="Italic">I</ToggleGroupItem>\n  <ToggleGroupItem value="underline" aria-label="Underline">U</ToggleGroupItem>\n</ToggleGroup>',
		},
	],
	ai: {
		whenToUse:
			"Use for toolbar toggles where users pick one of many (type='single') or multiple (type='multiple'): text alignment, formatting (bold/italic/underline), view modes.",
		whenNotToUse:
			"Don't use for form radio fields (use RadioGroup). Don't use for standalone two-state buttons (use Toggle). Don't use for navigation (use Tabs).",
		commonMistakes: [
			"Forgetting the type prop (required)",
			"Missing aria-label on icon-only items",
			"Using for form submission without name prop",
		],
		relatedComponents: ["toggle", "radio-group", "tabs"],
		accessibilityNotes:
			"Radix implements the WAI-ARIA toolbar pattern with roving focus. Arrow keys move focus, Space/Enter toggles. Each icon-only item needs aria-label.",
		tokenBudget: 891,
	},
	tags: ["toggle-group", "toolbar", "formatting", "alignment", "multi-select"],
};
