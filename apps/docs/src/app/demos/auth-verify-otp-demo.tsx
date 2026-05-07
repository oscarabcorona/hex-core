"use client";

import { AuthVerifyOtp, mockAuthAdapter } from "../../components/ui";

/** auth-verify-otp demo. Defaults to the sign-in intent so the heading reads naturally. */
export function AuthVerifyOtpDemo() {
	return (
		<div className="overflow-hidden rounded-lg border bg-background">
			<div className="aspect-[4/3] sm:aspect-[16/9]">
				<AuthVerifyOtp adapter={mockAuthAdapter} intent="sign-in" />
			</div>
		</div>
	);
}
