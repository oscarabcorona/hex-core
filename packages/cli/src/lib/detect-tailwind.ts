import * as fs from "node:fs";
import * as path from "node:path";

export type TailwindVersion = "v3" | "v4" | "missing";

export interface TailwindInfo {
	version: TailwindVersion;
	/** The raw range string from package.json — useful for messages. */
	rawRange?: string;
}

interface PackageJson {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}

/**
 * Detect which Tailwind major the consumer's project is using by reading
 * `package.json`. Used by `hex init` to pick the right `globals.css` shape
 * and decide whether a `tailwind.config.ts` needs to be generated.
 *
 * Treats `^4`, `~4`, `4.x`, `next`, `latest`, and bare `4`-prefixed strings
 * as v4. Anything else with a `tailwindcss` entry is v3 (the safer fallback —
 * v3 syntax via @tailwind directives degrades to a no-op on v4 if the user
 * upgrades, whereas v4 syntax breaks v3 outright).
 *
 * @param cwd - The directory to look in. Defaults to `process.cwd()`.
 */
export function detectTailwind(cwd: string = process.cwd()): TailwindInfo {
	const pkgPath = path.join(cwd, "package.json");
	if (!fs.existsSync(pkgPath)) return { version: "missing" };

	let pkg: PackageJson;
	try {
		pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as PackageJson;
	} catch {
		return { version: "missing" };
	}

	const range = pkg.dependencies?.tailwindcss ?? pkg.devDependencies?.tailwindcss;
	if (!range) return { version: "missing" };

	if (isV4Range(range)) return { version: "v4", rawRange: range };
	return { version: "v3", rawRange: range };
}

/**
 * Match anything that resolves to Tailwind v4: `^4`, `~4`, `4.0.0`, `4.x`,
 * `>=4`, `next`, `latest`, plus the npm-tag-ish forms `canary`/`beta`/`rc`
 * which create-next-app's templates pin to during pre-releases.
 */
function isV4Range(range: string): boolean {
	const trimmed = range.trim();
	if (/^(?:next|latest|canary|beta|rc)$/.test(trimmed)) return true;
	// Strip leading range operators (^, ~, >=, >, =) so we can read the major.
	const stripped = trimmed.replace(/^[\^~>=<]+\s*/, "");
	const major = stripped.split(/[.\s]/)[0];
	return major === "4" || major.startsWith("4");
}
