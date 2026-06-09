import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const accordionSchema: ComponentSchemaDefinition = {
	name: "accordion",
	displayName: "Accordion",
	description: "A vertically stacked set of collapsible content sections. Built on Radix UI Accordion.",
	category: "component",
	subcategory: "disclosure",
	props: [
		{ name: "type", type: "enum", required: true, description: "Single allows one item open at a time, multiple allows many", enumValues: ["single", "multiple"] },
		{ name: "defaultValue", type: "string", required: false, description: "Default open item(s): string for type='single', string[] for type='multiple'" },
		{ name: "value", type: "string", required: false, description: "Controlled open item(s): string for type='single', string[] for type='multiple'" },
		{ name: "onValueChange", type: "function", required: false, description: "Callback when open items change: (value: string) => void for single, (value: string[]) => void for multiple" },
		{ name: "collapsible", type: "boolean", required: false, default: false, description: "Allow all items to be closed (type='single' only)" },
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [],
	slots: [
		{ name: "children", description: "AccordionItem elements", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@radix-ui/react-accordion", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["border"],
	examples: [
		{
			title: "FAQ accordion",
			description: "Single-open accordion for FAQ sections",
			code: '<Accordion type="single" collapsible>\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Is it accessible?</AccordionTrigger>\n    <AccordionContent>Yes, it adheres to the WAI-ARIA design pattern.</AccordionContent>\n  </AccordionItem>\n  <AccordionItem value="item-2">\n    <AccordionTrigger>Is it styled?</AccordionTrigger>\n    <AccordionContent>Yes, with Tailwind CSS and smooth animations.</AccordionContent>\n  </AccordionItem>\n</Accordion>',
		},
	],
	ai: {
		whenToUse: "Use for FAQ sections, settings groups, or any content that benefits from progressive disclosure. Use type='single' for FAQs, type='multiple' for settings.",
		whenNotToUse: "Don't use for navigation (use tabs). Don't use for a single collapsible (use Collapsible).",
		commonMistakes: ["Forgetting type prop (it's required)", "Not setting collapsible=true for single type when all items should be closeable", "Missing value on AccordionItem"],
		relatedComponents: ["tabs", "card"],
		accessibilityNotes: "Full keyboard navigation (arrow keys, Home, End, Enter/Space). Radix handles aria-expanded, aria-controls, role='region'.",
		tokenBudget: 725,
	},
	tags: ["accordion", "collapsible", "faq", "disclosure", "expandable"],
};
