import type { RecipeDefinition } from "../recipe-schema.js";

export const authResetPasswordRecipe: RecipeDefinition = {
	slug: "auth-reset-password",
	title: "Auth reset password",
	summary:
		"'Set a new password' page paired with a reset link. Composes the auth-reset-password block; the opaque token (typically from a `?token=…` URL parameter) is forwarded verbatim to adapter.resetPassword.",
	tags: ["auth", "reset-password", "password", "block"],
	brief:
		"Ship a reset-password page that accepts a token (from URL params), takes a new password + confirm, and calls my auth library's reset endpoint.",
	steps: [
		{
			component: "auth-reset-password",
			reason:
				"The page-level block — wires confirm-match validation, the opaque token, error display, and success redirect.",
			role: "primary",
		},
		{ component: "input", reason: "New password + confirm password fields", role: "supporting" },
		{ component: "label", reason: "Accessible labels for the password fields", role: "supporting" },
		{ component: "button", reason: "Submit CTA with loading prop", role: "primary" },
		{ component: "alert", reason: "Inline error surface", role: "supporting" },
	],
	checklist: [
		{
			id: "read-token-from-search-params",
			check:
				"Read `?token=…` in your route (Next.js: server-component `searchParams`; client: useSearchParams) and pass it as the `token` prop. The block treats the value as opaque.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "auth-adapter-wired",
			check:
				"Pass an AuthAdapter via the `adapter` prop with `resetPassword` implemented.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "token-validation-server-side",
			check:
				"Validate the token inside `adapter.resetPassword`, never inside the block. Surface expiry / mismatch via `{ ok: false, error }`.",
			severity: "warn",
			source: "author",
		},
		{
			id: "password-min-length-aligned",
			check:
				"Keep `passwordMinLength` aligned with auth-sign-up-card so users don't face a stricter rule on reset than they did at signup.",
			severity: "warn",
			source: "author",
		},
		{
			id: "redirect-to-sign-in-on-success",
			check:
				"Wire `onSuccess` to navigate to `/sign-in` (or call your auto-sign-in flow). The block does not navigate by itself.",
			severity: "warn",
			source: "author",
		},
	],
	tokenBudget: 1300,
};
