import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const radioGroupSchema: ComponentSchemaDefinition = {
	name: "radio-group",
	displayName: "Radio Group",
	description:
		"A set of mutually exclusive radio options. Built on Radix UI RadioGroup with roving focus and arrow-key navigation.",
	category: "primitive",
	subcategory: "forms",
	props: [
		{ name: "value", type: "string", required: false, description: "Controlled selected value" },
		{
			name: "defaultValue",
			type: "string",
			required: false,
			description: "Default selected value for uncontrolled usage",
		},
		{
			name: "onValueChange",
			type: "function",
			required: false,
			description: "Callback on value change: (value: string) => void",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable all items",
		},
		{
			name: "name",
			type: "string",
			required: false,
			description: "Form field name (for native form submission)",
		},
		{
			name: "orientation",
			type: "enum",
			required: false,
			default: "vertical",
			description: "Layout direction",
			enumValues: ["horizontal", "vertical"],
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "RadioGroupItem elements, typically paired with Labels",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-radio-group", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["input", "primary", "ring"],
	examples: [
		{
			title: "Basic radio group",
			description: "Select a notification preference",
			code: '<RadioGroup defaultValue="comfortable">\n  <div className="flex items-center gap-2">\n    <RadioGroupItem value="default" id="r1" />\n    <Label htmlFor="r1">Default</Label>\n  </div>\n  <div className="flex items-center gap-2">\n    <RadioGroupItem value="comfortable" id="r2" />\n    <Label htmlFor="r2">Comfortable</Label>\n  </div>\n  <div className="flex items-center gap-2">\n    <RadioGroupItem value="compact" id="r3" />\n    <Label htmlFor="r3">Compact</Label>\n  </div>\n</RadioGroup>',
		},
	],
	ai: {
		whenToUse:
			"Use for mutually exclusive choices from a short list (2-5 options) where all options should be visible. Pair each RadioGroupItem with a Label.",
		whenNotToUse:
			"Don't use for many options (use Select). Don't use for boolean toggles (use Switch or Checkbox). Don't use for multi-select.",
		commonMistakes: [
			"Missing Label for each RadioGroupItem",
			"Using for more than 5 options (use Select)",
			"Using htmlFor id mismatch between Label and RadioGroupItem",
		],
		relatedComponents: ["select", "checkbox", "label"],
		accessibilityNotes:
			"Radix implements the WAI-ARIA radio group pattern. Arrow keys move focus+selection. Radix handles aria-checked, role='radiogroup', role='radio'.",
		tokenBudget: 749,
	},
	tags: ["radio", "radio-group", "form", "choice", "mutually-exclusive"],
};
