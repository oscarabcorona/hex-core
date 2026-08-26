"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
	AuthForgotPassword,
	AuthResetPassword,
	AuthSignInSplit,
	AuthSignUpCard,
	AuthVerifyEmail,
	AuthVerifyOtp,
	mockAuthAdapter,
} from "./ui";

const SOCIAL_PROVIDERS = [
	{ provider: "github", label: "GitHub" },
	{ provider: "google", label: "Google" },
] as const;

interface AuthShowcaseProps {
	/** Registry name of the block to render. */
	block: string;
}

const BRAND = (
	<div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
		<span
			aria-hidden="true"
			className="inline-flex size-6 items-center justify-center rounded-md bg-foreground text-background"
		>
			◆
		</span>
		Hex Core
	</div>
);

const MARKETING = (
	<>
		<p className="max-w-sm text-pretty text-base">The component layer for spec-driven UI.</p>
		<p className="mt-3 max-w-sm text-pretty">
			Hex Core ships production-grade components, blocks, and recipes with machine-readable
			schemas. This showcase is wired to a mock adapter — never enter real credentials.
		</p>
	</>
);

/**
 * Renders one auth block against the mock adapter.
 *
 * This is a client component because `mockAuthAdapter` carries async
 * functions that aren't safely serializable across the RSC boundary —
 * keeping the binding here holds it inside the client bundle while the
 * route's server component still owns `metadata`.
 * @param props - Which block to render
 * @returns The rendered block, or null for an unknown block name
 */
export function AuthShowcase({ block }: AuthShowcaseProps) {
	if (block === "auth-reset-password") {
		// `useSearchParams` suspends during prerender; the boundary lets the
		// rest of the route stay statically generated.
		return (
			<Suspense fallback={null}>
				<ResetPasswordShowcase />
			</Suspense>
		);
	}

	switch (block) {
		case "auth-sign-in-split":
			return (
				<AuthSignInSplit
					adapter={mockAuthAdapter}
					socialProviders={SOCIAL_PROVIDERS}
					brand={BRAND}
					marketing={MARKETING}
				/>
			);
		case "auth-sign-up-card":
			return <AuthSignUpCard adapter={mockAuthAdapter} socialProviders={SOCIAL_PROVIDERS} />;
		case "auth-forgot-password":
			return <AuthForgotPassword adapter={mockAuthAdapter} />;
		case "auth-verify-email":
			return <AuthVerifyEmail adapter={mockAuthAdapter} email="ada@example.com" />;
		case "auth-verify-otp":
			return <AuthVerifyOtp adapter={mockAuthAdapter} intent="sign-in" />;
		default:
			return null;
	}
}

/**
 * Reset-password showcase, which is the only block that reads the query
 * string.
 *
 * Falls back to a placeholder token when the URL is bare so the page
 * renders for the docs / a11y / visual suites. **Real consumers should NOT
 * do this** — redirect to `/forgot-password` when the param is missing so
 * the user gets a fresh link instead of attempting a reset against an
 * opaque placeholder. The block surfaces a "link is invalid or expired"
 * error for any falsy token that does reach it.
 * @returns The rendered block
 */
function ResetPasswordShowcase() {
	const raw = useSearchParams().get("token");
	const token = raw !== null && raw.length > 0 ? raw : "demo-token";
	return <AuthResetPassword adapter={mockAuthAdapter} token={token} />;
}
