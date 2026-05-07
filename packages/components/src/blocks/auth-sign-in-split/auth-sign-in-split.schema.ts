import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const authSignInSplitSchema: ComponentSchemaDefinition = {
	name: "auth-sign-in-split",
	displayName: "AuthSignInSplit",
	description:
		"Split-screen sign-in page. Marketing panel on the left (≥lg), credential form on the right. Routes every credential / OAuth call through a consumer-supplied AuthAdapter.",
	category: "block",
	subcategory: "auth",
	props: [
		{
			name: "adapter",
			type: "object",
			required: true,
			description:
				"AuthAdapter implementation. The block calls adapter.signInWithPassword and (if socialProviders are passed) adapter.signInWithSocial. Hex Core never touches credentials directly.",
		},
		{
			name: "socialProviders",
			type: "object",
			required: false,
			description:
				"ReadonlyArray<{ provider: AuthSocialProvider; label: string; icon?: ReactNode }>. List of social-login buttons rendered above the email field. The `provider` value is forwarded verbatim to adapter.signInWithSocial({ provider }). Pass an empty array or omit the prop to hide the social section and the 'or' divider.",
		},
		{
			name: "brand",
			type: "ReactNode",
			required: false,
			description: "Brand block (logo + product name) shown at the top of the marketing panel.",
		},
		{
			name: "marketing",
			type: "ReactNode",
			required: false,
			description: "Marketing copy / quote / illustration shown below the brand block.",
		},
		{
			name: "signUpHref",
			type: "string",
			required: false,
			default: "/sign-up",
			description: "Href for the 'Sign up' link rendered below the form.",
		},
		{
			name: "forgotPasswordHref",
			type: "string",
			required: false,
			default: "/forgot-password",
			description: "Href for the 'Forgot?' link inline with the password label.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional classes applied to the root grid wrapper.",
		},
		{
			name: "onSuccess",
			type: "function",
			required: false,
			description:
				"Called after a successful sign-in (any flow) with the adapter's redirect target: (redirect: string | undefined) => void.",
		},
	],
	variants: [],
	slots: [
		{
			name: "brand",
			description: "Optional brand block in the marketing panel.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
		{
			name: "marketing",
			description: "Optional marketing copy / quote in the marketing panel.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
	],
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
			description: "Demo with the in-memory mock adapter — every method resolves ok:true after 400ms.",
			code: `import { AuthSignInSplit, mockAuthAdapter } from "@hex-core/components";

<AuthSignInSplit
  adapter={mockAuthAdapter}
  brand={<strong>Acme</strong>}
  marketing="The fastest way to ship spec-driven UI."
  socialProviders={[
    { provider: "github", label: "GitHub" },
    { provider: "google", label: "Google" },
  ]}
/>`,
			composition: ["auth", "sign-in", "form", "split-screen"],
		},
		{
			title: "Real provider (better-auth)",
			description: "Wire better-auth's email/password and social methods through the AuthAdapter contract.",
			code: `import { AuthSignInSplit, type AuthAdapter } from "@hex-core/components";
import { authClient } from "@/lib/auth-client";

const adapter: AuthAdapter = {
  async signInWithPassword({ email, password, remember }) {
    const res = await authClient.signIn.email({ email, password, rememberMe: remember });
    if (res.error) return { ok: false, error: { code: res.error.code, message: res.error.message } };
    return { ok: true, redirect: "/app" };
  },
  async signInWithSocial({ provider }) {
    await authClient.signIn.social({ provider });
    return { ok: true };
  },
};

<AuthSignInSplit adapter={adapter} />`,
			composition: ["auth", "sign-in", "better-auth"],
		},
	],
	ai: {
		whenToUse:
			"Use as the default sign-in page when you have meaningful marketing copy or a brand panel to show alongside the form. The split layout earns its keep on desktop; on mobile it collapses cleanly to the form-only view.",
		whenNotToUse:
			"Don't use for in-app re-auth modals (use a Dialog with form fields instead). Don't use when the marketing panel would be empty — drop to a centered single-column block.",
		commonMistakes: [
			"Forgetting to pass the AuthAdapter — the block has no built-in fallback and will surface 'unimplemented' errors when the user submits.",
			"Hard-coding signUpHref / forgotPasswordHref to absolute URLs — they're plain anchor hrefs, prefer in-app relative paths so the consumer's router handles navigation.",
			"Skipping onSuccess and relying on adapter.redirect alone — the redirect is informational; the consumer's onSuccess handler is what actually navigates.",
			"Wiring auth state inside the adapter methods instead of returning { ok, error } — the block reads the result and shows the error Alert; throwing inside the adapter loses the structured error payload.",
		],
		relatedComponents: ["form", "input", "label", "checkbox", "button", "alert", "separator"],
		accessibilityNotes:
			"Form inputs have explicit Label htmlFor pairing, autoComplete='email' / 'current-password', and required attributes. Submit button uses the canonical loading prop (sets aria-busy + disabled). Errors render in an Alert with role='alert' so they're announced. Marketing aside is aria-hidden so screen-reader users don't traverse decorative copy before reaching the form.",
		tokenBudget: 1800,
	},
	tags: ["block", "auth", "sign-in", "login", "form", "split-screen"],
};
