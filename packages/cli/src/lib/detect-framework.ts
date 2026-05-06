import * as fs from "node:fs";
import * as path from "node:path";

/** Frameworks `hex migrate` v1 recognizes. `unknown` proceeds with sane defaults
 * — the migrator can still file-replace if alias resolution works. */
export type FrameworkKind =
	| "next-app"
	| "next-pages"
	| "vite"
	| "cra"
	| "craco"
	| "unknown";

export interface FrameworkDetection {
	kind: FrameworkKind;
	/** True when source lives under `<cwd>/src/` (Next.js `--src-dir`, Vite, CRA, CRACO). */
	srcDir: boolean;
	/** Cwd-relative path of the file the user should mount `<Toaster />` in. */
	entryHint: string;
	/** Human-readable label for the report header (e.g. "Next.js App Router (src/)"). */
	label: string;
}

interface PackageJson {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}

function readPackageJson(cwd: string): PackageJson | null {
	const file = path.join(cwd, "package.json");
	if (!fs.existsSync(file)) return null;
	try {
		return JSON.parse(fs.readFileSync(file, "utf-8")) as PackageJson;
	} catch {
		return null;
	}
}

function hasDep(pkg: PackageJson, name: string): boolean {
	return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
}

function exists(cwd: string, ...segments: string[]): boolean {
	return fs.existsSync(path.join(cwd, ...segments));
}

/**
 * Detect the host framework by inspecting `package.json` deps and the project
 * directory layout. Used by `hex migrate` to (a) emit a framework-aware
 * Toaster mount hint in the report and (b) print a "Detected: X" diagnostic.
 *
 * Detection precedence: Next.js (App vs Pages by which dir exists) → CRACO
 * (wraps CRA, so check before CRA) → CRA → Vite → unknown. The directory
 * checks honor both top-level (`app/`, `pages/`) and `src/` layouts.
 */
export function detectFramework(cwd: string): FrameworkDetection {
	const pkg = readPackageJson(cwd);
	const srcDir =
		exists(cwd, "src", "app") ||
		exists(cwd, "src", "components") ||
		exists(cwd, "src", "pages") ||
		exists(cwd, "src", "main.tsx") ||
		exists(cwd, "src", "main.jsx") ||
		exists(cwd, "src", "index.tsx") ||
		exists(cwd, "src", "index.jsx");

	if (pkg && hasDep(pkg, "next")) {
		const appAt = exists(cwd, "src", "app") ? "src/app" : exists(cwd, "app") ? "app" : null;
		const pagesAt = exists(cwd, "src", "pages") ? "src/pages" : exists(cwd, "pages") ? "pages" : null;
		// App and Pages can coexist during a migration. Prefer App since that's
		// the long-term target — its layout.tsx is the canonical Toaster mount.
		if (appAt) {
			return {
				kind: "next-app",
				srcDir: appAt.startsWith("src/"),
				entryHint: `${appAt}/layout.tsx`,
				label: `Next.js App Router${appAt.startsWith("src/") ? " (src/)" : ""}`,
			};
		}
		if (pagesAt) {
			return {
				kind: "next-pages",
				srcDir: pagesAt.startsWith("src/"),
				entryHint: `${pagesAt}/_app.tsx`,
				label: `Next.js Pages Router${pagesAt.startsWith("src/") ? " (src/)" : ""}`,
			};
		}
		// `next` declared but no app/ or pages/ on disk yet — likely a fresh
		// install. Default to App Router (current Next.js default).
		return {
			kind: "next-app",
			srcDir,
			entryHint: srcDir ? "src/app/layout.tsx" : "app/layout.tsx",
			label: "Next.js (no app/ or pages/ detected — assumed App Router)",
		};
	}

	if (pkg && hasDep(pkg, "@craco/craco")) {
		return {
			kind: "craco",
			srcDir: true,
			entryHint: "src/index.tsx",
			label: "CRACO",
		};
	}

	if (pkg && hasDep(pkg, "react-scripts")) {
		return {
			kind: "cra",
			srcDir: true,
			entryHint: "src/index.tsx",
			label: "Create React App",
		};
	}

	if (pkg && (hasDep(pkg, "vite") || exists(cwd, "vite.config.ts") || exists(cwd, "vite.config.js"))) {
		return {
			kind: "vite",
			srcDir: true,
			entryHint: exists(cwd, "src", "main.tsx") ? "src/main.tsx" : "src/main.jsx",
			label: "Vite + React",
		};
	}

	return {
		kind: "unknown",
		srcDir,
		entryHint: srcDir ? "src/index.tsx" : "index.tsx",
		label: "Unknown framework",
	};
}
