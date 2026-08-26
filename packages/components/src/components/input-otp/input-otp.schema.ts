import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const inputOTPSchema: ComponentSchemaDefinition = {
	name: "input-otp",
	displayName: "Input OTP",
	description:
		"One-time-password / verification-code entry built on the input-otp library. Renders N character slots with active/caret state and auto-advance on type.",
	category: "component",
	subcategory: "forms",
	props: [
		{
			name: "maxLength",
			type: "number",
			required: true,
			description: "Total number of slots (typically 4–8 for OTPs)",
		},
		{
			name: "value",
			type: "string",
			required: false,
			description: "Controlled value — the current entered string",
		},
		{
			name: "onChange",
			type: "function",
			required: false,
			description: "Callback fired as the user types: (value: string) => void",
		},
		{
			name: "onComplete",
			type: "function",
			required: false,
			description: "Called when all slots are filled (useful to auto-submit)",
		},
		{
			name: "pattern",
			type: "string",
			required: false,
			description:
				"Regex to restrict input (use REGEXP_ONLY_DIGITS, REGEXP_ONLY_CHARS, or REGEXP_ONLY_DIGITS_AND_CHARS)",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable the whole input",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "InputOTPGroup with InputOTPSlot index={0..maxLength-1}, optional InputOTPSeparator",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["input-otp", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["input", "ring", "background", "foreground", "muted-foreground"],
	examples: [
		{
			title: "6-digit OTP with separator",
			description: "Two groups of 3 slots divided by a bullet",
			code: 'import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@hex-core/components";\nimport { REGEXP_ONLY_DIGITS } from "input-otp";\n\n<InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS}>\n  <InputOTPGroup>\n    <InputOTPSlot index={0} />\n    <InputOTPSlot index={1} />\n    <InputOTPSlot index={2} />\n  </InputOTPGroup>\n  <InputOTPSeparator />\n  <InputOTPGroup>\n    <InputOTPSlot index={3} />\n    <InputOTPSlot index={4} />\n    <InputOTPSlot index={5} />\n  </InputOTPGroup>\n</InputOTP>',
		},
	],
	ai: {
		whenToUse:
			"Use for one-time password, email verification code, 2FA code, or any fixed-length code entry. Auto-advances on type, supports paste of the full code, and supports regex validation.",
		whenNotToUse:
			"Don't use for variable-length codes (use a plain Input). Don't use for passwords (use Input type='password'). Don't use for open-ended short text — the slot UI implies a code.",
		commonMistakes: [
			"Forgetting to render maxLength slots — the underlying input's maxLength won't match the visible UI",
			"Using pattern without importing one of the REGEXP_ONLY_* constants from 'input-otp'",
			"Wrapping the whole thing in a <form> without a submit handler — onComplete is often a better auto-submit hook",
			"Overriding slot className in a way that removes the first/last border-radius rules",
		],
		relatedComponents: ["input", "form"],
		accessibilityNotes:
			"input-otp manages a single hidden <input> so screen readers hear one field of N characters. Each slot is a visual representation. The active slot gets a focus ring via the ring token.",
		tokenBudget: 902,
	},
	tags: ["input-otp", "otp", "verification", "2fa", "code", "pin"],
};
