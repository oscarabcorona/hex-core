import type { Metadata } from "next";
import { VerifyOtpShowcase } from "./verify-otp-showcase";

export const metadata: Metadata = {
	title: { absolute: "Verify OTP — Hex Core" },
	description:
		"Live showcase of the auth-verify-otp block. Wired to the in-memory mockAuthAdapter — do not enter real credentials.",
};

/** Full-bleed showcase route for the auth-verify-otp block. */
export default function VerifyOtpPage() {
	return <VerifyOtpShowcase />;
}
