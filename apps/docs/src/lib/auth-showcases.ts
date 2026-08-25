/**
 * The auth block showcase routes, as data.
 *
 * Six routes used to be twelve files — a `page.tsx` and a
 * `<name>-showcase.tsx` each — differing only in a title string, a
 * description string and which block they rendered. `CLAUDE.md` lists that
 * exact shape as a review blocker: multiple page files following an
 * identical template belong in a dynamic route driven by data.
 *
 * Each entry drives the route's static param, its metadata, and which
 * block `AuthShowcase` renders.
 */
export interface AuthShowcase {
	/** URL segment and `generateStaticParams` value. */
	slug: string;
	/** Page title, rendered absolute (no " — Hex Core" suffix appended twice). */
	title: string;
	/** Registry name of the block this route showcases. */
	block: string;
}

export const AUTH_SHOWCASES: readonly AuthShowcase[] = [
	{ slug: "sign-in", title: "Sign in", block: "auth-sign-in-split" },
	{ slug: "sign-up", title: "Sign up", block: "auth-sign-up-card" },
	{ slug: "forgot-password", title: "Forgot password", block: "auth-forgot-password" },
	{ slug: "reset-password", title: "Reset password", block: "auth-reset-password" },
	{ slug: "verify-email", title: "Verify your email", block: "auth-verify-email" },
	{ slug: "verify-otp", title: "Verify OTP", block: "auth-verify-otp" },
];

/**
 * Look up a showcase by its URL segment.
 * @param slug - The route segment
 * @returns The showcase config, or undefined for an unknown segment
 */
export function getAuthShowcase(slug: string): AuthShowcase | undefined {
	return AUTH_SHOWCASES.find((entry) => entry.slug === slug);
}

/**
 * Metadata description for a showcase route.
 *
 * Every one of these pages is wired to the in-memory `mockAuthAdapter`, so
 * the warning is part of the contract rather than per-page prose.
 * @param showcase - The showcase config
 * @returns The meta description
 */
export function authDescription(showcase: AuthShowcase): string {
	return (
		`Live showcase of the ${showcase.block} block. Wired to the in-memory ` +
		"mockAuthAdapter — do not enter real credentials."
	);
}

/**
 * Build a route's `metadata` export from its showcase config.
 *
 * Next.js requires one file per route, so the six showcase routes stay six
 * files — but they hold no content of their own. Title, description and
 * which block to render all come from {@link AUTH_SHOWCASES}, and the
 * rendering comes from a single `AuthShowcase` component.
 *
 * A root-level `[block]` catch-all would collapse the files too, but it
 * would also match every other single-segment route on the site
 * (`/store`, `/docs`, `/landing`) — `@next/next/no-html-link-for-pages`
 * flags exactly that.
 * @param slug - The route segment
 * @returns Next.js metadata for the route
 * @throws When the slug has no showcase entry
 */
export function authMetadata(slug: string): {
	title: { absolute: string };
	description: string;
} {
	const showcase = getAuthShowcase(slug);
	if (!showcase) throw new Error(`No auth showcase registered for "${slug}"`);
	return {
		title: { absolute: `${showcase.title} — Hex Core` },
		description: authDescription(showcase),
	};
}

/**
 * Resolve the block name a showcase route renders.
 * @param slug - The route segment
 * @returns The registry block name
 * @throws When the slug has no showcase entry
 */
export function authBlock(slug: string): string {
	const showcase = getAuthShowcase(slug);
	if (!showcase) throw new Error(`No auth showcase registered for "${slug}"`);
	return showcase.block;
}
