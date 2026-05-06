"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "../../components/alert/alert.js";
import { Button } from "../../primitives/button/button.js";
import { Input } from "../../primitives/input/input.js";
import { Label } from "../../primitives/label/label.js";
import { cn } from "../../lib/utils.js";
import type { AuthAdapter } from "../_shared/auth-adapter.js";

export interface AuthResetPasswordProps {
	adapter: AuthAdapter;
	/** Reset token, typically read from `?token=…` by the showcase / consumer route. */
	token: string;
	signInHref?: string;
	passwordMinLength?: number;
	className?: string;
	onSuccess?: (redirect: string | undefined) => void;
}

/**
 * "Reset password" page. Two fields (new password + confirm) with manual
 * confirm-match and minLength validation. The opaque `token` is forwarded
 * verbatim to `adapter.resetPassword`. Routes the consumer-supplied adapter
 * is responsible for binding the token to a user account on the backend.
 */
export function AuthResetPassword({
	adapter,
	token,
	signInHref = "/sign-in",
	passwordMinLength = 8,
	className,
	onSuccess,
}: AuthResetPasswordProps) {
	const [password, setPassword] = React.useState("");
	const [confirmPassword, setConfirmPassword] = React.useState("");
	const [submitting, setSubmitting] = React.useState(false);
	const [error, setError] = React.useState<{ code: string; message: string } | null>(null);

	function validate(): { code: string; message: string } | null {
		if (password.length < passwordMinLength) {
			return {
				code: "password_too_short",
				message: `Password must be at least ${passwordMinLength} characters.`,
			};
		}
		if (password !== confirmPassword) {
			return { code: "password_mismatch", message: "Passwords don't match." };
		}
		if (token.length === 0) {
			return {
				code: "missing_token",
				message: "This reset link is invalid or expired. Request a new one.",
			};
		}
		return null;
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const validation = validate();
		if (validation) {
			setError(validation);
			return;
		}
		if (!adapter.resetPassword) {
			console.warn(
				"[AuthResetPassword] adapter.resetPassword is not implemented — wire it up before exposing the form.",
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
			const result = await adapter.resetPassword({ token, password });
			if (!result.ok) {
				setError(result.error ?? { code: "unknown", message: "Couldn't update password." });
				return;
			}
			onSuccess?.(result.redirect);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className={cn("flex min-h-svh items-center justify-center p-6 sm:p-10", className)}>
			<div className="w-full max-w-sm space-y-6">
				<header className="space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
					<p className="text-sm text-muted-foreground">
						Choose a strong password. You&rsquo;ll be signed in automatically once it&rsquo;s
						saved.
					</p>
				</header>

				{error ? (
					<Alert variant="destructive">
						<AlertTitle>Couldn&rsquo;t update password</AlertTitle>
						<AlertDescription>{error.message}</AlertDescription>
					</Alert>
				) : null}

				<form onSubmit={handleSubmit} className="space-y-4" noValidate>
					<div className="space-y-2">
						<Label htmlFor="auth-reset-password">New password</Label>
						<Input
							id="auth-reset-password"
							type="password"
							autoComplete="new-password"
							required
							minLength={passwordMinLength}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={submitting}
							aria-describedby="auth-reset-password-hint"
						/>
						<p
							id="auth-reset-password-hint"
							className="text-xs text-muted-foreground"
						>
							At least {passwordMinLength} characters.
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="auth-reset-confirm">Confirm new password</Label>
						<Input
							id="auth-reset-confirm"
							type="password"
							autoComplete="new-password"
							required
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={submitting}
						/>
					</div>
					<Button
						type="submit"
						className="w-full"
						disabled={submitting}
						loading={submitting}
					>
						{submitting ? "Saving" : "Save new password"}
					</Button>
				</form>

				<p className="text-center text-sm text-muted-foreground">
					<a
						href={signInHref}
						className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
					>
						Back to sign in
					</a>
				</p>
			</div>
		</div>
	);
}
