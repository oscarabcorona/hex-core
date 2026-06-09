import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const textareaSchema: ComponentSchemaDefinition = {
	name: "textarea",
	displayName: "Textarea",
	description: "A styled multi-line text input with smooth focus transitions and shadow effects.",
	category: "primitive",
	subcategory: "forms",
	props: [
		{ name: "placeholder", type: "string", required: false, description: "Placeholder text" },
		{ name: "rows", type: "number", required: false, default: 3, description: "Number of visible text rows" },
		{ name: "disabled", type: "boolean", required: false, default: false, description: "Disable the textarea" },
		{ name: "value", type: "string", required: false, description: "Controlled textarea value" },
		{ name: "defaultValue", type: "string", required: false, description: "Default value for uncontrolled usage" },
		{ name: "onChange", type: "function", required: false, description: "Change handler: (e: ChangeEvent<HTMLTextAreaElement>) => void" },
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["input", "background", "ring", "muted-foreground"],
	examples: [
		{ title: "Basic", description: "Simple textarea", code: '<Textarea placeholder="Type your message..." />' },
		{ title: "With label", description: "Textarea paired with a label", code: '<div className="grid gap-1.5">\n  <Label htmlFor="message">Message</Label>\n  <Textarea id="message" placeholder="Type your message..." />\n</div>' },
	],
	ai: {
		whenToUse: "Use for multi-line text input: comments, descriptions, messages, notes. Always pair with a Label.",
		whenNotToUse: "Don't use for single-line input (use Input). Don't use for rich text editing.",
		commonMistakes: ["Missing associated Label", "Not setting a reasonable min-height or rows"],
		relatedComponents: ["input", "label", "form"],
		accessibilityNotes: "Always pair with a Label using htmlFor/id. Consider aria-describedby for character limits.",
		tokenBudget: 563,
	},
	tags: ["textarea", "text", "form", "multiline", "input"],
};
