import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const authSignUpCardSchema: ComponentSchemaDefinition = {
	name: "auth-sign-up-card",
	displayName: "AuthSignUpCard",
	description:
		"Centered-card sign-up page. Email + password (with confirm) + optional name + terms checkbox + optional social providers. Routes account creation through a consumer-supplied AuthAdapter.",
	category: "block",
	subcategory: "auth",
	props: [
		{
			name: "adapter",
			type: "object",
			required: true,
			description:
				"AuthAdapter implementation. The block calls adapter.signUpWithPassword for the form submit and (if socialProviders are passed) adapter.signInWithSocial.",
		},
		{
			name: "socialProviders",
			type: "object",
			required: false,
			description:
				"ReadonlyArray<{ provider: AuthSocialProvider; label: string; icon?: ReactNode }>. Optional list of social-signup buttons rendered above the email field. Pass an empty array or omit to hide the social section + 'or sign up with email' divider.",
		},
		{
			name: "signInHref",
			type: "string",
			required: false,
			default: "/sign-in",
			description: "Href for the 'Sign in' link rendered in the card footer.",
		},
		{
			name: "termsHref",
			type: "string",
			required: false,
			default: "/terms",
			description: "Href for the 'Terms of Service' link inside the consent checkbox label.",
		},
		{
			name: "privacyHref",
			type: "string",
			required: false,
			default: "/privacy",
			description: "Href for the 'Privacy Policy' link inside the consent checkbox label.",
		},
		{
			name: "passwordMinLength",
			type: "number",
			required: false,
			default: 8,
			description:
				"Minimum password length used by client-side validation and the helper text below the password field.",
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
				"Called after a successful sign-up with the adapter's redirect target: (redirect: string | undefined) => void. The block does not navigate by itself — the consumer's onSuccess handler is what actually navigates.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: [
			"@radix-ui/react-checkbox",
			"@radix-ui/react-label",
			"@radix-ui/react-separator",
			"@radix-ui/react-slot",
			"class-variance-authority",
			"clsx",
			"tailwind-merge",
		],
		internal: [
			"components/alert/alert",
			"components/card/card",
			"primitives/button/button",
			"primitives/checkbox/checkbox",
			"primitives/input/input",
			"primitives/label/label",
			"primitives/separator/separator",
		],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [
		"background",
		"foreground",
		"card",
		"card-foreground",
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
			code: `import { AuthSignUpCard, mockAuthAdapter } from "@hex-core/components";

<AuthSignUpCard
  adapter={mockAuthAdapter}
  socialProviders={[
    { provider: "github", label: "GitHub" },
    { provider: "google", label: "Google" },
  ]}
  signInHref="/sign-in"
  termsHref="/terms"
  privacyHref="/privacy"
/>`,
			composition: ["auth", "sign-up", "form", "card"],
		},
	],
	ai: {
		whenToUse:
			"Use as the default sign-up page when a centered card layout fits your marketing posture. Pairs naturally with auth-sign-in-split: split-screen at sign-in (room for marketing), centered card at sign-up (focus on the form).",
		whenNotToUse:
			"Don't use for in-app account creation modals (use a Dialog with form fields instead). Don't use when you need server-side multi-step onboarding (use an onboarding wizard block — future).",
		commonMistakes: [
			"Forgetting to pass the AuthAdapter — the block has no built-in fallback and surfaces an 'unimplemented' error on submit.",
			"Skipping onSuccess and relying on adapter.redirect alone — the redirect is informational; the consumer's onSuccess handler is what actually navigates.",
			"Wiring auth state inside the adapter methods instead of returning { ok, error } — the block reads result.error.message into the Alert; throwing inside the adapter loses the structured payload.",
			"Setting termsHref / privacyHref to absolute URLs when in-app routes exist — they're plain anchor hrefs; prefer relative paths so the consumer's router handles navigation.",
			"Forgetting that name is optional — passing required={true} on the name field would lock out users who don't want to share it; the block already treats name as optional and trims whitespace before forwarding.",
		],
		relatedComponents: [
			"auth-sign-in-split",
			"card",
			"form",
			"input",
			"label",
			"checkbox",
			"button",
			"alert",
			"separator",
		],
		accessibilityNotes:
			"All inputs have explicit Label htmlFor pairing, autoComplete='email' / 'new-password', and required attributes where relevant. The password helper text is wired via aria-describedby. Submit button uses the canonical loading prop (sets aria-busy + disabled). Errors render in an Alert with role='alert' so they're announced. Terms checkbox label is clickable and the legal links remain reachable by keyboard.",
		tokenBudget: 1149,
	},
	tags: ["block", "auth", "sign-up", "register", "form", "card"],
};
