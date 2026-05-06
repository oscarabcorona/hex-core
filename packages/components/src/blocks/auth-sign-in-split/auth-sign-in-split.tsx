"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "../../components/alert/alert.js";
import { Button } from "../../primitives/button/button.js";
import { Checkbox } from "../../primitives/checkbox/checkbox.js";
import { Input } from "../../primitives/input/input.js";
import { Label } from "../../primitives/label/label.js";
import { Separator } from "../../primitives/separator/separator.js";
import { cn } from "../../lib/utils.js";
import type { AuthAdapter, AuthSocialProvider } from "../_shared/auth-adapter.js";

export interface AuthSignInSocialProvider {
	provider: AuthSocialProvider;
	label: string;
	icon?: React.ReactNode;
}

export interface AuthSignInSplitProps {
	/** Wires every credential / OAuth call to the consumer's auth library. */
	adapter: AuthAdapter;
	/** Optional list of social-login buttons rendered above the email field. */
	socialProviders?: ReadonlyArray<AuthSignInSocialProvider>;
	/** Brand block (logo + product name) shown at the top of the marketing panel. */
	brand?: React.ReactNode;
	/** Marketing copy / quote / illustration shown below the brand block. */
	marketing?: React.ReactNode;
	/** Href for the "Sign up" link rendered below the form. */
	signUpHref?: string;
	/** Href for the "Forgot?" link inline with the password label. */
	forgotPasswordHref?: string;
	/** Additional classes applied to the root grid wrapper. */
	className?: string;
	/** Called after a successful sign-in (any flow) with the adapter's redirect target. */
	onSuccess?: (redirect: string | undefined) => void;
}

type Submitting = null | "password" | AuthSocialProvider;

/**
 * Split-screen sign-in page. Marketing panel on the left (≥lg), credential
 * form on the right. All submit paths route through the supplied
 * `AuthAdapter` — Hex Core never touches credentials directly.
 */
export function AuthSignInSplit({
	adapter,
	socialProviders,
	brand,
	marketing,
	signUpHref = "/sign-up",
	forgotPasswordHref = "/forgot-password",
	className,
	onSuccess,
}: AuthSignInSplitProps) {
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [remember, setRemember] = React.useState(false);
	const [submitting, setSubmitting] = React.useState<Submitting>(null);
	const [error, setError] = React.useState<{ code: string; message: string } | null>(null);

	const isBusy = submitting !== null;

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!adapter.signInWithPassword) {
			console.warn(
				"[AuthSignInSplit] adapter.signInWithPassword is not implemented — wire it up before exposing the form.",
			);
			setError({ code: "unimplemented", message: "Sign-in is currently unavailable. Please try again later." });
			return;
		}
		setError(null);
		setSubmitting("password");
		try {
			const result = await adapter.signInWithPassword({ email, password, remember });
			if (!result.ok) {
				setError(result.error ?? { code: "unknown", message: "Sign-in failed." });
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
				`[AuthSignInSplit] adapter.signInWithSocial is not implemented but a ${provider} button is rendered — drop the entry from socialProviders or wire the method.`,
			);
			setError({
				code: "unimplemented",
				message: "This sign-in option is currently unavailable. Please try a different method.",
			});
			return;
		}
		setError(null);
		setSubmitting(provider);
		try {
			const result = await adapter.signInWithSocial({ provider });
			if (!result.ok) {
				setError(result.error ?? { code: "social-failed", message: "Sign-in failed." });
				return;
			}
			onSuccess?.(result.redirect);
		} finally {
			setSubmitting(null);
		}
	}

	return (
		<div className={cn("grid min-h-svh lg:grid-cols-2", className)}>
			<aside
				aria-hidden="true"
				className="hidden flex-col justify-between bg-muted/40 p-10 lg:flex"
			>
				<div>{brand}</div>
				<div className="text-sm text-muted-foreground">{marketing}</div>
			</aside>
			<main className="flex items-center justify-center p-6 sm:p-10">
				<div className="w-full max-w-sm space-y-6">
					<header className="space-y-2 text-center lg:text-left">
						<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
						<p className="text-sm text-muted-foreground">
							Sign in to your account to continue.
						</p>
					</header>

					{error ? (
						<Alert variant="destructive">
							<AlertTitle>Sign-in failed</AlertTitle>
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
								<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs uppercase text-muted-foreground">
									or
								</span>
							</div>
						</>
					) : null}

					<form onSubmit={handleSubmit} className="space-y-4" noValidate>
						<div className="space-y-2">
							<Label htmlFor="auth-sign-in-email">Email</Label>
							<Input
								id="auth-sign-in-email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isBusy}
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="auth-sign-in-password">Password</Label>
								<a
									href={forgotPasswordHref}
									className="text-xs text-muted-foreground transition-all duration-200 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									Forgot?
								</a>
							</div>
							<Input
								id="auth-sign-in-password"
								type="password"
								autoComplete="current-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={isBusy}
							/>
						</div>
						<div className="flex items-center gap-2">
							<Checkbox
								id="auth-sign-in-remember"
								checked={remember}
								onCheckedChange={(v) => setRemember(v === true)}
								disabled={isBusy}
							/>
							<Label htmlFor="auth-sign-in-remember" className="text-sm font-normal">
								Remember me on this device
							</Label>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isBusy}
							loading={submitting === "password"}
						>
							{submitting === "password" ? "Signing in" : "Sign in"}
						</Button>
					</form>

					<p className="text-center text-sm text-muted-foreground lg:text-left">
						Don&rsquo;t have an account?{" "}
						<a
							href={signUpHref}
							className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
						>
							Sign up
						</a>
					</p>
				</div>
			</main>
		</div>
	);
}
