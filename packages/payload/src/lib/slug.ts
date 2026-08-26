/**
 * Slug ⇄ display-text helpers.
 *
 * These had drifted into a handful of private copies — `titleFromSlug` in
 * `builders/map.ts` and `titleCase` in `scripts/build-graph.ts` had
 * byte-identical bodies, and `map.ts` and `poc.ts` each carried their own
 * kebab-slugifier with the same CodeQL ReDoS workaround pasted into both.
 */

/**
 * Title-case a slug for display: `"pricing-page"` → `"Pricing page"`.
 * @param slug - Lowercase, possibly hyphenated string
 * @returns The string with hyphens spaced and its first letter uppercased
 */
export function titleFromSlug(slug: string): string {
	const spaced = slug.replace(/-/g, " ");
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Slugify arbitrary text into a lowercase hyphenated id.
 *
 * The trimming is deliberately written as two bounded replacements rather
 * than `/^-+|-+$/`: the character collapse above leaves no adjacent
 * hyphens, and the anchored `+` form backtracks polynomially on a long
 * interior hyphen run (CodeQL `js/polynomial-redos`, ~96ms at 16k chars).
 * @param input - Arbitrary text
 * @param options - Length cap and the fallback used when nothing survives
 * @returns A lowercase hyphenated slug, never empty
 */
export function slugify(
	input: string,
	options: { maxLength?: number; fallback?: string } = {},
): string {
	const { maxLength, fallback = "item" } = options;

	let raw = input
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^(?:a|an|the)-/, "")
		.replace(/^-/, "")
		.replace(/-$/, "");

	if (maxLength !== undefined && raw.length > maxLength) {
		// Cut at a word boundary so ids never end mid-word.
		const cut = raw.slice(0, maxLength);
		raw = cut.includes("-") ? cut.slice(0, cut.lastIndexOf("-")) : cut;
	}

	return raw.length > 0 ? raw : fallback;
}
