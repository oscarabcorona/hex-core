import * as fs from "node:fs";
import * as path from "node:path";
import { detectTailwind } from "../lib/detect-tailwind.js";
import { type AliasConfig, DEFAULT_ALIASES } from "../lib/rewrite-imports.js";

export type CheckStatus = "pass" | "fail" | "warn" | "info";

export interface Check {
	name: string;
	status: CheckStatus;
	hint?: string;
}

interface PackageJson {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}

interface DoctorContext {
	cwd: string;
	pkg?: PackageJson;
	aliases: AliasConfig;
	tailwindVersion: "v3" | "v4" | "missing";
	componentsDir: string;
}

/**
 * Diagnose a Hex UI install. Returns a flat list of checks so the runner
 * can render them with the desired UI (icons, color, exit-code policy).
 *
 * Pure with respect to fs/cwd — no spawn, no install — so tests can
 * stamp out a tmpdir, run `runDoctor`, and assert on the result without
 * mocks.
 */
export async function runDoctor(cwd: string = process.cwd()): Promise<Check[]> {
	const ctx = buildContext(cwd);
	const checks: Check[] = [];
	checks.push(checkHexConfig(ctx));
	checks.push(checkTailwind(ctx));
	checks.push(checkLibUtils(ctx));
	checks.push(checkGlobalsCss(ctx));
	checks.push(...checkBaseDeps(ctx));
	if (ctx.tailwindVersion === "v3") checks.push(checkTailwindConfig(ctx));
	checks.push(...checkRadixDeps(ctx));
	return checks;
}

function buildContext(cwd: string): DoctorContext {
	const pkgPath = path.join(cwd, "package.json");
	let pkg: PackageJson | undefined;
	if (fs.existsSync(pkgPath)) {
		try {
			pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as PackageJson;
		} catch {
			pkg = undefined;
		}
	}

	const configPath = path.join(cwd, "hex.config.json");
	let aliases = DEFAULT_ALIASES;
	if (fs.existsSync(configPath)) {
		try {
			const raw = JSON.parse(fs.readFileSync(configPath, "utf-8")) as { aliases?: Partial<AliasConfig> };
			aliases = { ...DEFAULT_ALIASES, ...(raw.aliases ?? {}) };
		} catch {
			/* fall through with defaults */
		}
	}

	const tailwind = detectTailwind(cwd);
	return {
		cwd,
		pkg,
		aliases,
		tailwindVersion: tailwind.version,
		componentsDir: pickComponentsDir(cwd),
	};
}

/**
 * Pick the consumer's `components/ui` directory based on which app layout
 * exists. Mirrors the priority used by `init`'s globals.css picker.
 */
function pickComponentsDir(cwd: string): string {
	const candidates = [path.join(cwd, "src", "components", "ui"), path.join(cwd, "components", "ui")];
	for (const c of candidates) {
		if (fs.existsSync(c)) return c;
	}
	return candidates[1];
}

function checkHexConfig(ctx: DoctorContext): Check {
	const exists = fs.existsSync(path.join(ctx.cwd, "hex.config.json"));
	return {
		name: "hex.config.json",
		status: exists ? "pass" : "fail",
		hint: exists ? undefined : "Run `hex init` to scaffold the project config.",
	};
}

function checkTailwind(ctx: DoctorContext): Check {
	if (ctx.tailwindVersion === "missing") {
		return {
			name: "tailwindcss installed",
			status: "fail",
			hint: "Install tailwindcss before running hex init.",
		};
	}
	return {
		name: `tailwindcss ${ctx.tailwindVersion}`,
		status: "pass",
	};
}

function checkLibUtils(ctx: DoctorContext): Check {
	const libDir = aliasToProjectPath(ctx.cwd, ctx.aliases.lib);
	const utilsPath = path.join(libDir, "utils.ts");
	const utilsTsx = path.join(libDir, "utils.tsx");
	const exists = fs.existsSync(utilsPath) || fs.existsSync(utilsTsx);
	return {
		name: `${ctx.aliases.lib}/utils`,
		status: exists ? "pass" : "warn",
		hint: exists ? undefined : "Add any component (e.g. `hex add button`) — utils.ts is bundled with every install.",
	};
}

function checkGlobalsCss(ctx: DoctorContext): Check {
	const candidates = [
		path.join(ctx.cwd, "src", "app", "globals.css"),
		path.join(ctx.cwd, "app", "globals.css"),
	];
	const target = candidates.find((p) => fs.existsSync(p));
	if (!target) {
		return {
			name: "globals.css",
			status: "fail",
			hint: "Run `hex init` to scaffold globals.css for the detected Tailwind version.",
		};
	}
	const css = fs.readFileSync(target, "utf-8");
	const isV4 = css.includes(`@import "tailwindcss"`);
	const isV3 = css.includes("@tailwind base");
	const expectedV4 = ctx.tailwindVersion === "v4";
	if (expectedV4 && !isV4) {
		return {
			name: "globals.css matches Tailwind v4",
			status: "fail",
			hint: `Globals.css uses ${isV3 ? "v3" : "unknown"} syntax but tailwindcss is v4. Run \`hex init --overwrite\`.`,
		};
	}
	if (!expectedV4 && !isV3) {
		return {
			name: "globals.css matches Tailwind v3",
			status: "fail",
			hint: `Globals.css uses ${isV4 ? "v4" : "unknown"} syntax but tailwindcss is v3. Run \`hex init --overwrite\`.`,
		};
	}
	return {
		name: `globals.css (${expectedV4 ? "v4" : "v3"} syntax)`,
		status: "pass",
	};
}

function checkBaseDeps(ctx: DoctorContext): Check[] {
	const baseDeps = ["clsx", "tailwind-merge", "class-variance-authority"];
	if (ctx.tailwindVersion === "v4") baseDeps.push("tw-animate-css");
	if (ctx.tailwindVersion === "v3") baseDeps.push("tailwindcss-animate");
	return baseDeps.map((dep) => {
		const present = depPresent(ctx.pkg, dep);
		return {
			name: dep,
			status: present ? "pass" : "fail",
			hint: present ? undefined : `Install with \`pnpm add ${dep}\` or re-run \`hex init\`.`,
		};
	});
}

function checkTailwindConfig(ctx: DoctorContext): Check {
	const target = path.join(ctx.cwd, "tailwind.config.ts");
	const targetJs = path.join(ctx.cwd, "tailwind.config.js");
	const exists = fs.existsSync(target) || fs.existsSync(targetJs);
	if (!exists) {
		return {
			name: "tailwind.config.ts",
			status: "fail",
			hint: "Run `hex init` to scaffold tailwind.config.ts (Tailwind v3 only).",
		};
	}
	const content = fs.readFileSync(fs.existsSync(target) ? target : targetJs, "utf-8");
	if (!content.includes("tailwindcss-animate")) {
		return {
			name: "tailwind.config.ts has tailwindcss-animate plugin",
			status: "warn",
			hint: "Add `tailwindcss-animate` to your plugins array — components depend on its animate-* utilities.",
		};
	}
	return { name: "tailwind.config.ts", status: "pass" };
}

function checkRadixDeps(ctx: DoctorContext): Check[] {
	if (!fs.existsSync(ctx.componentsDir)) return [];
	const files = fs.readdirSync(ctx.componentsDir).filter((f) => /\.tsx?$/.test(f));
	const radixSpecs = new Set<string>();
	for (const f of files) {
		const content = fs.readFileSync(path.join(ctx.componentsDir, f), "utf-8");
		const matches = content.matchAll(/from\s+["'](@radix-ui\/[^"']+)["']/g);
		for (const m of matches) radixSpecs.add(m[1]);
	}
	return [...radixSpecs].sort().map((spec) => {
		const present = depPresent(ctx.pkg, spec);
		return {
			name: spec,
			status: present ? "pass" : "fail",
			hint: present ? undefined : `Install with \`pnpm add ${spec}\`.`,
		};
	});
}

function depPresent(pkg: PackageJson | undefined, name: string): boolean {
	if (!pkg) return false;
	return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
}

function aliasToProjectPath(cwd: string, alias: string): string {
	// "@/lib" → resolve via tsconfig paths if present, else assume "@/" maps to "./" (default Next.js).
	if (alias.startsWith("@/")) return path.join(cwd, alias.slice(2));
	if (alias.startsWith("./")) return path.join(cwd, alias.slice(2));
	if (alias.startsWith("/")) return alias;
	return path.join(cwd, alias);
}

/**
 * Pretty-print the check list for terminal consumption. Returns the exit
 * code the CLI should propagate (0 if every check passes or warns; 1 if
 * any check fails).
 */
export function reportDoctor(checks: Check[]): number {
	const labels = { pass: "[ok]  ", fail: "[FAIL]", warn: "[warn]", info: "[info]" } as const;
	let failed = 0;
	console.log("Hex UI doctor");
	for (const check of checks) {
		console.log(`  ${labels[check.status]} ${check.name}${check.hint ? `\n         ${check.hint}` : ""}`);
		if (check.status === "fail") failed++;
	}
	console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check${failed === 1 ? "" : "s"} failed.`);
	return failed > 0 ? 1 : 0;
}
