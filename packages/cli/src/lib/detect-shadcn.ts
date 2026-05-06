import * as fs from "node:fs";
import * as path from "node:path";
import type { FrameworkDetection } from "./detect-framework.js";
import { SHADCN_TO_HEX } from "./migrate-mapping.js";

/** One shadcn `*.tsx` file the migrator found and resolved against the mapping table. */
export interface ShadcnFile {
	/** Absolute path on disk. */
	abs: string;
	/** Slug derived from the filename (e.g. `button.tsx` → `button`). */
	shadcnSlug: string;
	/**
	 * Hex Core slug to swap in. `null` when the slug is in the mapping table
	 * but has no equivalent (carousel, chart). Files whose slug isn't in the
	 * mapping at all are filtered out before this struct is built.
	 */
	hexSlug: string | null;
	/** Outcome category — drives the report. `rename` is the toast→sonner case. */
	status: "match" | "rename" | "no-mapping";
}

export interface ShadcnDetection {
	/** True when the project shows a positive shadcn signal (see signals below). */
	isShadcn: boolean;
	signals: {
		/** A `components.json` file (shadcn-ui's marker) exists at cwd or src/. */
		componentsJson: boolean;
		/** Absolute path of the components/ui dir (e.g. `<cwd>/src/components/ui`), or null if missing. */
		uiDir: string | null;
		/** Names of `@radix-ui/*` packages declared in package.json. */
		radixDeps: string[];
		/** Filenames in the UI dir that match a known shadcn slug (sans extension). */
		matchedSlugs: string[];
	};
	/** Resolved location of `components.json` if present. */
	componentsJsonPath: string | null;
	/** Every `*.tsx` in the UI dir whose slug is in the mapping table. */
	uiFiles: ShadcnFile[];
	/** Things to flag in the report header. */
	conflicts: {
		hasHexConfig: boolean;
	};
}

interface PackageJson {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}

/**
 * Read + parse `package.json` at `cwd`. Returns null on missing or invalid file.
 * @param cwd - Project root.
 * @returns Parsed package.json or null on any read/parse error.
 */
function readPackageJson(cwd: string): PackageJson | null {
	const file = path.join(cwd, "package.json");
	if (!fs.existsSync(file)) return null;
	try {
		return JSON.parse(fs.readFileSync(file, "utf-8")) as PackageJson;
	} catch {
		return null;
	}
}

/**
 * Pick the components/ui directory the consumer's shadcn install would
 * have written to, given the framework detection. Honors `srcDir`.
 * @param cwd - Project root.
 * @param framework - Framework detection (drives src/ vs no-src candidate order).
 * @returns Absolute path to the UI dir, or null when none of the candidates exist.
 */
function resolveUiDir(cwd: string, framework: FrameworkDetection): string | null {
	const candidates = framework.srcDir
		? ["src/components/ui", "src/components"]
		: ["components/ui", "components", "src/components/ui", "src/components"];
	for (const rel of candidates) {
		const abs = path.join(cwd, rel);
		if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return abs;
	}
	return null;
}

/**
 * Walk a directory non-recursively and return `*.tsx` files. shadcn writes
 * each component as a single .tsx at the top of components/ui/, so we
 * deliberately don't recurse — that would scoop up the consumer's own UI.
 * @param dir - Absolute directory to scan.
 * @returns Absolute paths of every `*.tsx` immediately inside `dir`.
 */
function listTsxFiles(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	return fs
		.readdirSync(dir, { withFileTypes: true })
		.filter((e) => e.isFile() && e.name.endsWith(".tsx"))
		.map((e) => path.join(dir, e.name));
}

/**
 * Find shadcn's `components.json` at the project root or `src/`.
 * @param cwd - Project root.
 * @returns Absolute path of the file when present, or null.
 */
function findComponentsJson(cwd: string): string | null {
	for (const rel of ["components.json", "src/components.json"]) {
		const abs = path.join(cwd, rel);
		if (fs.existsSync(abs)) return abs;
	}
	return null;
}

/**
 * Detect a shadcn-style adoption footprint in `cwd`. Two positive signals
 * — either is sufficient:
 *
 *   1. `components.json` exists. shadcn-ui writes this on `init`; nothing
 *      else does. Unambiguous.
 *   2. A `<components>/ui/*.tsx` directory holds files matching at least
 *      one canonical shadcn slug AND `package.json` declares ≥1
 *      `@radix-ui/*` dependency. The triple-AND avoids false-positives on
 *      greenfield Hex Core projects that already have `components/ui/`
 *      populated by `hex add`.
 *
 * Files are intersected with the SHADCN_TO_HEX mapping. Files not in the
 * mapping (custom additions, blocks, etc.) are NOT included in `uiFiles`
 * — the migrator leaves them in place untouched.
 * @param cwd - Project root.
 * @param framework - Framework detection result (drives UI dir resolution).
 * @returns Detection summary used to plan the migration.
 */
export function detectShadcn(cwd: string, framework: FrameworkDetection): ShadcnDetection {
	const componentsJsonPath = findComponentsJson(cwd);
	const uiDir = resolveUiDir(cwd, framework);

	const tsxFiles = uiDir ? listTsxFiles(uiDir) : [];
	const slugFor = (file: string) => path.basename(file, ".tsx");
	const matchedSlugs = tsxFiles.map(slugFor).filter((s) => s in SHADCN_TO_HEX);

	const pkg = readPackageJson(cwd);
	const radixDeps = pkg
		? Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }).filter((n) =>
				n.startsWith("@radix-ui/"),
			)
		: [];

	// `components.json` is the unambiguous shadcn marker — nothing else writes
	// it. The directory-only signal (uiDir + matched slugs + radix peers) can
	// false-positive on a post-migration Hex Core project, so we suppress it
	// when `hex.config.json` already exists. Result: a re-run after a
	// successful migrate exits cleanly instead of trying to migrate Hex Core
	// content back onto itself.
	const hasComponentsJson = componentsJsonPath !== null;
	const hasHexConfig = fs.existsSync(path.join(cwd, "hex.config.json"));
	const hasUiSignal = !hasHexConfig && matchedSlugs.length > 0 && radixDeps.length > 0;
	const isShadcn = hasComponentsJson || hasUiSignal;

	const uiFiles: ShadcnFile[] = tsxFiles
		.map((abs) => {
			const shadcnSlug = slugFor(abs);
			const hexSlug = SHADCN_TO_HEX[shadcnSlug];
			if (hexSlug === undefined) return null;
			let status: ShadcnFile["status"];
			if (hexSlug === null) status = "no-mapping";
			else if (hexSlug !== shadcnSlug) status = "rename";
			else status = "match";
			return { abs, shadcnSlug, hexSlug, status };
		})
		.filter((x): x is ShadcnFile => x !== null);

	return {
		isShadcn,
		signals: {
			componentsJson: hasComponentsJson,
			uiDir,
			radixDeps,
			matchedSlugs,
		},
		componentsJsonPath,
		uiFiles,
		conflicts: { hasHexConfig },
	};
}
