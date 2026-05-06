import * as fs from "node:fs";
import * as path from "node:path";
import pc from "picocolors";
import { detectTailwind } from "../lib/detect-tailwind.js";
import { detectSrcLayout, resolveAlias } from "../lib/resolve-alias.js";
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
 * Diagnose a Hex Core install. Returns a flat list of checks so the runner
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
	checks.push(checkAliasConsistency(ctx));
	checks.push(checkLibUtils(ctx));
	checks.push(checkGlobalsCss(ctx));
	checks.push(...checkBaseDeps(ctx));
	if (ctx.tailwindVersion === "v3") checks.push(checkTailwindConfig(ctx));
	checks.push(...checkRadixDeps(ctx));
	checks.push(checkShadcnArtifacts(ctx));
	return checks;
}

/**
 * Detect shadcn artifacts left over after a partial migration. The two
 * positive signals — `components.json` (shadcn-ui's marker) and
 * `<components>/ui/toast.tsx` — survive `hex migrate` only when the user
 * skipped them or aborted mid-flight. Surfaces as `warn` so re-running
 * `hex migrate` is the obvious next step.
 * @param ctx - Doctor context (carries cwd + resolved components dir).
 * @returns A `pass` check when no artifacts are found, otherwise a `warn`
 *          listing what's left.
 */
function checkShadcnArtifacts(ctx: DoctorContext): Check {
	const componentsJsonAtRoot = fs.existsSync(path.join(ctx.cwd, "components.json"));
	const componentsJsonAtSrc = fs.existsSync(path.join(ctx.cwd, "src", "components.json"));
	const toastTsx = fs.existsSync(path.join(ctx.componentsDir, "toast.tsx"));
	const useToastDir = fs.existsSync(path.join(ctx.cwd, "hooks", "use-toast.ts")) ||
		fs.existsSync(path.join(ctx.cwd, "src", "hooks", "use-toast.ts"));
	const found = componentsJsonAtRoot || componentsJsonAtSrc || toastTsx || useToastDir;
	if (!found) {
		return { name: "no shadcn artifacts", status: "pass" };
	}
	const bits: string[] = [];
	if (componentsJsonAtRoot) bits.push("components.json");
	if (componentsJsonAtSrc) bits.push("src/components.json");
	if (toastTsx) bits.push("toast.tsx");
	if (useToastDir) bits.push("hooks/use-toast.ts");
	return {
		name: "shadcn artifacts left over",
		status: "warn",
		hint: `Found: ${bits.join(", ")}. Run \`hex migrate\` to finish converting.`,
	};
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
		componentsDir: pickComponentsDir(cwd, aliases),
	};
}

/**
 * Pick the consumer's `components/ui` directory by resolving the configured
 * alias through `resolveAlias` (which honors tsconfig and src/ layout).
 * Falls back to whichever conventional directory exists if the resolved
 * alias points nowhere yet (first-run case).
 */
function pickComponentsDir(cwd: string, aliases: AliasConfig): string {
	const resolved = path.join(resolveAlias(cwd, aliases.components), "ui");
	if (fs.existsSync(resolved)) return resolved;
	const candidates = [path.join(cwd, "src", "components", "ui"), path.join(cwd, "components", "ui")];
	for (const c of candidates) {
		if (fs.existsSync(c)) return c;
	}
	return resolved;
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
	const libDir = resolveAlias(ctx.cwd, ctx.aliases.lib);
	const utilsPath = path.join(libDir, "utils.ts");
	const utilsTsx = path.join(libDir, "utils.tsx");
	const exists = fs.existsSync(utilsPath) || fs.existsSync(utilsTsx);
	return {
		name: `${ctx.aliases.lib}/utils`,
		status: exists ? "pass" : "warn",
		hint: exists ? undefined : "Add any component (e.g. `hex add button`) — utils.ts is bundled with every install.",
	};
}

/**
 * Detect drift between `hex.config.json#aliases` and the actual
 * filesystem layout — the bug class the @hex-core/cli@0.4.0 reviewer
 * hit on every Next.js `--src-dir` project. Three drift modes:
 *
 * 1. Components live under `<cwd>/components/ui` but the resolver
 *    points at `<cwd>/src/components/ui` (or vice-versa). User has
 *    files in the wrong place; suggest `mv`.
 * 2. `aliases.components` is `@/...` but neither tsconfig nor src/
 *    layout exists — user will get cwd-rooted writes that may
 *    surprise them. Info-level (works, but explain).
 * 3. Resolved alias points at a directory that doesn't exist yet
 *    AND no `components/ui` exists at the fallback location either.
 *    First-run state; info-level.
 */
function checkAliasConsistency(ctx: DoctorContext): Check {
	const resolved = resolveAlias(ctx.cwd, ctx.aliases.components);
	const resolvedUiDir = path.join(resolved, "ui");
	const altUiDir = detectSrcLayout(ctx.cwd)
		? path.join(ctx.cwd, "components", "ui")
		: path.join(ctx.cwd, "src", "components", "ui");

	if (fs.existsSync(altUiDir) && !fs.existsSync(resolvedUiDir)) {
		const altRel = path.relative(ctx.cwd, altUiDir);
		const targetRel = path.relative(ctx.cwd, resolvedUiDir);
		return {
			name: "aliases match filesystem layout",
			status: "warn",
			hint: `Components are at ${altRel} but the resolver expects ${targetRel}. Run: mv ${altRel} ${targetRel} (and the matching lib/ dir).`,
		};
	}

	if (!fs.existsSync(resolvedUiDir)) {
		return {
			name: "aliases match filesystem layout",
			status: "info",
			hint: `Will write to ${path.relative(ctx.cwd, resolvedUiDir)} on first \`hex add\`.`,
		};
	}

	return { name: "aliases match filesystem layout", status: "pass" };
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

/**
 * Pretty-print the check list for terminal consumption. Returns the exit
 * code the CLI should propagate (0 if every check passes or warns; 1 if
 * any check fails).
 */
export function reportDoctor(checks: Check[]): number {
	const labels = {
		pass: pc.green("[ok]  "),
		fail: pc.red("[FAIL]"),
		warn: pc.yellow("[warn]"),
		info: pc.cyan("[info]"),
	} as const;
	let failed = 0;
	console.log(pc.bold("Hex Core doctor"));
	for (const check of checks) {
		console.log(`  ${labels[check.status]} ${check.name}${check.hint ? `\n         ${pc.dim(check.hint)}` : ""}`);
		if (check.status === "fail") failed++;
	}
	console.log(failed === 0 ? `\n${pc.green("All checks passed.")}` : `\n${pc.red(`${failed} check${failed === 1 ? "" : "s"} failed.`)}`);
	return failed > 0 ? 1 : 0;
}
