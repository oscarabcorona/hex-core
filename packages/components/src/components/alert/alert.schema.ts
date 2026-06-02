import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const alertSchema: ComponentSchemaDefinition = {
	name: "alert",
	displayName: "Alert",
	description: "An inline notification banner for important messages. Supports default and destructive variants with optional leading icon.",
	category: "component",
	subcategory: "feedback",
	props: [
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "default",
			description: "Visual style",
			enumValues: ["default", "destructive"],
		},
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [
		{
			name: "variant",
			description: "Alert style",
			values: [
				{ value: "default", description: "Neutral inline notification" },
				{ value: "destructive", description: "Error or warning with red accent + tinted background" },
			],
			default: "default",
		},
	],
	slots: [
		{
			name: "children",
			description: "Optional icon SVG + AlertTitle + AlertDescription",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["class-variance-authority", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "destructive", "border"],
	examples: [
		{
			title: "Info alert",
			description: "Default alert with title and description",
			code: '<Alert>\n  <AlertTitle>Heads up!</AlertTitle>\n  <AlertDescription>You can add components to your app via the CLI.</AlertDescription>\n</Alert>',
		},
		{
			title: "Destructive alert",
			description: "Error alert",
			code: '<Alert variant="destructive">\n  <AlertTitle>Error</AlertTitle>\n  <AlertDescription>Your session has expired. Please sign in again.</AlertDescription>\n</Alert>',
		},
	],
	ai: {
		whenToUse:
			"Use for inline, persistent messages that contextualize a page or section: info banners, warning about deprecated features, error summaries above forms.",
		whenNotToUse:
			"Don't use for transient messages (use Toast/Sonner). Don't use for modal confirmations (use AlertDialog). Don't use as the only way to communicate a critical error — pair with field-level feedback.",
		commonMistakes: [
			"Using destructive for non-error messages",
			"Missing AlertTitle (reduces scannability)",
			"Stacking multiple Alerts on the same page instead of grouping",
		],
		relatedComponents: ["alert-dialog", "sonner"],
		accessibilityNotes:
			"Root renders role='alert' so screen readers announce it. For non-urgent info banners consider role='status' or aria-live='polite' via className overrides.",
		tokenBudget: 619,
	},
	tags: ["alert", "notification", "banner", "info", "warning", "error"],
};
