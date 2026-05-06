import type { Metadata } from "next";
import { ResetPasswordShowcase } from "./reset-password-showcase";

export const metadata: Metadata = {
	title: { absolute: "Reset password — Hex Core" },
	description:
		"Live showcase of the auth-reset-password block. Wired to the in-memory mockAuthAdapter — do not enter real credentials.",
};

interface ResetPasswordPageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Full-bleed showcase route for the auth-reset-password block. Reads the
 * `?token=…` query parameter (Next.js 16 — `searchParams` is a Promise) and
 * passes it through to the client wrapper.
 *
 * Falls back to a placeholder `"demo-token"` when the URL is bare so the
 * page renders for the docs / a11y / visual suites. **Real consumers should
 * NOT do this** — they should redirect to `/forgot-password` when the param
 * is missing so the user gets a fresh link instead of attempting reset
 * against an opaque placeholder. The block's own validation surfaces a
 * "link is invalid or expired" error if any falsy token reaches it.
 */
export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
	const params = await searchParams;
	const raw = params.token;
	const token = typeof raw === "string" && raw.length > 0 ? raw : "demo-token";
	return <ResetPasswordShowcase token={token} />;
}
