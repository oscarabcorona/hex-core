import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const authVerifyOtpSchema: ComponentSchemaDefinition = {
	name: "auth-verify-otp",
	displayName: "AuthVerifyOtp",
	description:
		"One-time-code verification page. Renders an InputOTP of N slots and auto-submits when the code is full; routes verification through adapter.verifyOtp({ code, intent }). Optional resend button calls adapter.resendOtp.",
	category: "block",
	subcategory: "auth",
	props: [
		{
			name: "adapter",
			type: "object",
			required: true,
			description:
				"AuthAdapter implementation. The block calls adapter.verifyOtp({ code, intent }) when the OTP is full and adapter.resendOtp({ intent }) when the resend button is clicked.",
		},
		{
			name: "intent",
			type: "enum",
			required: true,
			enumValues: ["sign-in", "verify-email", "mfa"],
			description:
				"Reason for the verification. Drives the heading + description copy and is forwarded verbatim to both verifyOtp and resendOtp so consumers can route to the correct backend code.",
		},
		{
			name: "length",
			type: "number",
			required: false,
			default: 6,
			description:
				"Total number of digits in the code. Drives both maxLength on the underlying input-otp library and the number of slots rendered.",
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
				"Called after a successful verification with the adapter's redirect target: (redirect: string | undefined) => void.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-slot", "class-variance-authority", "clsx", "tailwind-merge"],
		internal: [
			"components/alert/alert",
			"components/input-otp/input-otp",
			"primitives/button/button",
		],
		peer: ["react", "react-dom", "input-otp"],
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
			title: "Sign-in OTP (mock adapter)",
			description: "Magic-link or email-OTP sign-in flow with auto-submit when full.",
			code: `import { AuthVerifyOtp, mockAuthAdapter } from "@hex-core/components";

<AuthVerifyOtp adapter={mockAuthAdapter} intent="sign-in" />`,
			composition: ["auth", "verify-otp", "sign-in"],
		},
		{
			title: "MFA challenge",
			description: "Second-factor TOTP entry with intent='mfa'.",
			code: `<AuthVerifyOtp adapter={authAdapter} intent="mfa" />`,
			composition: ["auth", "verify-otp", "mfa"],
		},
	],
	ai: {
		whenToUse:
			"Use whenever you need to verify a 6-digit code (or longer) — sign-in via email OTP, post-signup email verification, or TOTP MFA challenge. The intent prop drives both copy and the adapter routing.",
		whenNotToUse:
			"Don't use for magic-link verification (that lands the user via email click — there's no code to enter). For magic-link wait pages, use auth-verify-email instead.",
		commonMistakes: [
			"Submitting the form yourself — the block already auto-submits when the code reaches `length`. Don't render an extra submit button.",
			"Hard-coding length=6 when the backend expects a different number — drive `length` from the same constant the email/SMS template uses.",
			"Mismatching intent between verifyOtp and resendOtp — the block forwards the same intent to both. If the consumer's adapter routes them differently, that's a bug to fix in the adapter, not the block.",
			"Showing the resend button when adapter.resendOtp isn't implemented — the block already hides it; don't re-implement that gate.",
			"Setting resendCooldownSeconds too low (< 10s) — invites accidental double-sends and tripping rate-limit responses.",
		],
		relatedComponents: [
			"auth-sign-in-split",
			"auth-verify-email",
			"input-otp",
			"button",
			"alert",
		],
		accessibilityNotes:
			"InputOTP is labeled via aria-label='One-time code' so screen readers know what's being entered. Resend button uses the canonical loading prop (sets aria-busy + disabled). Cooldown countdown is reflected in the visible button label. Errors render in an Alert with role='alert'. The OTP value clears on error so users can re-enter without manually deleting digits.",
		tokenBudget: 1040,
	},
	tags: ["block", "auth", "verify-otp", "otp", "mfa", "totp"],
};
