"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "../../components/alert/alert.js";
import { Empty } from "../../primitives/empty/empty.js";
import { Button } from "../../primitives/button/button.js";
import { Input } from "../../primitives/input/input.js";
import { Label } from "../../primitives/label/label.js";
import { cn } from "../../lib/utils.js";
import type { AuthAdapter } from "../_shared/auth-adapter.js";

export interface AuthForgotPasswordProps {
	adapter: AuthAdapter;
	signInHref?: string;
	className?: string;
	onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
 * "Forgot password" page. Single email field; on success swaps to a
 * confirmation state composed from `Empty` ("we sent you a link") plus a
 * "back to sign in" affordance. Routes the dispatch through
 * `adapter.requestPasswordReset`.
 */
export function AuthForgotPassword({
	adapter,
	signInHref = "/sign-in",
	className,
	onSuccess,
}: AuthForgotPasswordProps) {
	const [email, setEmail] = React.useState("");
	const [submitting, setSubmitting] = React.useState(false);
	const [error, setError] = React.useState<{ code: string; message: string } | null>(null);
	const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!EMAIL_REGEX.test(email)) {
			setError({ code: "invalid_email", message: "Enter a valid email address." });
			return;
		}
		if (!adapter.requestPasswordReset) {
			console.warn(
				"[AuthForgotPassword] adapter.requestPasswordReset is not implemented — wire it up before exposing the form.",
			);
			setError({
				code: "unimplemented",
				message: "Password reset is currently unavailable. Please try again later.",
			});
			return;
		}
		setError(null);
		setSubmitting(true);
		try {
			const result = await adapter.requestPasswordReset({ email });
			if (!result.ok) {
				setError(result.error ?? { code: "unknown", message: "Couldn't send reset link." });
				return;
			}
			setSubmittedEmail(email);
			onSuccess?.();
		} finally {
			setSubmitting(false);
		}
	}

	if (submittedEmail) {
		return (
			<div
				className={cn(
					"flex min-h-svh items-center justify-center p-6 sm:p-10",
					className,
				)}
			>
				<div className="w-full max-w-sm">
					<Empty
						icon={<MailIcon />}
						title="Check your inbox"
						description={
							<>
								We sent a password-reset link to{" "}
								<strong className="text-foreground">{submittedEmail}</strong>. The
								link expires in 60 minutes.
							</>
						}
						action={
							<Button variant="outline" asChild>
								<a href={signInHref}>Back to sign in</a>
							</Button>
						}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("flex min-h-svh items-center justify-center p-6 sm:p-10", className)}>
			<div className="w-full max-w-sm space-y-6">
				<header className="space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
					<p className="text-sm text-muted-foreground">
						Enter your email and we&rsquo;ll send you a link to set a new password.
					</p>
				</header>

				{error ? (
					<Alert variant="destructive">
						<AlertTitle>Couldn&rsquo;t send reset link</AlertTitle>
						<AlertDescription>{error.message}</AlertDescription>
					</Alert>
				) : null}

				<form onSubmit={handleSubmit} className="space-y-4" noValidate>
					<div className="space-y-2">
						<Label htmlFor="auth-forgot-email">Email</Label>
						<Input
							id="auth-forgot-email"
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={submitting}
						/>
					</div>
					<Button
						type="submit"
						className="w-full"
						disabled={submitting}
						loading={submitting}
					>
						{submitting ? "Sending link" : "Send reset link"}
					</Button>
				</form>

				<p className="text-center text-sm text-muted-foreground">
					Remembered your password?{" "}
					<a
						href={signInHref}
						className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
					>
						Sign in
					</a>
				</p>
			</div>
		</div>
	);
}
