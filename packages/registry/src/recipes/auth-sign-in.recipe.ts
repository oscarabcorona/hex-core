import type { RecipeDefinition } from "../recipe-schema.js";

export const authSignInRecipe: RecipeDefinition = {
	slug: "auth-sign-in",
	title: "Auth sign-in (split-screen)",
	summary:
		"Production-grade sign-in page with optional social providers, remember-me, forgot-password link, and pluggable AuthAdapter for credential routing.",
	tags: ["auth", "sign-in", "login", "block", "split-screen"],
	brief:
		"Ship a sign-in page wired to my auth library — email + password with remember-me, optional GitHub/Google social buttons, forgot-password link, and a real error surface for failed sign-ins.",
	steps: [
		{
			component: "auth-sign-in-split",
			reason:
				"The page-level block — wires the form state, social handoff, error display, and pending state. Routes every credential call through the supplied AuthAdapter.",
			role: "primary",
		},
		{ component: "form", reason: "Field validation + a11y wiring (FormItem / FormControl)", role: "supporting" },
		{ component: "label", reason: "Accessible labels for email + password + remember-me", role: "supporting" },
		{ component: "input", reason: "Email + password fields", role: "supporting" },
		{ component: "checkbox", reason: "Remember-me toggle", role: "supporting" },
		{ component: "button", reason: "Submit + social CTAs (loading prop drives the busy state)", role: "primary" },
		{ component: "alert", reason: "Inline error surface for failed sign-in", role: "supporting" },
		{ component: "separator", reason: "Visual divider between social and credential sections", role: "optional" },
	],
	checklist: [
		{
			id: "auth-adapter-wired",
			check:
				"Pass an AuthAdapter via the `adapter` prop. The block surfaces an 'unimplemented' error if the user submits without one — there is no built-in fallback.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "on-success-handler",
			check:
				"Provide an `onSuccess` handler that navigates the user. The adapter's `redirect` field is informational; the block does not navigate by itself.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "structured-error-payload",
			check:
				"Adapter methods must return `{ ok: false, error: { code, message } }` on failure (never throw). The block reads `error.message` into the Alert; thrown errors lose the structured payload.",
			severity: "warn",
			source: "author",
		},
		{
			id: "social-providers-shape",
			check:
				"socialProviders entries must be `{ provider, label, icon? }`. `provider` is forwarded verbatim to `adapter.signInWithSocial({ provider })`.",
			severity: "warn",
			source: "author",
		},
		{
			id: "marketing-aside-is-decorative",
			check:
				"The left marketing panel is `aria-hidden` so SR users skip directly to the form. Don't put critical info there — duplicate any required text inside the form area.",
			severity: "warn",
			source: "author",
		},
	],
	tokenBudget: 1800,
};
