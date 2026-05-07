"use client";

import { AuthVerifyOtp, mockAuthAdapter } from "../../components/ui";

/**
 * Client wrapper for the /verify-otp showcase route. Owns the
 * mockAuthAdapter binding so adapter functions stay inside the client bundle.
 */
export function VerifyOtpShowcase() {
	return <AuthVerifyOtp adapter={mockAuthAdapter} intent="sign-in" />;
}
