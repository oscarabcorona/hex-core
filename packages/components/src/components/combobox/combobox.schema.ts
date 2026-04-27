import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const comboboxSchema: ComponentSchemaDefinition = {
	name: "combobox",
	displayName: "Combobox",
	description:
		"Searchable single-select input. Composes Popover + Command (cmdk) + a styled trigger. Pass a list of { value, label } options.",
	category: "component",
	subcategory: "input",
	props: [
		{
			name: "options",
			type: "object",
			required: true,
			description: "Array of { value: string, label: string, disabled?: boolean }",
		},
		{
			name: "value",
			type: "string",
			required: false,
			description: "Controlled selected option value",
		},
		{
			name: "onChange",
			type: "function",
			required: false,
			description: "Callback when the user picks an option: (value: string) => void",
		},
		{
			name: "placeholder",
			type: "string",
			required: false,
			default: "Select…",
			description: "Text shown on the trigger when nothing is selected",
		},
		{
			name: "searchPlaceholder",
			type: "string",
			required: false,
			default: "Search…",
			description: "Placeholder for the filter input",
		},
		{
			name: "emptyText",
			type: "string",
			required: false,
			default: "No results found.",
			description: "Shown inside the list when the search has no matches",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable the trigger",
		},
		{
			name: "aria-label",
			type: "string",
			required: false,
			description: "Accessible label — required when no adjacent visible label is used",
		},
		{
			name: "aria-labelledby",
			type: "string",
			required: false,
			description: "Id of an external visible label that names the combobox",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["cmdk", "@radix-ui/react-popover", "clsx", "tailwind-merge"],
		internal: [
			"components/command/command",
			"components/popover/popover",
			"lib/utils",
		],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "input", "ring", "accent", "accent-foreground", "muted-foreground"],
	examples: [
		{
			title: "Framework picker",
			description: "Searchable single-select with a small static list",
			code: 'import { useState } from "react";\nimport { Combobox } from "@/components/ui/combobox";\n\nconst frameworks = [\n  { value: "next", label: "Next.js" },\n  { value: "remix", label: "Remix" },\n  { value: "astro", label: "Astro" },\n  { value: "nuxt", label: "Nuxt" },\n];\n\nexport function Example() {\n  const [value, setValue] = useState<string>();\n  return <Combobox options={frameworks} value={value} onChange={setValue} placeholder="Pick a framework" />;\n}',
		},
	],
	ai: {
		whenToUse:
			"Use for a select input when the list is >~8 items or users benefit from typing to narrow. Fuzzy search + keyboard nav + selected-item checkmark.",
		whenNotToUse:
			"Don't use for native-select parity on mobile (use Select). Don't use for multi-select (this component is single-value — compose Command + Popover yourself for multi). Don't use for free-text entry (use Input).",
		commonMistakes: [
			"Passing duplicate option values (breaks selection and filtering)",
			"Two options with identical labels — cmdk dedupes by the Item's filter value (the label here), so one will be dropped from the list",
			"Using the label as the value — fine if stable, but prefer a short stable `value` string",
			"Forgetting to bind value + onChange — uncontrolled mode doesn't exist on this wrapper",
			"Mixing translated labels without keying on value — label changes won't update selection",
			"Missing aria-label / aria-labelledby — role='combobox' does not allow name from contents, so without one of these the trigger has no accessible name",
		],
		relatedComponents: ["command", "popover", "select"],
		accessibilityNotes:
			"Trigger has role='combobox' + aria-expanded + aria-haspopup='listbox'. aria-controls points at the inner CommandList (a useId-stabilized listbox). Pass aria-label or aria-labelledby — combobox does not derive its name from contents.",
		tokenBudget: 900,
	},
	tags: ["combobox", "select", "search", "cmdk", "input"],
};
