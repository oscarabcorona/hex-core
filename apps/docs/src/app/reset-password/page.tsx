import type { Metadata } from "next";
import { AuthShowcase } from "../../components/auth-showcase";
import { authBlock, authMetadata } from "../../lib/auth-showcases";

export const metadata: Metadata = authMetadata("reset-password");

/** Full-bleed showcase route for the `reset-password` auth block. */
export default function Page() {
	return <AuthShowcase block={authBlock("reset-password")} />;
}
