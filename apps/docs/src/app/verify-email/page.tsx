import type { Metadata } from "next";
import { VerifyEmailShowcase } from "./verify-email-showcase";

export const metadata: Metadata = {
	title: { absolute: "Verify your email — Hex Core" },
	description:
		"Live showcase of the auth-verify-email block. Wired to the in-memory mockAuthAdapter — do not enter real credentials.",
};

/** Full-bleed showcase route for the auth-verify-email block. */
export default function VerifyEmailPage() {
	return <VerifyEmailShowcase />;
}
