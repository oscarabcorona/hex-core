import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const sonnerSchema: ComponentSchemaDefinition = {
	name: "sonner",
	displayName: "Sonner (Toast)",
	description: "Ephemeral toast notifications via Sonner. Render <Toaster /> once at app root, then call toast() anywhere.",
	category: "component",
	subcategory: "feedback",
	props: [
		{
			name: "position",
			type: "enum",
			required: false,
			default: "bottom-right",
			description: "Where toasts appear on screen",
			enumValues: [
				"top-left",
				"top-center",
				"top-right",
				"bottom-left",
				"bottom-center",
				"bottom-right",
			],
		},
		{
			name: "richColors",
			type: "boolean",
			required: false,
			default: false,
			description: "Enable success/error/warning color variants via toast.success/error/warning",
		},
		{
			name: "closeButton",
			type: "boolean",
			required: false,
			default: false,
			description: "Show a close button on each toast",
		},
		{
			name: "theme",
			type: "enum",
			required: false,
			default: "system",
			description: "Visual theme",
			enumValues: ["light", "dark", "system"],
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["sonner"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "border", "muted", "muted-foreground", "primary", "primary-foreground"],
	examples: [
		{
			title: "App setup + fire toast",
			description: "Render Toaster once, call toast() anywhere",
			code: '// In your root layout:\n<Toaster />\n\n// Anywhere in your app:\nimport { toast } from "@/components/ui/sonner";\n\n<Button onClick={() => toast("Event created", { description: "Friday, Dec 11 at 10:00 AM" })}>\n  Show toast\n</Button>',
		},
	],
	ai: {
		whenToUse:
			"Use for transient feedback: save confirmations, error messages, background task completion. Pairs well with mutation handlers (onSuccess/onError).",
		whenNotToUse:
			"Don't use for persistent info (use Alert). Don't use for destructive confirmations (use AlertDialog). Don't use for critical errors that block user workflow.",
		commonMistakes: [
			"Rendering multiple <Toaster /> components (one is enough)",
			"Calling toast() during server rendering (must be client-side)",
			"Using toast for messages the user needs to re-read (they auto-dismiss)",
		],
		relatedComponents: ["alert", "alert-dialog"],
		accessibilityNotes:
			"Sonner handles aria-live='polite' on the toast region so screen readers announce new toasts. Critical messages should still use Alert/AlertDialog for persistent visibility.",
		tokenBudget: 620,
	},
	tags: ["toast", "sonner", "notification", "transient", "feedback"],
};
