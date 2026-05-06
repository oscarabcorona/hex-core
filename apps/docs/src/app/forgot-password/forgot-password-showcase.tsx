"use client";

import { AuthForgotPassword, mockAuthAdapter } from "../../components/ui";

/**
 * Client wrapper for the /forgot-password showcase route. Owns the
 * mockAuthAdapter binding so adapter functions stay inside the client bundle.
 */
export function ForgotPasswordShowcase() {
	return <AuthForgotPassword adapter={mockAuthAdapter} />;
}
