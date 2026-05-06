"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "../../components/alert/alert.js";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../../components/card/card.js";
import { Button } from "../../primitives/button/button.js";
import { Checkbox } from "../../primitives/checkbox/checkbox.js";
import { Input } from "../../primitives/input/input.js";
import { Label } from "../../primitives/label/label.js";
import { Separator } from "../../primitives/separator/separator.js";
import { cn } from "../../lib/utils.js";
import type { AuthAdapter, AuthSocialProvider } from "../_shared/auth-adapter.js";

export interface AuthSignUpCardSocialProvider {
	provider: AuthSocialProvider;
	label: string;
	icon?: React.ReactNode;
}

export interface AuthSignUpCardProps {
	adapter: AuthAdapter;
	socialProviders?: ReadonlyArray<AuthSignUpCardSocialProvider>;
	signInHref?: string;
	termsHref?: string;
	privacyHref?: string;
	passwordMinLength?: number;
	className?: string;
	onSuccess?: (redirect: string | undefined) => void;
}

type Submitting = null | "password" | AuthSocialProvider;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Centered-card sign-up page. Composes Card + form fields + optional social. */
export function AuthSignUpCard({
	adapter,
	socialProviders,
	signInHref = "/sign-in",
	termsHref = "/terms",
	privacyHref = "/privacy",
	passwordMinLength = 8,
	className,
	onSuccess,
}: AuthSignUpCardProps) {
	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [confirmPassword, setConfirmPassword] = React.useState("");
	const [acceptTerms, setAcceptTerms] = React.useState(false);
	const [submitting, setSubmitting] = React.useState<Submitting>(null);
	const [error, setError] = React.useState<{ code: string; message: string } | null>(null);

	const isBusy = submitting !== null;

	function validate(): { code: string; message: string } | null {
		if (!EMAIL_REGEX.test(email)) {
			return { code: "invalid_email", message: "Enter a valid email address." };
		}
		if (password.length < passwordMinLength) {
			return {
				code: "password_too_short",
				message: `Password must be at least ${passwordMinLength} characters.`,
			};
		}
		if (password !== confirmPassword) {
			return { code: "password_mismatch", message: "Passwords don't match." };
		}
		if (!acceptTerms) {
			return {
				code: "terms_required",
				message: "Please accept the terms of service to continue.",
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
		if (!adapter.signUpWithPassword) {
			console.warn(
				"[AuthSignUpCard] adapter.signUpWithPassword is not implemented — wire it up before exposing the form.",
			);
			setError({
				code: "unimplemented",
				message: "Sign-up is currently unavailable. Please try again later.",
			});
			return;
		}
		setError(null);
		setSubmitting("password");
		try {
			const result = await adapter.signUpWithPassword({
				email,
				password,
				name: name.trim().length > 0 ? name.trim() : undefined,
			});
			if (!result.ok) {
				setError(result.error ?? { code: "unknown", message: "Sign-up failed." });
				return;
			}
			onSuccess?.(result.redirect);
		} finally {
			setSubmitting(null);
		}
	}

	async function handleSocial(provider: AuthSocialProvider) {
		if (!adapter.signInWithSocial) {
			console.warn(
				`[AuthSignUpCard] adapter.signInWithSocial is not implemented but a ${provider} button is rendered — drop the entry from socialProviders or wire the method.`,
			);
			setError({
				code: "unimplemented",
				message: "This sign-up option is currently unavailable. Please try a different method.",
			});
			return;
		}
		setError(null);
		setSubmitting(provider);
		try {
			const result = await adapter.signInWithSocial({ provider });
			if (!result.ok) {
				setError(result.error ?? { code: "social-failed", message: "Sign-up failed." });
				return;
			}
			onSuccess?.(result.redirect);
		} finally {
			setSubmitting(null);
		}
	}

	return (
		<div className={cn("flex min-h-svh items-center justify-center p-6 sm:p-10", className)}>
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-2 text-center">
					<CardTitle className="text-2xl">Create your account</CardTitle>
					<CardDescription>Get started in seconds — no credit card required.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{error ? (
						<Alert variant="destructive">
							<AlertTitle>Couldn&rsquo;t create account</AlertTitle>
							<AlertDescription>{error.message}</AlertDescription>
						</Alert>
					) : null}

					{socialProviders && socialProviders.length > 0 ? (
						<>
							<div className="grid gap-2">
								{socialProviders.map((p) => (
									<Button
										key={p.provider}
										type="button"
										variant="outline"
										onClick={() => handleSocial(p.provider)}
										disabled={isBusy}
										loading={submitting === p.provider}
										className="w-full justify-center gap-2"
									>
										{p.icon}
										<span>Continue with {p.label}</span>
									</Button>
								))}
							</div>
							<div className="relative">
								<Separator />
								<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs uppercase text-muted-foreground">
									or sign up with email
								</span>
							</div>
						</>
					) : null}

					<form onSubmit={handleSubmit} className="space-y-4" noValidate>
						<div className="space-y-2">
							<Label htmlFor="auth-sign-up-name">
								Full name <span className="text-muted-foreground">(optional)</span>
							</Label>
							<Input
								id="auth-sign-up-name"
								type="text"
								autoComplete="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={isBusy}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="auth-sign-up-email">Email</Label>
							<Input
								id="auth-sign-up-email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isBusy}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="auth-sign-up-password">Password</Label>
							<Input
								id="auth-sign-up-password"
								type="password"
								autoComplete="new-password"
								required
								minLength={passwordMinLength}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={isBusy}
								aria-describedby="auth-sign-up-password-hint"
							/>
							<p
								id="auth-sign-up-password-hint"
								className="text-xs text-muted-foreground"
							>
								At least {passwordMinLength} characters.
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="auth-sign-up-confirm">Confirm password</Label>
							<Input
								id="auth-sign-up-confirm"
								type="password"
								autoComplete="new-password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								disabled={isBusy}
							/>
						</div>
						<div className="flex items-start gap-2">
							<Checkbox
								id="auth-sign-up-terms"
								checked={acceptTerms}
								onCheckedChange={(v) => setAcceptTerms(v === true)}
								disabled={isBusy}
								className="mt-0.5"
							/>
							<Label
								htmlFor="auth-sign-up-terms"
								className="text-sm font-normal leading-snug"
							>
								I agree to the{" "}
								<a
									href={termsHref}
									className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									Terms of Service
								</a>{" "}
								and{" "}
								<a
									href={privacyHref}
									className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									Privacy Policy
								</a>
								.
							</Label>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isBusy}
							loading={submitting === "password"}
						>
							{submitting === "password" ? "Creating account" : "Create account"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="justify-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<a
						href={signInHref}
						className="ml-1 font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
					>
						Sign in
					</a>
				</CardFooter>
			</Card>
		</div>
	);
}
