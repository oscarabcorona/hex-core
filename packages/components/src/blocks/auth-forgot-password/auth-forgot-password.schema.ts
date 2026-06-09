import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const authForgotPasswordSchema: ComponentSchemaDefinition = {
	name: "auth-forgot-password",
	displayName: "AuthForgotPassword",
	description:
		"Single-field 'forgot password' page. On submit, dispatches a reset link via adapter.requestPasswordReset and swaps to an Empty-based 'check your inbox' confirmation state.",
	category: "block",
	subcategory: "auth",
	props: [
		{
			name: "adapter",
			type: "object",
			required: true,
			description:
				"AuthAdapter implementation. The block calls adapter.requestPasswordReset({ email }) on submit.",
		},
		{
			name: "signInHref",
			type: "string",
			required: false,
			default: "/sign-in",
			description:
				"Href for the 'Sign in' link rendered below the form and on the confirmation state's CTA.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional classes applied to the outer flex wrapper.",
		},
		{
			name: "onSuccess",
			type: "function",
			required: false,
			description:
				"Called after the reset link is dispatched successfully. Useful for analytics / toast notifications: () => void.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-slot", "class-variance-authority", "clsx", "tailwind-merge"],
		internal: [
			"components/alert/alert",
			"primitives/button/button",
			"primitives/empty/empty",
			"primitives/input/input",
			"primitives/label/label",
		],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [
		"background",
		"foreground",
		"muted",
		"muted-foreground",
		"primary",
		"primary-foreground",
		"destructive",
		"destructive-foreground",
		"border",
		"input",
		"ring",
	],
	examples: [
		{
			title: "Mock adapter (showcase / tests)",
			description:
				"Demo with the in-memory mock adapter — every method resolves ok:true after 400ms.",
			code: `import { AuthForgotPassword, mockAuthAdapter } from "@hex-core/components";

<AuthForgotPassword adapter={mockAuthAdapter} signInHref="/sign-in" />`,
			composition: ["auth", "forgot-password", "form", "transactional"],
		},
	],
	ai: {
		whenToUse:
			"Use whenever you need a 'forgot password' surface. The block handles the dispatch state (form → confirmation) so consumers don't have to manage transitions themselves.",
		whenNotToUse:
			"Don't use for password change while signed in (use a settings panel with the existing form components). Don't use for magic-link login (use auth-sign-in-split with sendMagicLink instead).",
		commonMistakes: [
			"Forgetting to pass the AuthAdapter — the block has no built-in fallback and surfaces an 'unimplemented' error on submit.",
			"Treating onSuccess as a navigation hook — the block already renders the confirmation state in place; onSuccess is for side effects (analytics, toast). Don't navigate away.",
			"Skipping client-side email validation in the adapter — the block already runs an EMAIL_REGEX check before calling the adapter, so the adapter only sees plausibly-shaped emails.",
		],
		relatedComponents: [
			"auth-sign-in-split",
			"auth-reset-password",
			"input",
			"label",
			"button",
			"alert",
			"empty",
		],
		accessibilityNotes:
			"Email input has explicit Label htmlFor pairing, autoComplete='email', and required. Submit button uses the canonical loading prop (sets aria-busy + disabled). The post-submit confirmation state uses the Empty primitive's region landmark with aria-labelledby pointing at the title. Errors render in an Alert with role='alert'.",
		tokenBudget: 706,
	},
	tags: ["block", "auth", "forgot-password", "password-reset", "form", "transactional"],
};
