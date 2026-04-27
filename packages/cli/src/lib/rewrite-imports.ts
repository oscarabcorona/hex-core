export interface AliasConfig {
	components: string;
	lib: string;
	hooks: string;
}

/**
 * Default aliases — the values `hex init` writes into a fresh `hex.config.json`.
 * Used when no config is present so `add` still produces resolvable imports.
 */
export const DEFAULT_ALIASES: AliasConfig = {
	components: "@/components",
	lib: "@/lib",
	hooks: "@/hooks",
};

/**
 * Rewrite the monorepo-source-style imports the registry ships into the
 * paths a consumer's project actually has, and drop the `.js` suffix that
 * only resolves under `moduleResolution: "bundler" | "node16"` and is not
 * idiomatic in TS source either way.
 *
 * Registry source style (what we get):
 *   import { cn } from "../../lib/utils.js"
 *   import { Command, ... } from "../command/command.js"        // sibling-dir
 *   import { Button } from "../../primitives/button/button.js"  // legacy primitive
 *   import { ... } from "../_shared/layout-variants.js"
 *
 * After rewrite (with @/-style aliases):
 *   import { cn } from "@/lib/utils"
 *   import { Command, ... } from "@/components/ui/command"
 *   import { Button } from "@/components/ui/button"
 *   import { ... } from "@/components/_shared/layout-variants"
 */
export function rewriteRegistryImports(content: string, aliases: AliasConfig = DEFAULT_ALIASES): string {
	let out = content;

	// 1. Anything-depth-of-"../" then "lib/utils[.js]" → aliases.lib + "/utils".
	out = out.replace(
		/(["'])(?:\.\.\/)+lib\/utils(?:\.js)?\1/g,
		(_, q) => `${q}${aliases.lib}/utils${q}`,
	);

	// 2. Sibling-component-directory imports: "../<name>/<name>[.js]" or
	//    "../../primitives/<name>/<name>[.js]" → components/ui/<name>. The
	//    capture forces the directory and file slug to match (registry
	//    convention — guards against rewriting unrelated paths).
	out = out.replace(
		/(["'])(?:\.\.\/)+(?:primitives\/)?([a-z][a-z0-9-]*)\/\2(?:\.js)?\1/g,
		(_, q, name) => `${q}${aliases.components}/ui/${name}${q}`,
	);

	// 3. Shared internal modules: "../_shared/<name>[.js]" → components/_shared/<name>.
	out = out.replace(
		/(["'])(?:\.\.\/)+_shared\/([a-z][a-z0-9-]*)(?:\.js)?\1/g,
		(_, q, name) => `${q}${aliases.components}/_shared/${name}${q}`,
	);

	// 4. Any remaining relative import ending in `.js` — drop the suffix.
	//    Restricted to specifiers that begin with `.` so bare specifiers
	//    (`react`, `@radix-ui/...`) are untouched.
	out = out.replace(
		/((?:from|import)\s+(?:type\s+)?[^"'`]*?["']\.[^"']*?)\.js(["'])/g,
		"$1$2",
	);
	out = out.replace(
		/(export\s+[^"'`]*?from\s+["']\.[^"']*?)\.js(["'])/g,
		"$1$2",
	);

	return out;
}
