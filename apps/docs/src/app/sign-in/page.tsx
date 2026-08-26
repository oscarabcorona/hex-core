import type { Metadata } from "next";
import { AuthShowcase } from "../../components/auth-showcase";
import { authBlock, authMetadata } from "../../lib/auth-showcases";

export const metadata: Metadata = authMetadata("sign-in");

/** Full-bleed showcase route for the `sign-in` auth block. */
export default function Page() {
	return <AuthShowcase block={authBlock("sign-in")} />;
}
