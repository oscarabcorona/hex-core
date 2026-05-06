import type { RecipeDefinition } from "../recipe-schema.js";

export const authSignUpRecipe: RecipeDefinition = {
	slug: "auth-sign-up",
	title: "Auth sign-up (centered card)",
	summary:
		"Production-grade sign-up page composing the auth-sign-up-card block. Email + password (with confirm) + optional name + terms checkbox + optional social providers, all routed through a pluggable AuthAdapter.",
	tags: ["auth", "sign-up", "register", "block", "card"],
	brief:
		"Ship a sign-up page wired to my auth library — name (optional) + email + password + confirm password + terms checkbox, with optional GitHub/Google social buttons and a destructive Alert error surface.",
	steps: [
		{
			component: "auth-sign-up-card",
			reason:
				"The page-level block — wires the form state, social handoff, error display, and pending state. Routes account creation through the supplied AuthAdapter.",
			role: "primary",
		},
		{ component: "card", reason: "Centered card chrome", role: "supporting" },
		{ component: "form", reason: "Field a11y wiring (FormItem / FormControl) when consumers extend with RHF", role: "optional" },
		{ component: "label", reason: "Accessible labels for every field", role: "supporting" },
		{ component: "input", reason: "Name + email + password + confirm fields", role: "supporting" },
		{ component: "checkbox", reason: "Terms-of-service consent checkbox", role: "supporting" },
		{ component: "button", reason: "Submit + social CTAs (loading prop drives the busy state)", role: "primary" },
		{ component: "alert", reason: "Inline error surface for failed sign-up", role: "supporting" },
		{ component: "separator", reason: "Visual divider between social and credential sections", role: "optional" },
	],
	checklist: [
		{
			id: "auth-adapter-wired",
			check:
				"Pass an AuthAdapter via the `adapter` prop with `signUpWithPassword` implemented. The block surfaces an 'unimplemented' error if the user submits without it.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "on-success-handler",
			check:
				"Provide an `onSuccess` handler that navigates the user (typically to /verify-email after sign-up). The block does not navigate by itself.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "password-min-length-aligned",
			check:
				"Keep `passwordMinLength` aligned with the auth-reset-password block so users don't hit a stricter rule on reset than they did at signup.",
			severity: "warn",
			source: "author",
		},
		{
			id: "terms-and-privacy-hrefs",
			check:
				"Set `termsHref` and `privacyHref` to your real legal pages. The defaults (/terms, /privacy) are placeholders and will 404 until you add the routes.",
			severity: "warn",
			source: "author",
		},
		{
			id: "structured-error-payload",
			check:
				"Adapter methods must return `{ ok: false, error: { code, message } }` on failure (never throw). The block reads `error.message` into the Alert.",
			severity: "warn",
			source: "author",
		},
	],
	tokenBudget: 2200,
};
