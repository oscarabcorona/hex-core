import type { Metadata } from "next";
import { SignInShowcase } from "./sign-in-showcase";

export const metadata: Metadata = {
	title: { absolute: "Sign in — Hex Core" },
	description:
		"Live showcase of the auth-sign-in-split block. Wired to the in-memory mockAuthAdapter — do not enter real credentials.",
};

/**
 * Full-bleed showcase route for the `auth-sign-in-split` block. Server
 * component owns `metadata`; rendering is delegated to a sibling client
 * wrapper so the `mockAuthAdapter` (which carries async functions that
 * aren't safely serializable across the RSC boundary) stays inside the
 * client bundle.
 */
export default function SignInPage() {
	return <SignInShowcase />;
}
