import type { Metadata } from "next";
import { AuthShowcase } from "../../components/auth-showcase";
import { authBlock, authMetadata } from "../../lib/auth-showcases";

export const metadata: Metadata = authMetadata("verify-email");

/** Full-bleed showcase route for the `verify-email` auth block. */
export default function Page() {
	return <AuthShowcase block={authBlock("verify-email")} />;
}
