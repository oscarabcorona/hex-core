"use client";

import { AuthResetPassword, mockAuthAdapter } from "../../components/ui";

/** auth-reset-password demo. Token is hard-coded since this is a static showcase. */
export function AuthResetPasswordDemo() {
	return (
		<div className="overflow-hidden rounded-lg border bg-background">
			<div className="aspect-[4/3] sm:aspect-[16/10]">
				<AuthResetPassword adapter={mockAuthAdapter} token="demo-token" />
			</div>
		</div>
	);
}
