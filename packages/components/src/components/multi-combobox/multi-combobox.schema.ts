import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const multiComboboxSchema: ComponentSchemaDefinition = {
	name: "multi-combobox",
	displayName: "MultiCombobox",
	description:
		"Searchable multi-select input. Composes Popover + Command (cmdk) + a styled trigger. Trigger shows '{n} selected'; each option exposes aria-selected.",
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
			type: "object",
			required: false,
			description: "Controlled selected values (string[])",
		},
		{
			name: "onChange",
			type: "function",
			required: false,
			description:
				"Callback when the user toggles an option: (values: string[]) => void",
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
			name: "maxSelected",
			type: "number",
			required: false,
			description:
				"Soft cap on selections — once reached, unselected options become aria-disabled and clicks are ignored",
		},
		{
			name: "closeOnSelect",
			type: "boolean",
			required: false,
			default: false,
			description:
				"Close the popover after every pick. Default false matches multi-select UX (Linear/Notion).",
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
	tokensUsed: [
		"background",
		"input",
		"ring",
		"accent",
		"accent-foreground",
		"muted-foreground",
	],
	examples: [
		{
			title: "Tag picker",
			description: "Multi-select with a small static list and chip count",
			code: 'import { useState } from "react";\nimport { MultiCombobox } from "@/components/ui/multi-combobox";\n\nconst tags = [\n  { value: "bug", label: "Bug" },\n  { value: "feature", label: "Feature" },\n  { value: "question", label: "Question" },\n  { value: "docs", label: "Documentation" },\n];\n\nexport function Example() {\n  const [picks, setPicks] = useState<string[]>([]);\n  return (\n    <MultiCombobox\n      options={tags}\n      value={picks}\n      onChange={setPicks}\n      placeholder="Pick tags"\n      aria-label="Tags"\n    />\n  );\n}',
		},
		{
			title: "Capped selection",
			description: "Limit the number of items the user can pick",
			code: 'import { useState } from "react";\nimport { MultiCombobox } from "@/components/ui/multi-combobox";\n\nexport function Example() {\n  const [picks, setPicks] = useState<string[]>([]);\n  return (\n    <MultiCombobox\n      options={tags}\n      value={picks}\n      onChange={setPicks}\n      maxSelected={3}\n      aria-label="Up to 3 tags"\n    />\n  );\n}',
		},
	],
	ai: {
		whenToUse:
			"Use to pick multiple items from a list of >~8 options where users benefit from typing to narrow. Common for tags, recipients, filters. Trigger shows count, each option exposes aria-selected.",
		whenNotToUse:
			"Don't use for single-select (use Combobox). Don't use for free-text entry (use Input or a tag input). Don't use for very large lists (>500 options) without server-side filtering — cmdk filters in-memory.",
		commonMistakes: [
			"Passing duplicate option values — Set-based selection treats them as one",
			"Two options with identical labels — cmdk dedupes by the Item's filter value (the label here), so one will be dropped from the list",
			"Forgetting that value is string[] not string — passing a single string breaks Array iteration",
			"Setting closeOnSelect={true} for a power-user picker — multi-select normally stays open until the user dismisses",
			"Missing aria-label / aria-labelledby — role='combobox' does not derive its name from contents, so the trigger has no accessible name without one",
			"Relying on maxSelected to enforce business rules — the cap is a UX hint; always validate the array length on submit",
		],
		relatedComponents: ["combobox", "command", "popover", "select"],
		accessibilityNotes:
			"Trigger has role='combobox' + aria-expanded + aria-haspopup='listbox'. aria-controls points at the inner CommandList only when open. Each option carries aria-selected; capped/disabled options carry aria-disabled. A visually-hidden aria-live='polite' region inside the trigger announces selection-count changes.",
		tokenBudget: 1311,
	},
	tags: ["combobox", "multi-select", "select", "search", "cmdk", "input"],
};
