import type { Metadata } from "next";
import { SignUpShowcase } from "./sign-up-showcase";

export const metadata: Metadata = {
	title: { absolute: "Sign up — Hex Core" },
	description:
		"Live showcase of the auth-sign-up-card block. Wired to the in-memory mockAuthAdapter — do not enter real credentials.",
};

/** Full-bleed showcase route for the auth-sign-up-card block. */
export default function SignUpPage() {
	return <SignUpShowcase />;
}
