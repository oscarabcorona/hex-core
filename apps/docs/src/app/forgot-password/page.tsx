import type { Metadata } from "next";
import { ForgotPasswordShowcase } from "./forgot-password-showcase";

export const metadata: Metadata = {
	title: { absolute: "Forgot password — Hex Core" },
	description:
		"Live showcase of the auth-forgot-password block. Wired to the in-memory mockAuthAdapter — do not enter real credentials.",
};

/** Full-bleed showcase route for the auth-forgot-password block. */
export default function ForgotPasswordPage() {
	return <ForgotPasswordShowcase />;
}
