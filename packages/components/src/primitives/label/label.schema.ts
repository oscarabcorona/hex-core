import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const labelSchema: ComponentSchemaDefinition = {
	name: "label",
	displayName: "Label",
	description:
		"An accessible label component built on Radix UI Label primitive. Associates with form controls via htmlFor.",
	category: "primitive",
	subcategory: "forms",
	props: [
		{
			name: "htmlFor",
			type: "string",
			required: false,
			description: "The id of the form control this label is associated with",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Label text content",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-label", "class-variance-authority", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [],
	examples: [
		{
			title: "Basic usage",
			description: "A label paired with an input",
			code: '<div className="grid gap-1.5">\n  <Label htmlFor="name">Name</Label>\n  <Input id="name" placeholder="Enter your name" />\n</div>',
		},
		{
			title: "Required field",
			description: "Label with required indicator",
			code: '<Label htmlFor="email">\n  Email <span className="text-destructive">*</span>\n</Label>',
		},
	],
	ai: {
		whenToUse:
			"Use as a label for every form input, select, textarea, checkbox, or radio group. Always use htmlFor to associate with the control's id.",
		whenNotToUse:
			"Don't use as a standalone text element — use a paragraph or heading instead. Don't use for non-form contexts.",
		commonMistakes: [
			"Forgetting to set htmlFor matching the input's id",
			"Using Label for non-form text content",
			"Nesting interactive elements inside Label",
		],
		relatedComponents: ["input", "textarea", "checkbox", "select", "form"],
		accessibilityNotes:
			"Clicking the label focuses the associated control. Automatically communicates the label to screen readers. Use htmlFor/id pairing, not nesting.",
		tokenBudget: 453,
	},
	tags: ["label", "form", "accessibility", "text"],
};
