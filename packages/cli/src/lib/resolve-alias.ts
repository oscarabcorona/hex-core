import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Resolve a `hex.config.json` alias (e.g. `"@/components"`) to the
 * absolute filesystem path the consumer's project actually writes to.
 *
 * Resolution order:
 * 1. `./foo` and `/abs/foo` are returned literally (no tsconfig involved).
 * 2. `@/<rest>` consults `tsconfig.json#compilerOptions.paths["@/*"]` and
 *    follows any `extends` chain. The first non-wildcard segment of the
 *    target (e.g. `["./src/*"]` → `src`) becomes the project subdirectory.
 * 3. If tsconfig has no `@/*` mapping, fall back to a `src/` heuristic:
 *    if `<cwd>/src/app` or `<cwd>/src/components` exists, treat `@/` as
 *    `src/`. Otherwise treat `@/` as the project root.
 *
 * This mirrors what every Next.js `--src-dir` and Vite `@/`-aliased
 * project actually means by the convention.
 */

interface CompilerOptions {
	baseUrl?: string;
	paths?: Record<string, string[]>;
}

interface RawTsconfig {
	extends?: string;
	compilerOptions?: CompilerOptions;
}

const tsconfigCache = new Map<string, RawTsconfig | null>();
const aliasRootCache = new Map<string, string>();

/** Strip `//` line comments, `/* *​/` block comments, and trailing commas
 * from a JSONC string. tsconfig.json officially permits all three. */
function stripJsonc(input: string): string {
	let out = "";
	let i = 0;
	const n = input.length;
	while (i < n) {
		const ch = input[i];
		const next = input[i + 1];
		// String literal — copy through, handling escape sequences.
		if (ch === '"') {
			out += ch;
			i++;
			while (i < n) {
				const c = input[i];
				out += c;
				if (c === "\\" && i + 1 < n) {
					out += input[i + 1];
					i += 2;
					continue;
				}
				i++;
				if (c === '"') break;
			}
			continue;
		}
		if (ch === "/" && next === "/") {
			while (i < n && input[i] !== "\n") i++;
			continue;
		}
		if (ch === "/" && next === "*") {
			i += 2;
			while (i < n && !(input[i] === "*" && input[i + 1] === "/")) i++;
			i += 2;
			continue;
		}
		out += ch;
		i++;
	}
	// Trailing commas before `]` or `}`.
	return out.replace(/,(\s*[}\]])/g, "$1");
}

function readTsconfig(file: string): RawTsconfig | null {
	if (tsconfigCache.has(file)) return tsconfigCache.get(file) ?? null;
	let parsed: RawTsconfig | null = null;
	try {
		const raw = fs.readFileSync(file, "utf-8");
		parsed = JSON.parse(stripJsonc(raw)) as RawTsconfig;
	} catch {
		parsed = null;
	}
	tsconfigCache.set(file, parsed);
	return parsed;
}

interface ResolvedPath {
	target: string;
	/** Absolute path the target is resolved against — the baseUrl of the
	 * tsconfig file that defined this `paths` entry. Tracking it per-entry
	 * is required for `extends` chains, where parent paths may reference
	 * directories outside the child's baseDir. */
	baseDir: string;
}

/** Walk the `extends` chain (DAG-safe, capped at 16 hops) and merge each
 * node's `compilerOptions.paths` left-to-right — child wins on conflict,
 * matching the TypeScript compiler's behavior. */
function resolveTsconfigPaths(start: string): Record<string, ResolvedPath[]> | null {
	if (!fs.existsSync(start)) return null;
	const visited = new Set<string>();
	const chain: { file: string; cfg: RawTsconfig }[] = [];
	let current: string | null = start;
	while (current && !visited.has(current) && chain.length < 16) {
		visited.add(current);
		const cfg = readTsconfig(current);
		if (!cfg) break;
		chain.push({ file: current, cfg });
		if (!cfg.extends) break;
		const ext = cfg.extends;
		// Bare specifiers like `next/tsconfig.json` or `@vercel/style-guide/typescript`
		// would require resolving from node_modules; out of scope here.
		// Only follow relative or absolute paths, which is what 99% of projects use.
		if (!ext.startsWith(".") && !path.isAbsolute(ext)) break;
		const resolved = path.resolve(path.dirname(current), ext);
		current = resolved.endsWith(".json") ? resolved : `${resolved}.json`;
	}
	if (chain.length === 0) return null;
	// Merge nearest-first wins: walk children → roots and keep the first
	// definition encountered for each pattern. Each entry remembers the
	// baseDir of the file that DEFINED it so `../src/*` in a parent
	// resolves relative to the parent's directory, not the child's.
	const merged: Record<string, ResolvedPath[]> = {};
	for (const node of chain) {
		const p = node.cfg.compilerOptions?.paths;
		if (!p) continue;
		const baseUrlRaw = node.cfg.compilerOptions?.baseUrl ?? ".";
		const baseDir = path.resolve(path.dirname(node.file), baseUrlRaw);
		for (const [k, v] of Object.entries(p)) {
			if (!(k in merged)) merged[k] = v.map((target) => ({ target, baseDir }));
		}
	}
	if (Object.keys(merged).length === 0) return null;
	return merged;
}

/** Pick the project subdirectory implied by tsconfig's `@/*` mapping.
 * `["./src/*"]` → `src`. `["./*"]` → `""`. Anything weirder → null. */
function projectSubdirFromTsconfigTarget(target: string, baseDir: string, cwd: string): string | null {
	// Strip the leading `./` and trailing `/*`/`*` to get the directory.
	const trimmed = target.replace(/^\.\//, "").replace(/\/\*$|\*$/g, "");
	if (trimmed === "") {
		// Mapped to baseDir itself. Express as a path relative to cwd.
		return path.relative(cwd, baseDir) || "";
	}
	const abs = path.resolve(baseDir, trimmed);
	const rel = path.relative(cwd, abs);
	if (rel.startsWith("..")) return null;
	return rel;
}

/** Detect the implicit `src/` layout used by `pnpm create next-app --src-dir`
 * and Vite's default React template. Cheap fs check. */
export function detectSrcLayout(cwd: string): boolean {
	return (
		fs.existsSync(path.join(cwd, "src", "app")) ||
		fs.existsSync(path.join(cwd, "src", "components")) ||
		fs.existsSync(path.join(cwd, "src", "pages"))
	);
}

/**
 * Resolve a `hex.config.json` alias to an absolute filesystem path.
 *
 * @param cwd - Project root.
 * @param alias - Raw alias string from `hex.config.json#aliases.*`
 *                (e.g. `"@/components"`, `"./components"`, `"src/components"`).
 * @returns Absolute path the alias resolves to on disk.
 */
export function resolveAlias(cwd: string, alias: string): string {
	if (alias.startsWith("/")) return alias;
	if (alias.startsWith("./")) return path.resolve(cwd, alias.slice(2));
	if (!alias.startsWith("@/")) return path.resolve(cwd, alias);

	const cacheKey = `${cwd}::${alias}`;
	const cached = aliasRootCache.get(cacheKey);
	if (cached) return cached;

	const rest = alias.slice(2);
	const resolved = path.resolve(cwd, resolveAtPrefix(cwd), rest);
	aliasRootCache.set(cacheKey, resolved);
	return resolved;
}

/** Determine what `@/` itself maps to for this project. Cached internally.
 *
 * tsconfig allows multi-target paths like `"@/*": ["./src/*", "./*"]` —
 * walk them in order and pick the first that resolves to a subdir under
 * cwd. This handles the common "prefer src/, fall back to root" pattern
 * teams use during migrations. */
function resolveAtPrefix(cwd: string): string {
	const tsconfigPath = path.join(cwd, "tsconfig.json");
	const tsResolved = resolveTsconfigPaths(tsconfigPath);
	if (tsResolved) {
		const entries = tsResolved["@/*"] ?? tsResolved["@/"] ?? [];
		// Pass 1: prefer a non-cwd target whose directory exists. `./*` (cwd)
		// is almost always listed last as a catch-all in monorepo configs;
		// skipping it here gives `./src/*` priority when src/ is real.
		for (const entry of entries) {
			const subdir = projectSubdirFromTsconfigTarget(entry.target, entry.baseDir, cwd);
			if (subdir === null || subdir === "") continue;
			if (fs.existsSync(path.join(cwd, subdir))) return subdir;
		}
		// Pass 2: nothing matched on disk yet (first-run project, or all
		// targets are non-existent dirs). Fall back to the first valid
		// mapping, preserving user-stated preference order.
		for (const entry of entries) {
			const subdir = projectSubdirFromTsconfigTarget(entry.target, entry.baseDir, cwd);
			if (subdir !== null) return subdir;
		}
	}
	if (detectSrcLayout(cwd)) return "src";
	return "";
}

/** Test-only: clear the per-process caches. Tests that simulate multiple
 * fixtures need this because the same `cwd` (a tmpdir) gets stamped with
 * different layouts across cases. */
export function _resetAliasCacheForTests(): void {
	tsconfigCache.clear();
	aliasRootCache.clear();
}
