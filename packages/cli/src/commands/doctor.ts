import * as fs from "node:fs";
import * as path from "node:path";
import pc from "picocolors";
import { detectTailwind } from "../lib/detect-tailwind.js";
import { detectSrcLayout, resolveAlias } from "../lib/resolve-alias.js";
import { type AliasConfig, DEFAULT_ALIASES } from "../lib/rewrite-imports.js";
import { walkSourceFiles } from "../lib/walk-sources.js";

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
export interface DoctorOptions {
	/**
	 * When true, also run the layout-pattern scans:
	 *   - components installed in `components/ui/` but never imported
	 *   - hand-rolled layout markup that a composition primitive would replace
	 * Quiet by default — only runs when `--layout` is passed because the
	 * scans walk the entire `src/` (or `app/` + `components/`) tree.
	 */
	layout?: boolean;
}

export async function runDoctor(
	cwd: string = process.cwd(),
	options: DoctorOptions = {},
): Promise<Check[]> {
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
	if (options.layout) {
		checks.push(...checkLayoutPatterns(ctx));
	}
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
 * Find the consumer's source-file root. Prefer `src/` when present (Next.js
 * `--src-dir` convention); otherwise walk both `app/` and `components/`.
 * Returns the roots that exist, so `walkSourceFiles` skips missing paths.
 */
function sourceRoots(ctx: DoctorContext): string[] {
	const candidates = [
		path.join(ctx.cwd, "src"),
		path.join(ctx.cwd, "app"),
		path.join(ctx.cwd, "components"),
	];
	return candidates.filter((p) => fs.existsSync(p));
}

/**
 * Hand-rolled layout patterns that the registry already has a primitive
 * for. Each rule lists the file-level signal an agent typically writes
 * when reaching for ad-hoc Tailwind utilities instead of composition.
 * Severity is always `info` — the goal is to nudge, never to gate CI.
 */
const HAND_ROLLED_PATTERNS: ReadonlyArray<{
	name: string;
	test: (content: string) => boolean;
	suggestion: string;
}> = [
	{
		name: "space-y-* utility chain",
		test: (s) => (s.match(/space-y-/g) ?? []).length >= 3,
		suggestion: "Consider `<Stack gap='…'>` from @hex-core/components.",
	},
	{
		name: "responsive grid via breakpoint variants",
		test: (s) =>
			/grid-cols-/.test(s) && /\b(sm|md|lg|xl):grid-cols-/.test(s),
		suggestion: "Consider `<Grid cols='auto-fit' minColWidth='…'>` — replaces the breakpoint variants.",
	},
	{
		name: "dashed empty-state div",
		test: (s) => /border-dashed/.test(s) && /flex-col/.test(s),
		suggestion: "Consider the `<Empty>` primitive.",
	},
	{
		name: "hand-rolled timeline",
		test: (s) => /<ol\b/.test(s) && /absolute/.test(s) && /rounded-full/.test(s),
		suggestion: "Consider the `<Timeline>` block.",
	},
	{
		name: "rounded-full badge span",
		// All three classes present, order-independent — covers
		// `rounded-full border text-xs`, `text-xs rounded-full border`,
		// `border rounded-full text-xs px-2`, etc.
		test: (s) => /rounded-full/.test(s) && /\bborder\b/.test(s) && /\btext-xs\b/.test(s),
		suggestion: "Consider `<Badge>` or `<Tag>`.",
	},
];

/**
 * Pascal-case a component slug for symbol-name grepping. `code-block` → `CodeBlock`. Used to detect whether an installed component is rendered anywhere in the consumer's source tree. Note: renamed imports (`import { Card as Surface } from "@/components/ui/card"; <Surface/>`) won't match the JSX-symbol regex, but the companion import-path regex `from "…/<slug>"` still flags the file as a user — so the "installed but unused" check stays correct for the renamed case via the import-path signal, not this symbol signal.
 */
function slugToSymbol(slug: string): string {
	return slug
		.split("-")
		.map((p) => (p.length === 0 ? "" : p[0]?.toUpperCase() + p.slice(1)))
		.join("");
}

/**
 * Layout scans surfaced by `hex doctor --layout`.
 *
 * Scan A — installed-but-unused: for every component on disk under
 *   `components/ui/`, grep the consumer's source tree for at least one
 *   `<Symbol` JSX usage or `from "<…components alias…>/<slug>"` import.
 *   Emits an `info` finding for each component the user installed but
 *   never composed — the canonical case the real-session feedback hit
 *   (added `card` + `badge`, rolled raw `<div>`s anyway).
 *
 * Scan B — hand-rolled patterns: per-file regex pass for the five
 *   utility chains that a Hex Core primitive replaces (`space-y-*`,
 *   breakpoint `grid-cols-*`, dashed empty divs, ad-hoc timelines,
 *   `rounded-full border` badge spans). One `info` finding per file
 *   that triggers each rule.
 *
 * @param ctx - Doctor context (cwd + resolved components dir).
 * @returns Up to N `info` findings; never `fail`.
 */
function checkLayoutPatterns(ctx: DoctorContext): Check[] {
	const checks: Check[] = [];
	const roots = sourceRoots(ctx);
	if (roots.length === 0) return checks;

	const sourceFiles: string[] = [];
	for (const root of roots) {
		sourceFiles.push(...walkSourceFiles(root, [".ts", ".tsx", ".js", ".jsx"]));
	}
	// Read each file once — Scan B's per-pattern probes share the buffer.
	const sourceContents = new Map<string, string>();
	for (const file of sourceFiles) {
		try {
			sourceContents.set(file, fs.readFileSync(file, "utf-8"));
		} catch {
			// File disappeared between walk and read — skip.
		}
	}

	// Scan A: installed-but-unused components.
	if (fs.existsSync(ctx.componentsDir)) {
		const installed = fs
			.readdirSync(ctx.componentsDir)
			.filter((f) => /\.tsx?$/.test(f))
			.map((f) => f.replace(/\.tsx?$/, ""));
		for (const slug of installed) {
			const symbol = slugToSymbol(slug);
			// JSX usage: `<Symbol` or `<Symbol.` (compound components).
			const symbolRe = new RegExp(`<${symbol}\\b|<${symbol}\\.`);
			// Import: any path that ends in `/${slug}`. Tighter than `slug` alone
			// so we don't false-match a variable that happens to share the name.
			const importRe = new RegExp(`from\\s+["'][^"']*\\/${slug}["']`);
			let used = false;
			for (const [, content] of sourceContents) {
				if (symbolRe.test(content) || importRe.test(content)) {
					used = true;
					break;
				}
			}
			if (used) continue;
			checks.push({
				name: `installed but unused: ${slug}`,
				status: "info",
				hint: `<${symbol}> is in components/ui/ but no source file imports or renders it. Migrate ad-hoc markup to <${symbol}> or remove the component.`,
			});
		}
	}

	// Scan B: hand-rolled layout patterns.
	for (const [file, content] of sourceContents) {
		const rel = path.relative(ctx.cwd, file);
		for (const rule of HAND_ROLLED_PATTERNS) {
			if (rule.test(content)) {
				checks.push({
					name: `${rel}: ${rule.name}`,
					status: "info",
					hint: rule.suggestion,
				});
			}
		}
	}

	return checks;
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
