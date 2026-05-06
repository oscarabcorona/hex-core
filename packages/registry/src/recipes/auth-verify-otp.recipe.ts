import type { RecipeDefinition } from "../recipe-schema.js";

export const authVerifyOtpRecipe: RecipeDefinition = {
	slug: "auth-verify-otp",
	title: "Auth verify OTP",
	summary:
		"6-digit (configurable) one-time-code verification page. Composes the auth-verify-otp block which auto-submits when the code is full and routes verification through adapter.verifyOtp({ code, intent }).",
	tags: ["auth", "verify-otp", "otp", "mfa", "totp", "block"],
	brief:
		"Build an OTP entry page for sign-in via email/SMS code, post-signup email verification, or TOTP MFA challenge. Drive the heading + adapter routing from the `intent` prop.",
	steps: [
		{
			component: "auth-verify-otp",
			reason:
				"The page-level block — manages the InputOTP value, auto-submit when full, error reset on failure, and resend cooldown.",
			role: "primary",
		},
		{ component: "input-otp", reason: "Slot-based OTP input", role: "supporting" },
		{ component: "button", reason: "Resend CTA with cooldown", role: "supporting" },
		{ component: "alert", reason: "Inline error surface", role: "supporting" },
	],
	checklist: [
		{
			id: "auth-adapter-wired",
			check:
				"Pass an AuthAdapter via the `adapter` prop with `verifyOtp` implemented. The block surfaces an 'unimplemented' error after the user types the full code.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "intent-matches-backend-route",
			check:
				"`intent` is forwarded verbatim to both verifyOtp and resendOtp. Make sure your adapter routes each intent value to the correct backend endpoint.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "length-matches-template",
			check:
				"`length` (default 6) must match the digit count your email / SMS template generates. Mismatched lengths leave the form unsubmittable.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "no-extra-submit-button",
			check:
				"Don't render a manual Submit button — the block auto-submits when the code reaches `length`. A second button confuses users and creates a double-call risk.",
			severity: "warn",
			source: "author",
		},
		{
			id: "resend-cooldown-not-too-low",
			check:
				"Keep `resendCooldownSeconds` ≥ 10 — lower invites accidental double-sends.",
			severity: "warn",
			source: "author",
		},
	],
	tokenBudget: 1300,
};
