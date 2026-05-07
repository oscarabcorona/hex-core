"use client";

import { AuthSignInSplit, mockAuthAdapter } from "../../components/ui";

const SOCIAL_PROVIDERS = [
	{ provider: "github", label: "GitHub" },
	{ provider: "google", label: "Google" },
] as const;

/**
 * Client wrapper for the /sign-in showcase route. The mockAuthAdapter
 * carries async functions that aren't safely serializable across the RSC
 * boundary; declaring this wrapper as `"use client"` keeps the entire
 * adapter binding inside the client bundle. The parent server component
 * still owns `metadata`.
 */
export function SignInShowcase() {
	return (
		<AuthSignInSplit
			adapter={mockAuthAdapter}
			socialProviders={SOCIAL_PROVIDERS}
			brand={
				<div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
					<span
						aria-hidden="true"
						className="inline-flex size-6 items-center justify-center rounded-md bg-foreground text-background"
					>
						◆
					</span>
					Hex Core
				</div>
			}
			marketing={
				<>
					<p className="max-w-sm text-pretty text-base">
						The component layer for spec-driven UI.
					</p>
					<p className="mt-3 max-w-sm text-pretty">
						Hex Core ships production-grade components, blocks, and recipes with
						machine-readable schemas. This showcase is wired to a mock adapter — never
						enter real credentials.
					</p>
				</>
			}
		/>
	);
}
