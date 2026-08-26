import type { Metadata } from "next";
import { AuthShowcase } from "../../components/auth-showcase";
import { authBlock, authMetadata } from "../../lib/auth-showcases";

export const metadata: Metadata = authMetadata("verify-otp");

/** Full-bleed showcase route for the `verify-otp` auth block. */
export default function Page() {
	return <AuthShowcase block={authBlock("verify-otp")} />;
}
