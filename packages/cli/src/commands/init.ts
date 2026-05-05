import * as fs from "node:fs";
import * as path from "node:path";
import pc from "picocolors";
import { detectTailwind, type TailwindVersion } from "../lib/detect-tailwind.js";
import { emitTailwindV3Config } from "../lib/emit-tailwind-config.js";
import { detectSrcLayout } from "../lib/resolve-alias.js";
import { runInstall } from "../lib/run-install.js";
import { runDoctor } from "./doctor.js";

/** Per-target overwrite set. `--overwrite` (no value) → "all". */
export type OverwriteTargets = Set<"globals.css" | "tailwind.config.ts" | "all">;

export interface InitOptions {
	theme: string;
	/**
	 * Either a boolean (legacy: `true` = replace everything, `false` = skip)
	 * or a typed `Set` of specific files to replace. Boolean form keeps
	 * older programmatic callers and tests working.
	 */
	overwrite?: boolean | OverwriteTargets;
	install?: boolean;
	/** When true, skip writes and exit non-zero if alias drift is detected. CI use. */
	check?: boolean;
}

function shouldOverwrite(
	value: boolean | OverwriteTargets | undefined,
	target: "globals.css" | "tailwind.config.ts",
): boolean {
	if (!value) return false;
	if (value === true) return true;
	return value.has("all") || value.has(target);
}

/**
 * Parse a comma-separated `--overwrite` value into the typed target set.
 * Bare `--overwrite` (no value) becomes `{"all"}` for backwards compat
 * with `@hex-core/cli@0.4.x`.
 */
export function parseOverwriteFlag(raw: string | boolean | undefined): OverwriteTargets | undefined {
	if (raw === undefined || raw === false) return undefined;
	if (raw === true || raw === "") return new Set(["all"]);
	const set: OverwriteTargets = new Set();
	for (const part of String(raw).split(",")) {
		const trimmed = part.trim();
		if (trimmed === "all" || trimmed === "globals.css" || trimmed === "tailwind.config.ts") {
			set.add(trimmed);
		} else {
			console.error(`Unknown --overwrite target: "${trimmed}". Use one of: all, globals.css, tailwind.config.ts.`);
			process.exit(1);
		}
	}
	return set;
}

/**
 * Initialize a new Hex UI project.
 *
 * Writes `hex.config.json` plus a `globals.css` shaped to the consumer's
 * detected Tailwind version, and (for v3) a `tailwind.config.ts`. Prints
 * the exact peer-dep install line the user still needs to run.
 *
 * `--check` mode runs the doctor and exits non-zero on drift without
 * touching any files. Designed for CI / pre-commit hooks.
 *
 * @param options.theme - The theme preset to scaffold from.
 * @param options.overwrite - Set of targets to replace; undefined means skip-if-exists.
 * @param options.check - When true, only verify state; never write.
 */
export async function initProject(options: InitOptions) {
	const cwd = process.cwd();
	const configPath = path.join(cwd, "hex.config.json");
	const tailwind = detectTailwind(cwd);

	if (options.check) {
		const checks = await runDoctor(cwd);
		const failed = checks.filter((c) => c.status === "fail").length;
		const warned = checks.filter((c) => c.status === "warn").length;
		console.log(`hex init --check: ${failed} fail, ${warned} warn.`);
		for (const c of checks) {
			if (c.status === "fail" || c.status === "warn") {
				console.log(`  [${c.status}] ${c.name}${c.hint ? ` — ${c.hint}` : ""}`);
			}
		}
		process.exit(failed > 0 ? 1 : 0);
	}

	if (tailwind.version === "missing") {
		console.error("tailwindcss is not installed in this project.");
		console.error("Install Tailwind first, then re-run hex init:");
		console.error("  pnpm add -D tailwindcss@^4 @tailwindcss/postcss   # for Tailwind v4 (recommended)");
		console.error("  pnpm add -D tailwindcss@^3 postcss autoprefixer  # for Tailwind v3");
		process.exit(1);
	}

	const srcLayout = detectSrcLayout(cwd);
	const wroteConfig = writeHexConfig(configPath, options.theme);
	const cssTarget = pickGlobalsTarget(cwd);
	const wroteCss = await writeGlobalsCss(cssTarget, options.theme, tailwind.version, shouldOverwrite(options.overwrite, "globals.css"));
	const wroteTwConfig =
		tailwind.version === "v3"
			? await writeTailwindConfig(path.join(cwd, "tailwind.config.ts"), options.theme, shouldOverwrite(options.overwrite, "tailwind.config.ts"))
			: { wrote: false, skipped: false };

	const peerDeps = peerDepsFor(tailwind.version);
	const installResult = await maybeInstall(cwd, peerDeps, options.install ?? true);

	printSummary({
		wroteConfig,
		wroteCss,
		wroteTwConfig,
		tailwindVersion: tailwind.version,
		tailwindRange: tailwind.rawRange,
		cssTarget: path.relative(cwd, cssTarget),
		peerDeps,
		installed: installResult,
		srcLayout,
	});
}

function peerDepsFor(version: TailwindVersion): string[] {
	if (version === "v4") return ["clsx", "tailwind-merge", "class-variance-authority", "tw-animate-css"];
	return ["clsx", "tailwind-merge", "class-variance-authority", "tailwindcss-animate"];
}

interface MaybeInstallResult {
	ran: boolean;
	skipped: string[];
	installed: string[];
	exitCode?: number;
	manager: string;
}

async function maybeInstall(cwd: string, peerDeps: string[], install: boolean): Promise<MaybeInstallResult> {
	if (!install) return { ran: false, skipped: peerDeps, installed: [], manager: "(skipped)" };
	const result = await runInstall(peerDeps, { cwd });
	return {
		ran: result.installed.length > 0,
		skipped: result.skipped,
		installed: result.installed,
		exitCode: result.exitCode,
		manager: result.manager,
	};
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
	peerDeps: string[];
	installed: MaybeInstallResult;
	srcLayout: boolean;
}

function printSummary(p: SummaryParams) {
	const versionTag = `Tailwind ${p.tailwindVersion}${p.tailwindRange ? ` (${p.tailwindRange})` : ""}`;
	console.log(`Detected ${versionTag}.`);
	if (p.srcLayout) {
		console.log(pc.dim(`Detected src/ layout — components will be written under src/components/.`));
	}
	console.log(p.wroteConfig ? "Created hex.config.json" : "hex.config.json already existed — left in place.");
	console.log(
		p.wroteCss.skipped
			? `Skipped ${p.cssTarget} (already exists; pass --overwrite=globals.css to replace).`
			: `Wrote ${p.cssTarget}`,
	);
	if (p.tailwindVersion === "v3") {
		console.log(
			p.wroteTwConfig.skipped
				? "Skipped tailwind.config.ts (already exists; pass --overwrite=tailwind.config.ts to replace)."
				: "Wrote tailwind.config.ts",
		);
	}

	if (!p.installed.ran && p.installed.installed.length === 0 && p.installed.skipped.length === p.peerDeps.length && p.installed.exitCode === undefined && p.installed.manager !== "(skipped)") {
		console.log(`Peer deps already present: ${p.peerDeps.join(", ")}`);
	} else if (p.installed.manager === "(skipped)") {
		console.log(`\nSkipping auto-install (--no-install). Run yourself:`);
		console.log(`  pnpm add ${p.peerDeps.join(" ")}`);
	} else if (p.installed.exitCode !== undefined && p.installed.exitCode !== 0) {
		console.log(`\nPeer-dep install via ${p.installed.manager} exited with code ${p.installed.exitCode}.`);
		console.log(`Run yourself: ${p.installed.manager} ${p.installed.manager === "npm" ? "install" : "add"} ${p.installed.installed.join(" ")}`);
	}

	console.log("\nNext: hex add button input label");
}
