"use client";

import { AuthVerifyEmail, mockAuthAdapter } from "../../components/ui";

/**
 * Client wrapper for the /verify-email showcase route. Owns the
 * mockAuthAdapter binding so adapter functions stay inside the client bundle.
 */
export function VerifyEmailShowcase() {
	return <AuthVerifyEmail adapter={mockAuthAdapter} email="ada@example.com" />;
}
