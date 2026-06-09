import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const badgeSchema: ComponentSchemaDefinition = {
	name: "badge",
	displayName: "Badge",
	description: "A small status indicator with multiple style variants. Used for tags, statuses, and categorization.",
	category: "primitive",
	subcategory: "display",
	props: [
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "default",
			description: "Visual style",
			enumValues: ["default", "secondary", "destructive", "outline"],
		},
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [
		{
			name: "variant",
			description: "Visual style variants",
			values: [
				{ value: "default", description: "Primary colored badge" },
				{ value: "secondary", description: "Muted background badge" },
				{ value: "destructive", description: "Red/danger badge" },
				{ value: "outline", description: "Bordered badge, no fill" },
			],
			default: "default",
		},
	],
	slots: [{ name: "children", description: "Badge content text", required: true, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["class-variance-authority", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["primary", "primary-foreground", "secondary", "secondary-foreground", "destructive", "destructive-foreground", "foreground", "ring"],
	examples: [
		{ title: "Variants", description: "All badge styles", code: '<>\n  <Badge>Default</Badge>\n  <Badge variant="secondary">Secondary</Badge>\n  <Badge variant="destructive">Error</Badge>\n  <Badge variant="outline">Outline</Badge>\n</>' },
	],
	ai: {
		whenToUse: "Use for status indicators, tags, counts, categories. Place next to headings, in lists, or in table cells.",
		whenNotToUse: "Don't use for interactive actions (use Button). Don't use for long text content.",
		commonMistakes: ["Using destructive variant for non-error states", "Badge text too long"],
		relatedComponents: ["button", "card"],
		accessibilityNotes: "Purely decorative by default. Add role='status' for dynamic status badges.",
		tokenBudget: 538,
	},
	tags: ["badge", "tag", "status", "label", "indicator"],
};
