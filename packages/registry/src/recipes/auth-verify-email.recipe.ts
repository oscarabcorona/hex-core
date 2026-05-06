import type { RecipeDefinition } from "../recipe-schema.js";

export const authVerifyEmailRecipe: RecipeDefinition = {
	slug: "auth-verify-email",
	title: "Auth verify email (waiting page)",
	summary:
		"Transactional 'check your inbox' page composed from the auth-verify-email block. Mostly visual — optional resend button calls adapter.resendMagicLink with a client-side cooldown timer.",
	tags: ["auth", "verify-email", "transactional", "block"],
	brief:
		"After signup, route the user to a waiting page that reminds them to click the verification link in their email, with an optional resend button that's rate-limited client-side.",
	steps: [
		{
			component: "auth-verify-email",
			reason:
				"The page-level block — composes Empty for the zero-state-style landmark, optional resend button, cooldown timer, and confirmation Alert.",
			role: "primary",
		},
		{ component: "empty", reason: "Region landmark + 'Check your inbox' title", role: "supporting" },
		{ component: "button", reason: "Resend + 'Back to sign in' CTAs", role: "supporting" },
		{ component: "alert", reason: "Resend-result confirmation + error surface", role: "optional" },
	],
	checklist: [
		{
			id: "pass-email-when-known",
			check:
				"Pass the user's email via the `email` prop so the description names the address explicitly. Both the resend button and the descriptive copy depend on it.",
			severity: "warn",
			source: "author",
		},
		{
			id: "resend-cooldown-not-too-low",
			check:
				"Keep `resendCooldownSeconds` ≥ 10 — lower invites accidental double-sends and trips backend rate limits.",
			severity: "warn",
			source: "author",
		},
		{
			id: "resend-method-or-no-button",
			check:
				"Implement adapter.resendMagicLink to enable the resend button. Without it the button hides automatically; users have no way to retry.",
			severity: "warn",
			source: "author",
		},
		{
			id: "verification-handled-via-link-or-otp",
			check:
				"This block only renders the waiting page. The actual verification happens via the magic-link click (server) or via auth-verify-otp if you also collect a code.",
			severity: "warn",
			source: "author",
		},
	],
	tokenBudget: 1100,
};
