"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "../../components/alert/alert.js";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "../../components/input-otp/input-otp.js";
import { Button } from "../../primitives/button/button.js";
import { cn } from "../../lib/utils.js";
import type { AuthAdapter, AuthOtpIntent } from "../_shared/auth-adapter.js";

export interface AuthVerifyOtpProps {
	adapter: AuthAdapter;
	/** Forwarded verbatim to adapter.verifyOtp({ code, intent }). */
	intent: AuthOtpIntent;
	/** Total number of digits in the code. Defaults to 6. */
	length?: number;
	/** Seconds the resend button stays disabled after each successful resend. */
	resendCooldownSeconds?: number;
	className?: string;
	onSuccess?: (redirect: string | undefined) => void;
}

const HEADINGS: Record<AuthOtpIntent, { title: string; description: string }> = {
	"sign-in": {
		title: "Enter your sign-in code",
		description: "We sent a 6-digit code to your email or phone. Enter it below to sign in.",
	},
	"verify-email": {
		title: "Verify your email",
		description: "Enter the 6-digit code we sent to confirm your email address.",
	},
	mfa: {
		title: "Two-factor authentication",
		description: "Enter the 6-digit code from your authenticator app.",
	},
};

/**
 * One-time-code verification page. Renders an `InputOTP` of `length` slots
 * and submits automatically when the code is full. Routes verification
 * through `adapter.verifyOtp({ code, intent })`. Optional resend button
 * calls `adapter.resendOtp({ intent })` when implemented.
 */
export function AuthVerifyOtp({
	adapter,
	intent,
	length = 6,
	resendCooldownSeconds = 30,
	className,
	onSuccess,
}: AuthVerifyOtpProps) {
	const [code, setCode] = React.useState("");
	const [submitting, setSubmitting] = React.useState(false);
	const [resending, setResending] = React.useState(false);
	const [cooldownLeft, setCooldownLeft] = React.useState(0);
	const [error, setError] = React.useState<{ code: string; message: string } | null>(null);
	// Dedup guard for the auto-submit effect.
	//
	// The effect depends on `submitting` so it can short-circuit while a
	// request is in flight. After the request resolves, `submitting` flips
	// false → the effect re-runs → the same `code` value is still full → it
	// would auto-submit again. The ref captures the value we last dispatched
	// so a second pass is a no-op. Reset back to "" on error (alongside
	// `setCode("")`) so the user can re-enter the same digits without the
	// guard short-circuiting.
	const lastSubmittedRef = React.useRef<string>("");

	React.useEffect(() => {
		if (cooldownLeft <= 0) return;
		const timer = setTimeout(() => setCooldownLeft((s) => s - 1), 1000);
		return () => clearTimeout(timer);
	}, [cooldownLeft]);

	const handleSubmit = React.useCallback(
		async (codeToSubmit: string) => {
			if (!adapter.verifyOtp) {
				console.warn(
					"[AuthVerifyOtp] adapter.verifyOtp is not implemented — wire it up before exposing the form.",
				);
				setError({
					code: "unimplemented",
					message: "Verification is currently unavailable. Please try again later.",
				});
				return;
			}
			setError(null);
			setSubmitting(true);
			try {
				const result = await adapter.verifyOtp({ code: codeToSubmit, intent });
				if (!result.ok) {
					setError(
						result.error ?? { code: "unknown", message: "Couldn't verify code." },
					);
					// Reset both the visible value and the dedup ref so the user can
					// re-enter the same digits without the effect short-circuiting.
					setCode("");
					lastSubmittedRef.current = "";
					return;
				}
				onSuccess?.(result.redirect);
			} finally {
				setSubmitting(false);
			}
		},
		[adapter, intent, onSuccess],
	);

	// Auto-submit when the code reaches full length. Guarded by a ref so the
	// effect doesn't re-fire when `submitting` flips back to false after the
	// request resolves — `setCode("")` on error already gives a fresh attempt.
	React.useEffect(() => {
		if (code.length !== length) return;
		if (submitting) return;
		if (lastSubmittedRef.current === code) return;
		lastSubmittedRef.current = code;
		void handleSubmit(code);
	}, [code, length, submitting, handleSubmit]);

	async function handleResend() {
		if (!adapter.resendOtp) {
			console.warn(
				"[AuthVerifyOtp] adapter.resendOtp is not implemented — hide the resend button or wire the method.",
			);
			setError({
				code: "unimplemented",
				message: "Resending is currently unavailable. Please try again later.",
			});
			return;
		}
		setError(null);
		setResending(true);
		try {
			const result = await adapter.resendOtp({ intent });
			if (!result.ok) {
				setError(result.error ?? { code: "unknown", message: "Couldn't resend code." });
				return;
			}
			setCooldownLeft(resendCooldownSeconds);
			setCode("");
		} finally {
			setResending(false);
		}
	}

	const heading = HEADINGS[intent];
	const slots = React.useMemo(
		() => Array.from({ length }, (_, i) => i),
		[length],
	);
	const cooldownLabel =
		cooldownLeft > 0 ? `Resend in ${cooldownLeft}s` : "Resend code";

	return (
		<div className={cn("flex min-h-svh items-center justify-center p-6 sm:p-10", className)}>
			<div className="w-full max-w-sm space-y-6">
				<header className="space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">{heading.title}</h1>
					<p className="text-sm text-muted-foreground">{heading.description}</p>
				</header>

				{error ? (
					<Alert variant="destructive">
						<AlertTitle>Couldn&rsquo;t verify code</AlertTitle>
						<AlertDescription>{error.message}</AlertDescription>
					</Alert>
				) : null}

				<div className="flex flex-col items-center gap-4">
					<InputOTP
						maxLength={length}
						value={code}
						onChange={setCode}
						disabled={submitting}
						aria-label="One-time code"
					>
						<InputOTPGroup>
							{slots.map((i) => (
								<InputOTPSlot key={i} index={i} />
							))}
						</InputOTPGroup>
					</InputOTP>

					{adapter.resendOtp ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleResend}
							disabled={resending || cooldownLeft > 0 || submitting}
							loading={resending}
						>
							{cooldownLabel}
						</Button>
					) : null}
				</div>
			</div>
		</div>
	);
}
