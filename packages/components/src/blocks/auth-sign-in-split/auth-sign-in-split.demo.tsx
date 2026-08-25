"use client";

import { AuthSignInSplit, mockAuthAdapter } from "@hex-core/components";

const SOCIAL_PROVIDERS = [
	{ provider: "github", label: "GitHub" },
	{ provider: "google", label: "Google" },
] as const;

/**
 * Auth sign-in (split-screen) demo. Renders the block with the in-memory
 * mockAuthAdapter inside a constrained viewport so the docs page can show it
 * without breaking layout. The full-bleed showcase lives at /sign-in.
 */
export function AuthSignInSplitDemo() {
	return (
		<div className="overflow-hidden rounded-lg border bg-background">
			<div className="aspect-[4/3] sm:aspect-[16/10]">
				<AuthSignInSplit
					adapter={mockAuthAdapter}
					socialProviders={SOCIAL_PROVIDERS}
					brand={
						<strong className="text-sm font-semibold tracking-tight">Hex Core</strong>
					}
					marketing={
						<p className="max-w-xs text-pretty">
							Production-grade components and blocks for spec-driven UI. Sign in to see
							the docs.
						</p>
					}
				/>
			</div>
		</div>
	);
}
