/**
 * Parse a Hex Core Studio URL into a `base` preset slug + a
 * `ThemeOverrides`-compatible token override map.
 *
 * URL contract (defined by the CLI; Studio is expected to emit this
 * shape):
 *
 *   https://www.hex-core.dev/studio
 *     ?base=midnight                     ← preset slug to start from
 *     &mode=light                        ← informational; per-key suffix
 *                                          drives which slot is written
 *     &<key>_light=<HSL-triplet>         ← e.g. background_light=220+31%25+61%25
 *     &<key>_dark=<HSL-triplet>          ← e.g. primary_dark=240+50%25+50%25
 *     &radius=<rem>                      ← e.g. radius=0.825 (no unit;
 *                                          we append "rem" if missing)
 *     &density=<compact|default|spacious>
 *                                        ← currently informational; the
 *                                          theme model has no `density` slot
 *
 * HSL triplets are URL-encoded as `H+S%25+L%25` and decoded back to
 * the canonical `"H S% L%"` form before being placed in token slots.
 */

const HOST_ALLOWLIST = new Set(["hex-core.dev", "www.hex-core.dev", "localhost", "127.0.0.1"]);

/** Inputs we accept as the "value" half of a token override URL param. */
const TRIPLET_PATTERN = /^[\d.]+\s+[\d.]+%\s+[\d.]+%$/;

export interface StudioParse {
	/** Slug of the preset to extend (validated by caller against the registry). */
	base: string;
	/** `light` overrides as `{ [tokenName]: { value, type: "color"|"radius"|... } }`. */
	light: Record<string, { value: string; type: string }>;
	/** `dark` overrides, same shape. */
	dark: Record<string, { value: string; type: string }>;
	/** Soft warnings the caller should print but not error on. */
	warnings: string[];
}

/**
 * Decode an HSL triplet from a URL param value. The Studio URL emits
 * `220+31%25+61%25` (space-as-`+`, percent-encoded), which `URLSearchParams`
 * decodes to `"220 31% 61%"` for us — we just validate and trim.
 */
function decodeTriplet(raw: string): string | null {
	const trimmed = raw.trim();
	if (TRIPLET_PATTERN.test(trimmed)) return trimmed;
	return null;
}

/**
 * Parse a Studio URL string into the data needed to feed `extendTheme`.
 * Throws via `process.exit(1)` on host/scheme violations — fetching an
 * arbitrary URL would be a footgun even though we never actually fetch.
 */
export function parseStudioUrl(input: string): StudioParse {
	let url: URL;
	try {
		url = new URL(input);
	} catch {
		throw new Error(`Invalid --from URL: ${input}`);
	}
	if (url.protocol !== "https:" && url.protocol !== "http:") {
		throw new Error(`--from must be an http(s) URL, got ${url.protocol}.`);
	}
	if (!HOST_ALLOWLIST.has(url.hostname)) {
		throw new Error(
			`--from host "${url.hostname}" is not allowed. Use a hex-core.dev or localhost URL.`,
		);
	}

	const params = url.searchParams;
	const base = params.get("base");
	if (!base) {
		throw new Error(`--from URL is missing required "base" param.`);
	}

	const result: StudioParse = { base, light: {}, dark: {}, warnings: [] };

	for (const [key, rawValue] of params.entries()) {
		if (key === "base" || key === "mode") continue;

		if (key === "radius") {
			const value = rawValue.trim();
			const withUnit = /[a-z%]/i.test(value) ? value : `${value}rem`;
			result.light.radius = { value: withUnit, type: "radius" };
			result.dark.radius = { value: withUnit, type: "radius" };
			continue;
		}

		if (key === "density") {
			result.warnings.push(
				`density="${rawValue}" was provided but the theme model has no density slot yet — ignored.`,
			);
			continue;
		}

		const match = key.match(/^(.+)_(light|dark)$/);
		if (!match) {
			result.warnings.push(`Unknown URL param "${key}" — ignored.`);
			continue;
		}
		const [, tokenName, mode] = match;
		const triplet = decodeTriplet(rawValue);
		if (!triplet) {
			result.warnings.push(
				`${key}="${rawValue}" is not a valid HSL triplet (expected "H S% L%") — ignored.`,
			);
			continue;
		}
		const slot = mode === "light" ? result.light : result.dark;
		slot[tokenName] = { value: triplet, type: "color" };
	}

	return result;
}
