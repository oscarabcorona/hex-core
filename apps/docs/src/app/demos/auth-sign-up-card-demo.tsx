"use client";

import { AuthSignUpCard, mockAuthAdapter } from "../../components/ui";

const SOCIAL_PROVIDERS = [
	{ provider: "github", label: "GitHub" },
	{ provider: "google", label: "Google" },
] as const;

/** auth-sign-up-card demo. Constrained viewport with the in-memory mock adapter. */
export function AuthSignUpCardDemo() {
	return (
		<div className="overflow-hidden rounded-lg border bg-background">
			<div className="aspect-[4/5] sm:aspect-[16/12]">
				<AuthSignUpCard adapter={mockAuthAdapter} socialProviders={SOCIAL_PROVIDERS} />
			</div>
		</div>
	);
}
