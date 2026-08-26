import type { Metadata } from "next";
import { AuthShowcase } from "../../components/auth-showcase";
import { authBlock, authMetadata } from "../../lib/auth-showcases";

export const metadata: Metadata = authMetadata("sign-up");

/** Full-bleed showcase route for the `sign-up` auth block. */
export default function Page() {
	return <AuthShowcase block={authBlock("sign-up")} />;
}
