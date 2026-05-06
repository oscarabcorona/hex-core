"use client";

import { AuthSignUpCard, mockAuthAdapter } from "../../components/ui";

const SOCIAL_PROVIDERS = [
	{ provider: "github", label: "GitHub" },
	{ provider: "google", label: "Google" },
] as const;

/**
 * Client wrapper for the /sign-up showcase route. Owns the mockAuthAdapter
 * binding so adapter functions stay inside the client bundle.
 */
export function SignUpShowcase() {
	return <AuthSignUpCard adapter={mockAuthAdapter} socialProviders={SOCIAL_PROVIDERS} />;
}
