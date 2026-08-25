import { defineConfig, type ViteUserConfig } from "vitest/config";

/** The knobs that actually differ between packages. Everything else is shared. */
export interface PackageTestOptions {
	/** `"node"` for logic-only packages, `"jsdom"` for anything rendering React. */
	environment?: "node" | "jsdom";
	/** Also pick up `.test.tsx` files. Set for packages that render components. */
	tsx?: boolean;
	/** Setup modules run before the suite (jsdom shims, matchers). */
	setupFiles?: string[];
	/** Globs to exclude on top of the defaults. */
	exclude?: string[];
	/** `expectTypeOf` support — runs the type-level suite through tsc. */
	typecheck?: NonNullable<ViteUserConfig["test"]>["typecheck"];
}

/**
 * Shared Vitest configuration for a workspace package.
 *
 * Collapses the five near-identical per-package configs onto one shape:
 * `globals: true`, colocated `src/**` tests plus a `test/**` directory, and
 * a node environment by default. Packages pass only what they genuinely
 * differ on.
 *
 * Kept as a factory rather than an object to merge, because Vitest's
 * `mergeConfig` concatenates arrays — a package asking for a *narrower*
 * `include` would silently get the union with the base instead.
 * @param options - The per-package differences
 * @returns A Vitest config ready to `export default`
 * @example
 * // packages/tokens/vitest.config.ts
 * export default definePackageTests();
 * // packages/components/vitest.config.ts
 * export default definePackageTests({
 *   environment: "jsdom",
 *   tsx: true,
 *   setupFiles: ["./vitest.setup.ts"],
 * });
 */
export function definePackageTests(options: PackageTestOptions = {}): ViteUserConfig {
	const { environment = "node", tsx = false, setupFiles, exclude, typecheck } = options;

	const include = ["src/**/*.test.ts", "test/**/*.test.ts"];
	if (tsx) include.push("src/**/*.test.tsx", "test/**/*.test.tsx");

	return defineConfig({
		test: {
			environment,
			globals: true,
			include,
			...(setupFiles ? { setupFiles } : {}),
			...(exclude ? { exclude } : {}),
			...(typecheck ? { typecheck } : {}),
		},
	});
}
