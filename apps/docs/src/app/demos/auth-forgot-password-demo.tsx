"use client";

import { AuthForgotPassword, mockAuthAdapter } from "../../components/ui";

/** auth-forgot-password demo. Constrained viewport with the in-memory mock adapter. */
export function AuthForgotPasswordDemo() {
	return (
		<div className="overflow-hidden rounded-lg border bg-background">
			<div className="aspect-[4/3] sm:aspect-[16/10]">
				<AuthForgotPassword adapter={mockAuthAdapter} />
			</div>
		</div>
	);
}
