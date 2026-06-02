import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const inputSchema: ComponentSchemaDefinition = {
	name: "input",
	displayName: "Input",
	description:
		"A styled text input with smooth focus transitions, shadow effects, and full HTML input compatibility.",
	category: "primitive",
	subcategory: "forms",
	props: [
		{
			name: "type",
			type: "enum",
			required: false,
			default: "text",
			description: "The HTML input type",
			enumValues: ["text", "password", "email", "number", "search", "tel", "url", "file", "hidden"],
		},
		{
			name: "placeholder",
			type: "string",
			required: false,
			description: "Placeholder text shown when the input is empty",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable the input",
		},
		{
			name: "value",
			type: "string",
			required: false,
			description: "Controlled input value",
		},
		{
			name: "defaultValue",
			type: "string",
			required: false,
			description: "Default value for uncontrolled usage",
		},
		{
			name: "onChange",
			type: "function",
			required: false,
			description: "Change handler for controlled usage: (e: ChangeEvent<HTMLInputElement>) => void",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes to merge with the component styles",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["input", "background", "ring", "muted-foreground", "foreground"],
	examples: [
		{
			title: "Basic usage",
			description: "A simple text input",
			code: '<Input placeholder="Enter your name" />',
		},
		{
			title: "Email input",
			description: "An email-type input",
			code: '<Input type="email" placeholder="you@example.com" />',
		},
		{
			title: "File upload",
			description: "File input with styled file button",
			code: '<Input type="file" />',
		},
		{
			title: "With label",
			description: "Input paired with a Label component",
			code: '<div className="grid w-full max-w-sm gap-1.5">\n  <Label htmlFor="email">Email</Label>\n  <Input type="email" id="email" placeholder="Email" />\n</div>',
		},
	],
	ai: {
		whenToUse:
			"Use for single-line text input: names, emails, passwords, search, numbers. Always pair with a Label for accessibility.",
		whenNotToUse:
			"Don't use for multi-line text (use Textarea). Don't use for selection from predefined options (use Select). Don't use for rich text editing.",
		commonMistakes: [
			"Missing associated Label element for accessibility",
			"Using type='number' without min/max constraints",
			"Not providing placeholder text for context",
		],
		relatedComponents: ["label", "textarea", "form"],
		accessibilityNotes:
			"Always pair with a Label using htmlFor/id. Consider aria-describedby for helper text or error messages.",
		tokenBudget: 741,
	},
	tags: ["input", "text", "form", "field", "text-field"],
};
