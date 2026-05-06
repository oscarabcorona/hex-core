"use client";

import { AuthResetPassword, mockAuthAdapter } from "../../components/ui";

interface ResetPasswordShowcaseProps {
	token: string;
}

/**
 * Client wrapper for the /reset-password showcase route. Token is read
 * server-side from `searchParams` and passed in; the wrapper owns the
 * mockAuthAdapter binding so adapter functions stay inside the client bundle.
 */
export function ResetPasswordShowcase({ token }: ResetPasswordShowcaseProps) {
	return <AuthResetPassword adapter={mockAuthAdapter} token={token} />;
}
