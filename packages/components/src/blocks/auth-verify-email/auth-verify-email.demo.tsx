"use client";

import { AuthVerifyEmail, mockAuthAdapter } from "@hex-core/components";

/** auth-verify-email demo. Constrained viewport with a sample email + resend wired. */
export function AuthVerifyEmailDemo() {
	return (
		<div className="overflow-hidden rounded-lg border bg-background">
			<div className="aspect-[4/3] sm:aspect-[16/9]">
				<AuthVerifyEmail adapter={mockAuthAdapter} email="ada@example.com" />
			</div>
		</div>
	);
}
