import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const authResetPasswordSchema: ComponentSchemaDefinition = {
	name: "auth-reset-password",
	displayName: "AuthResetPassword",
	description:
		"'Set a new password' page paired with a reset link. Two fields (new password + confirm) with manual confirm-match validation; the opaque token is forwarded verbatim to adapter.resetPassword.",
	category: "block",
	subcategory: "auth",
	props: [
		{
			name: "adapter",
			type: "object",
			required: true,
			description:
				"AuthAdapter implementation. The block calls adapter.resetPassword({ token, password }) on submit.",
		},
		{
			name: "token",
			type: "string",
			required: true,
			description:
				"Reset token forwarded verbatim to adapter.resetPassword. Typically read from a `?token=…` URL parameter by the consumer's route. The block does NOT validate the token shape — that's the adapter's responsibility.",
		},
		{
			name: "signInHref",
			type: "string",
			required: false,
			default: "/sign-in",
			description: "Href for the 'Back to sign in' link rendered below the form.",
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
				"Called after the password is updated successfully with the adapter's redirect target: (redirect: string | undefined) => void.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-slot", "class-variance-authority", "clsx", "tailwind-merge"],
		internal: [
			"components/alert/alert",
			"primitives/button/button",
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
			description: "Demo with the in-memory mock adapter; pass any non-empty token.",
			code: `import { AuthResetPassword, mockAuthAdapter } from "@hex-core/components";

// Token typically comes from useSearchParams() or page-level searchParams prop.
<AuthResetPassword adapter={mockAuthAdapter} token="demo-token" />`,
			composition: ["auth", "reset-password", "form"],
		},
		{
			title: "Reading the token from Next.js searchParams",
			description:
				"In an App Router page, await searchParams server-side and pass the token through to a client wrapper that owns the AuthAdapter binding.",
			code: `export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return <ResetPasswordClient token={token} />;
}`,
			composition: ["auth", "reset-password", "next-app-router"],
		},
	],
	ai: {
		whenToUse:
			"Use as the destination of the reset link sent by auth-forgot-password. Pair the two: forgot dispatches the link, this block consumes the token from the URL and lets the user pick a new password.",
		whenNotToUse:
			"Don't use to validate the token — that's the adapter's job. Don't use for in-app password change while signed in (use a settings panel with the form components instead).",
		commonMistakes: [
			"Hard-coding `token` to an empty string when the URL param is absent — the block surfaces a 'link is invalid or expired' error, but the consumer should redirect to /forgot-password instead. Read searchParams in the route and pass it through.",
			"Validating the token shape inside the block — the block treats it as opaque on purpose. Validate inside adapter.resetPassword and surface the error via { ok: false, error }.",
			"Skipping onSuccess and relying on adapter.redirect alone — the redirect is informational; the consumer's onSuccess handler is what actually navigates after the password is saved.",
			"Setting passwordMinLength inconsistently between sign-up and reset-password — keep them aligned (both default to 8) so users don't hit a stricter check on reset than they did on signup.",
		],
		relatedComponents: [
			"auth-forgot-password",
			"auth-sign-in-split",
			"input",
			"label",
			"button",
			"alert",
		],
		accessibilityNotes:
			"Both inputs use autoComplete='new-password' and have explicit Label htmlFor pairing. The password helper text is wired via aria-describedby. Submit button uses the canonical loading prop (sets aria-busy + disabled). Errors render in an Alert with role='alert' so they're announced.",
		tokenBudget: 1040,
	},
	tags: ["block", "auth", "reset-password", "password", "form"],
};
