import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const selectSchema: ComponentSchemaDefinition = {
	name: "select",
	displayName: "Select",
	description:
		"An accessible dropdown select for choosing one option from a list. Built on Radix UI Select with full keyboard navigation, typeahead, and RTL support.",
	category: "primitive",
	subcategory: "forms",
	props: [
		{
			name: "value",
			type: "string",
			required: false,
			description: "[Select root prop] Controlled selected value",
		},
		{
			name: "defaultValue",
			type: "string",
			required: false,
			description: "[Select root prop] Default selected value for uncontrolled usage",
		},
		{
			name: "onValueChange",
			type: "function",
			required: false,
			description: "[Select root prop] Callback on value change: (value: string) => void",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "[Select root prop] Disable the entire select",
		},
		{
			name: "required",
			type: "boolean",
			required: false,
			default: false,
			description: "[Select root prop] Mark as required for form validation",
		},
		{
			name: "name",
			type: "string",
			required: false,
			description: "[Select root prop] Form field name (for native form submission)",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "SelectTrigger + SelectContent (with SelectItems, Groups, Labels)",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-select", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [
		"input",
		"background",
		"ring",
		"muted-foreground",
		"popover",
		"popover-foreground",
		"accent",
		"accent-foreground",
		"muted",
		"border",
	],
	examples: [
		{
			title: "Basic select",
			description: "Choose a timezone",
			code: '<Select>\n  <SelectTrigger className="w-[180px]">\n    <SelectValue placeholder="Select a fruit" />\n  </SelectTrigger>\n  <SelectContent>\n    <SelectGroup>\n      <SelectLabel>Fruits</SelectLabel>\n      <SelectItem value="apple">Apple</SelectItem>\n      <SelectItem value="banana">Banana</SelectItem>\n      <SelectItem value="orange">Orange</SelectItem>\n    </SelectGroup>\n  </SelectContent>\n</Select>',
		},
	],
	ai: {
		whenToUse:
			"Use for choosing one option from a known, finite list (<= ~20 items): timezones, categories, roles, country codes. Pair with Label.",
		whenNotToUse:
			"Don't use for large searchable lists (use Combobox). Don't use for boolean choices (use Switch/Checkbox). Don't use for action menus (use DropdownMenu). Don't use for multi-select (needs a different component).",
		commonMistakes: [
			"Missing Label pairing",
			"Forgetting SelectValue inside SelectTrigger",
			"Using Select when the list is large (use Combobox)",
			"Putting non-SelectItem children inside SelectContent",
		],
		relatedComponents: ["combobox", "dropdown-menu", "radio-group"],
		accessibilityNotes:
			"Full keyboard nav: arrow keys, Home, End, typeahead, Escape to close. Radix handles role='combobox' on trigger, role='listbox' on content, aria-selected on items.",
		tokenBudget: 758,
	},
	tags: ["select", "dropdown", "form", "field", "options", "choose"],
};
