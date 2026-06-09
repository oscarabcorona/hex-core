import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const errorStateSchema: ComponentSchemaDefinition = {
	name: "error-state",
	displayName: "ErrorState",
	description:
		"A surface for failed-fetch / failed-action states. Visually mirrors Empty but with destructive bias and an optional retry button. Mounts with role='alert' so screen readers announce on first render.",
	category: "primitive",
	subcategory: "feedback",
	props: [
		{ name: "icon", type: "ReactNode", required: false, description: "Icon (typically an alert / x-circle SVG)." },
		{ name: "title", type: "ReactNode", required: false, default: "Something went wrong", description: "Heading copy. Falls back to a generic message." },
		{ name: "message", type: "ReactNode", required: true, description: "Body copy explaining what failed and (optionally) what the user can do." },
		{ name: "action", type: "ReactNode", required: false, description: "Call-to-action slot — typically a <Button onClick={refetch}>Retry</Button>. Consumer controls the button variant, loading state, and asChild composition." },
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "default",
			description: "Visual tone — destructive draws more attention, default is calmer.",
			enumValues: ["default", "destructive"],
		},
	],
	variants: [
		{
			name: "variant",
			description: "Tone of the surface.",
			values: [
				{
					value: "default",
					description: "Muted neutral surface — for recoverable / transient failures.",
					useWhen: "the failure is recoverable and you don't want to alarm: 'temporarily unavailable,' 'try again in a moment'",
				},
				{
					value: "destructive",
					description: "Tinted destructive surface — for hard / unrecoverable failures.",
					useWhen: "the failure is significant: data lost, permission denied, server error 5xx",
				},
			],
			default: "default",
		},
	],
	slots: [
		{
			name: "icon",
			description: "Icon rendered in the circular tinted container.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
		{
			name: "action",
			description: "Call-to-action — typically a Button. Consumer composes the button variant + click handler.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["class-variance-authority", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["destructive", "muted", "muted-foreground", "foreground", "border"],
	examples: [
		{
			title: "Fetch failure with retry",
			description: "Couldn't load messages — show the error + a Retry button in the action slot",
			code: '<ErrorState\n  icon={<AlertCircleIcon />}\n  title="Couldn\'t load messages"\n  message="The server didn\'t respond. Check your connection and try again."\n  action={<Button onClick={() => refetch()}>Retry</Button>}\n/>',
			composition: ["error-state", "retry", "fetch-failure"],
		},
		{
			title: "Hard failure (destructive)",
			description: "Server returned 5xx and we want to alarm",
			code: '<ErrorState\n  icon={<XCircleIcon />}\n  variant="destructive"\n  title="Sync failed"\n  message="We couldn\'t save your changes. They\'re still on this device — refresh to retry."\n/>',
			composition: ["error-state", "destructive", "sync-failure"],
		},
	],
	ai: {
		whenToUse:
			"Use for any failure surface where the user might benefit from context + a retry path. Pair with onRetry whenever the operation is genuinely retryable; omit it when the user has to take a different action (e.g. log in again).",
		whenNotToUse:
			"Don't use for inline form-field errors (Form's <FormMessage> handles those). Don't use for blocking destructive confirmations (AlertDialog). Don't use for transient toasts (Sonner / Toaster).",
		commonMistakes: [
			"Generic 'Something went wrong' message without context — at minimum, name what failed",
			"Using destructive variant for recoverable network blips (cries wolf)",
			"Wiring the action's click handler to a function that doesn't actually re-trigger the failed operation",
			"Forgetting the action slot when the failure IS retryable — leaves the user stuck",
		],
		antiPatterns: [
			{
				mistake: "Using ErrorState for an inline form-field validation error",
				insteadUse: "form",
				why: "Form ships <FormMessage> which is wired to the field's aria-describedby. ErrorState announces page-level failures; using it inline duplicates the role='alert' on every keystroke and confuses assistive tech.",
			},
			{
				mistake: "Using ErrorState as a blocking destructive confirmation modal",
				insteadUse: "alert-dialog",
				why: "AlertDialog is role='alertdialog' (modal, focus-trapped, dismiss-on-Escape). ErrorState is a passive surface — no interaction guarantees. If you need the user to confirm before proceeding, use AlertDialog.",
			},
			{
				mistake: "Using ErrorState for a transient toast notification",
				insteadUse: "sonner",
				why: "Sonner / Toaster auto-dismiss + stack + animate. ErrorState sits in the layout. For 'fire-and-forget failure ack,' use the toaster.",
			},
		],
		relatedComponents: ["alert", "alert-dialog", "form", "empty", "loading", "sonner"],
		accessibilityNotes:
			"role='alert' so screen readers announce on first render. Icon decorative (aria-hidden). Retry button uses focus-visible ring; pressing it doesn't dismiss the surface — caller controls that via state.",
		tokenBudget: 1348,
	},
	tags: ["error", "error-state", "failure", "retry", "feedback"],
};
