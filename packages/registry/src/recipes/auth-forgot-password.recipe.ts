import type { RecipeDefinition } from "../recipe-schema.js";

export const authForgotPasswordRecipe: RecipeDefinition = {
	slug: "auth-forgot-password",
	title: "Auth forgot password",
	summary:
		"Single-field 'forgot password' page composing the auth-forgot-password block. Dispatches a reset link via adapter.requestPasswordReset and swaps to a 'check your inbox' state on success.",
	tags: ["auth", "forgot-password", "password-reset", "block", "transactional"],
	brief:
		"Ship a forgot-password page that takes an email, calls my auth library's password-reset endpoint, and shows a 'check your inbox' confirmation when it succeeds.",
	steps: [
		{
			component: "auth-forgot-password",
			reason:
				"The page-level block — manages form-vs-confirmation state, validation, error display.",
			role: "primary",
		},
		{ component: "input", reason: "Email field", role: "supporting" },
		{ component: "label", reason: "Accessible label for the email field", role: "supporting" },
		{ component: "button", reason: "Submit CTA with loading prop", role: "primary" },
		{ component: "alert", reason: "Inline error surface", role: "supporting" },
		{ component: "empty", reason: "Confirmation state ('check your inbox')", role: "supporting" },
	],
	checklist: [
		{
			id: "auth-adapter-wired",
			check:
				"Pass an AuthAdapter via the `adapter` prop with `requestPasswordReset` implemented.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "no-redirect-on-success",
			check:
				"Don't navigate away after success — the block already renders the confirmation state in place. Use `onSuccess` for analytics / toast only.",
			severity: "warn",
			source: "author",
		},
		{
			id: "rate-limit-server-side",
			check:
				"Implement rate-limiting in the adapter / backend, not the block. Returning `{ ok: false, error: { code: 'rate_limited', message: '…' } }` surfaces a friendly Alert.",
			severity: "warn",
			source: "author",
		},
	],
	tokenBudget: 1100,
};
