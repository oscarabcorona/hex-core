import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const authVerifyEmailSchema: ComponentSchemaDefinition = {
	name: "auth-verify-email",
	displayName: "AuthVerifyEmail",
	description:
		"Transactional 'verify your email' page composed from the Empty primitive. Optional resend button calls adapter.resendMagicLink with a client-side cooldown timer; resend hides automatically when the adapter doesn't implement the method.",
	category: "block",
	subcategory: "auth",
	props: [
		{
			name: "adapter",
			type: "object",
			required: true,
			description:
				"AuthAdapter implementation. The block calls adapter.resendMagicLink({ email }) when the resend button is clicked. Both the method and the email prop must be present for the resend button to render.",
		},
		{
			name: "email",
			type: "string",
			required: false,
			description:
				"Email address shown in the description copy ('we sent a link to <email>') and forwarded to adapter.resendMagicLink. Omit when the address isn't known on the client; the description copy then falls back to a generic line and the resend button is hidden.",
		},
		{
			name: "resendCooldownSeconds",
			type: "number",
			required: false,
			default: 30,
			description:
				"Seconds the resend button stays disabled after each successful resend. Counter ticks down every second while > 0.",
		},
		{
			name: "signInHref",
			type: "string",
			required: false,
			default: "/sign-in",
			description: "Href for the 'Back to sign in' link rendered next to the resend button.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional classes applied to the outer flex wrapper.",
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
		"ring",
	],
	examples: [
		{
			title: "Mock adapter with resend",
			description:
				"Demo with the in-memory mock adapter — the resend button is shown because both `email` and `adapter.resendMagicLink` are available.",
			code: `import { AuthVerifyEmail, mockAuthAdapter } from "@hex-core/components";

<AuthVerifyEmail adapter={mockAuthAdapter} email="ada@example.com" />`,
			composition: ["auth", "verify-email", "transactional"],
		},
		{
			title: "Without resend (unknown email)",
			description: "Resend button hidden when no email is passed.",
			code: `<AuthVerifyEmail adapter={mockAuthAdapter} />`,
			composition: ["auth", "verify-email", "transactional"],
		},
	],
	ai: {
		whenToUse:
			"Use right after sign-up when account activation requires an email link. Pair with an email-template the consumer owns — Hex Core only renders the waiting page, never the email itself.",
		whenNotToUse:
			"Don't use for OTP-style verification (use auth-verify-otp instead). Don't use as a generic 'check your inbox' message after forgot-password — that's already built into auth-forgot-password's success state.",
		commonMistakes: [
			"Showing the resend button when adapter.resendMagicLink isn't implemented — the block already hides it automatically; don't re-implement that gate.",
			"Treating resendMagicLink and the initial sendMagicLink as interchangeable — the dedicated resend method exists so consumers can throttle resends differently and surface different analytics.",
			"Setting resendCooldownSeconds too low (< 10s) — invites accidental double-sends and tripping rate-limit responses on the consumer's auth backend.",
			"Hard-coding email when it's unknown to the route — pass undefined instead so the description falls back to a generic line and the resend button hides.",
		],
		relatedComponents: [
			"auth-sign-up-card",
			"auth-verify-otp",
			"empty",
			"button",
			"alert",
		],
		accessibilityNotes:
			"The Empty primitive provides a region landmark with aria-labelledby pointing at the title — screen readers announce 'Check your inbox' as the section heading. Resend button uses the canonical loading prop (sets aria-busy + disabled). The cooldown countdown is reflected in the visible button label, so SR users hear 'Resend available in 28s' as the timer ticks.",
		tokenBudget: 1100,
	},
	tags: ["block", "auth", "verify-email", "transactional", "empty-state"],
};
