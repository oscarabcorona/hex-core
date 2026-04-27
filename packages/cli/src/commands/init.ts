import * as fs from "node:fs";
import * as path from "node:path";
import { detectTailwind, type TailwindVersion } from "../lib/detect-tailwind.js";
import { emitTailwindV3Config } from "../lib/emit-tailwind-config.js";

/**
 * Initialize a new Hex UI project.
 *
 * Writes `hex.config.json` plus a `globals.css` shaped to the consumer's
 * detected Tailwind version, and (for v3) a `tailwind.config.ts`. Prints
 * the exact peer-dep install line the user still needs to run — this
 * stays a print, not an auto-install, until Fix 4 lands.
 *
 * @param options.theme - The theme preset to scaffold from.
 * @param options.overwrite - If true, replace existing globals.css / tailwind.config.ts.
 */
export async function initProject(options: { theme: string; overwrite?: boolean }) {
	const cwd = process.cwd();
	const configPath = path.join(cwd, "hex.config.json");
	const tailwind = detectTailwind(cwd);

	if (tailwind.version === "missing") {
		console.error("tailwindcss is not installed in this project.");
		console.error("Install Tailwind first, then re-run hex init:");
		console.error("  pnpm add -D tailwindcss@^4 @tailwindcss/postcss   # for Tailwind v4 (recommended)");
		console.error("  pnpm add -D tailwindcss@^3 postcss autoprefixer  # for Tailwind v3");
		process.exit(1);
	}

	const wroteConfig = writeHexConfig(configPath, options.theme);
	const cssTarget = pickGlobalsTarget(cwd);
	const wroteCss = await writeGlobalsCss(cssTarget, options.theme, tailwind.version, options.overwrite ?? false);
	const wroteTwConfig =
		tailwind.version === "v3"
			? await writeTailwindConfig(path.join(cwd, "tailwind.config.ts"), options.theme, options.overwrite ?? false)
			: { wrote: false, skipped: false };

	printSummary({
		wroteConfig,
		wroteCss,
		wroteTwConfig,
		tailwindVersion: tailwind.version,
		tailwindRange: tailwind.rawRange,
		cssTarget: path.relative(cwd, cssTarget),
	});
}

function writeHexConfig(configPath: string, theme: string): boolean {
	if (fs.existsSync(configPath)) return false;
	const config = {
		$schema: "https://hex-core.dev/schema/config.json",
		framework: "react",
		styling: "tailwind",
		typescript: true,
		theme,
		aliases: {
			components: "@/components",
			lib: "@/lib",
			hooks: "@/hooks",
		},
	};
	fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
	return true;
}

/**
 * Pick where to write `globals.css` based on which app dir the consumer's
 * Next.js scaffold uses. Falls back to `app/globals.css` if neither exists yet.
 */
function pickGlobalsTarget(cwd: string): string {
	const candidates = [
		path.join(cwd, "src/app/globals.css"),
		path.join(cwd, "app/globals.css"),
		path.join(cwd, "src/app"),
		path.join(cwd, "app"),
	];
	for (const c of candidates) {
		if (fs.existsSync(c)) {
			return c.endsWith("globals.css") ? c : path.join(c, "globals.css");
		}
	}
	return path.join(cwd, "app/globals.css");
}

interface WriteResult {
	wrote: boolean;
	skipped: boolean;
}

async function writeGlobalsCss(
	target: string,
	theme: string,
	tailwindVersion: TailwindVersion,
	overwrite: boolean,
): Promise<WriteResult> {
	if (fs.existsSync(target) && !overwrite) {
		return { wrote: false, skipped: true };
	}
	const tokens = await import("@hex-core/tokens");
	const themeData = tokens.getTheme(theme as "default" | "midnight" | "ember");
	if (!themeData) {
		console.error(`Unknown theme "${theme}". Try one of: default, midnight, ember.`);
		process.exit(1);
	}
	const css = tokens.generateGlobalsCss(themeData, {
		target: tailwindVersion === "v4" ? "v4" : "v3",
	});
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(target, css, "utf8");
	return { wrote: true, skipped: false };
}

async function writeTailwindConfig(target: string, theme: string, overwrite: boolean): Promise<WriteResult> {
	if (fs.existsSync(target) && !overwrite) {
		return { wrote: false, skipped: true };
	}
	const tokens = await import("@hex-core/tokens");
	const themeData = tokens.getTheme(theme as "default" | "midnight" | "ember");
	if (!themeData) return { wrote: false, skipped: false };
	const extendMaps = tokens.themeToTailwindConfig(themeData);
	fs.writeFileSync(target, emitTailwindV3Config(extendMaps), "utf8");
	return { wrote: true, skipped: false };
}

interface SummaryParams {
	wroteConfig: boolean;
	wroteCss: WriteResult;
	wroteTwConfig: WriteResult;
	tailwindVersion: TailwindVersion;
	tailwindRange?: string;
	cssTarget: string;
}

function printSummary(p: SummaryParams) {
	const versionTag = `Tailwind ${p.tailwindVersion}${p.tailwindRange ? ` (${p.tailwindRange})` : ""}`;
	console.log(`Detected ${versionTag}.`);
	console.log(p.wroteConfig ? "Created hex.config.json" : "hex.config.json already existed — left in place.");
	console.log(
		p.wroteCss.skipped
			? `Skipped ${p.cssTarget} (already exists; pass --overwrite to replace).`
			: `Wrote ${p.cssTarget}`,
	);
	if (p.tailwindVersion === "v3") {
		console.log(
			p.wroteTwConfig.skipped
				? "Skipped tailwind.config.ts (already exists; pass --overwrite to replace)."
				: "Wrote tailwind.config.ts",
		);
	}

	const peerDeps =
		p.tailwindVersion === "v4"
			? ["clsx", "tailwind-merge", "class-variance-authority", "tw-animate-css"]
			: ["clsx", "tailwind-merge", "class-variance-authority", "tailwindcss-animate"];

	console.log("\nNext steps:");
	console.log(`  1. Install peer deps: pnpm add ${peerDeps.join(" ")}`);
	console.log("  2. Add components:    hex add button input label");
}
