import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS conflict resolution.
 * @param inputs - Class values (strings, arrays, objects) to merge
 * @returns A single merged class string with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const SAFE_URL_SCHEMES = ["http:", "https:", "mailto:"] as const;

/**
 * Allowlist a URL for use as an `<a href>` against untrusted input.
 *
 * Returns the raw string when it's `http(s):` / `mailto:` / a relative
 * URL (no scheme); returns `undefined` otherwise. Defends against
 * `javascript:` / `data:` / `vbscript:` injection from streamed model
 * output or third-party JSON payloads that flow into citation chips.
 *
 * Inside a Markdown render path, `rehype-sanitize` already strips
 * `javascript:` from inline-link hrefs — but it does NOT introspect
 * JSON nested inside attribute values (e.g. `<sources data='[…]'/>`),
 * so the components that consume that data must guard themselves.
 *
 * @param raw - The candidate URL, or `undefined` when none was supplied.
 * @returns The URL when safe to render, otherwise `undefined`.
 */
export function safeUrl(raw: string | undefined): string | undefined {
	if (raw === undefined || raw === "") return undefined;
	// Relative URLs have no scheme — `new URL(relative)` throws without a base,
	// so a thrown URL means either malformed input OR a relative path. Treat
	// "throws + does not contain a colon" as a relative path (safe).
	let parsed: URL;
	try {
		parsed = new URL(raw);
	} catch {
		return raw.includes(":") ? undefined : raw;
	}
	return SAFE_URL_SCHEMES.some((scheme) => scheme === parsed.protocol) ? raw : undefined;
}
