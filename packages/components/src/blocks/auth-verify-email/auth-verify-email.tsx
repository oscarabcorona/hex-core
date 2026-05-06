"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "../../components/alert/alert.js";
import { Empty } from "../../primitives/empty/empty.js";
import { Button } from "../../primitives/button/button.js";
import { cn } from "../../lib/utils.js";
import type { AuthAdapter } from "../_shared/auth-adapter.js";

export interface AuthVerifyEmailProps {
	adapter: AuthAdapter;
	/** Optional address shown in the description ("we sent a link to <email>"). */
	email?: string;
	/** Seconds to disable the resend button after each successful resend. */
	resendCooldownSeconds?: number;
	/** Href for the "Back to sign in" affordance. */
	signInHref?: string;
	className?: string;
}

const MailIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<rect width={20} height={16} x={2} y={4} rx={2} />
		<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
	</svg>
);

/**
 * Transactional "verify your email" page. Mostly visual — composes the
 * `Empty` primitive with a mail icon plus an optional resend button. The
 * resend button is hidden when `adapter.resendMagicLink` is absent. Rate-
 * limit pressure handled client-side via a cooldown timer.
 */
export function AuthVerifyEmail({
	adapter,
	email,
	resendCooldownSeconds = 30,
	signInHref = "/sign-in",
	className,
}: AuthVerifyEmailProps) {
	const [resending, setResending] = React.useState(false);
	const [cooldownLeft, setCooldownLeft] = React.useState(0);
	const [error, setError] = React.useState<{ code: string; message: string } | null>(null);
	const [confirmation, setConfirmation] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (cooldownLeft <= 0) return;
		const timer = setTimeout(() => setCooldownLeft((s) => s - 1), 1000);
		return () => clearTimeout(timer);
	}, [cooldownLeft]);

	const canResend = Boolean(adapter.resendMagicLink) && Boolean(email);

	async function handleResend() {
		if (!email) return;
		if (!adapter.resendMagicLink) {
			console.warn(
				"[AuthVerifyEmail] adapter.resendMagicLink is not implemented — hide the resend button or wire the method.",
			);
			setError({
				code: "unimplemented",
				message: "Resending is currently unavailable. Please try again later.",
			});
			return;
		}
		setError(null);
		setConfirmation(null);
		setResending(true);
		try {
			const result = await adapter.resendMagicLink({ email });
			if (!result.ok) {
				setError(result.error ?? { code: "unknown", message: "Couldn't resend the link." });
				return;
			}
			setConfirmation("We sent another link. It may take a minute to arrive.");
			setCooldownLeft(resendCooldownSeconds);
		} finally {
			setResending(false);
		}
	}

	const description: React.ReactNode = email ? (
		<>
			We sent a verification link to{" "}
			<strong className="text-foreground">{email}</strong>. Click the link to activate your
			account. Links expire in 60 minutes.
		</>
	) : (
		<>
			Click the link in the verification email we just sent to activate your account. Links
			expire in 60 minutes.
		</>
	);

	const cooldownLabel =
		cooldownLeft > 0 ? `Resend available in ${cooldownLeft}s` : "Resend email";

	return (
		<div className={cn("flex min-h-svh items-center justify-center p-6 sm:p-10", className)}>
			<div className="w-full max-w-sm space-y-4">
				{error ? (
					<Alert variant="destructive">
						<AlertTitle>Couldn&rsquo;t resend the link</AlertTitle>
						<AlertDescription>{error.message}</AlertDescription>
					</Alert>
				) : null}
				{confirmation ? (
					// `role="status"` + `aria-live="polite"` overrides the Alert
					// component's default `role="alert"` so the resend confirmation
					// is announced politely rather than interrupting the screen
					// reader (the action succeeded — it's not urgent).
					<Alert role="status" aria-live="polite">
						<AlertTitle>Link resent</AlertTitle>
						<AlertDescription>{confirmation}</AlertDescription>
					</Alert>
				) : null}

				<Empty
					icon={<MailIcon />}
					title="Check your inbox"
					description={description}
					action={
						<div className="flex flex-wrap items-center justify-center gap-2">
							{canResend ? (
								<Button
									type="button"
									variant="outline"
									onClick={handleResend}
									disabled={resending || cooldownLeft > 0}
									loading={resending}
								>
									{cooldownLabel}
								</Button>
							) : null}
							<Button variant="ghost" asChild>
								<a href={signInHref}>Back to sign in</a>
							</Button>
						</div>
					}
				/>
			</div>
		</div>
	);
}
