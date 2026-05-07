export interface AliasConfig {
	components: string;
	lib: string;
	/**
	 * Optional — `hex init` no longer writes this by default since no registry
	 * item imports from a `hooks/` path. Kept on the type for consumers who
	 * extended their `hex.config.json` manually.
	 */
	hooks?: string;
}

/**
 * Default aliases — the values `hex init` writes into a fresh `hex.config.json`.
 * Used when no config is present so `add` still produces resolvable imports.
 */
export const DEFAULT_ALIASES: AliasConfig = {
	components: "@/components",
	lib: "@/lib",
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
 *   import { buttonVariants } from "./button-variants.js"       // sibling-file (extracted CVA)
 *   import { buttonVariants } from "../../primitives/button/button-variants.js"  // cross-pkg variants
 *
 * After rewrite (with @/-style aliases):
 *   import { cn } from "@/lib/utils"
 *   import { Command, ... } from "@/components/ui/command"
 *   import { Button } from "@/components/ui/button"
 *   import { ... } from "@/components/_shared/layout-variants"
 *   import { buttonVariants } from "@/components/ui/button-variants"
 */
export function rewriteRegistryImports(content: string, aliases: AliasConfig = DEFAULT_ALIASES): string {
	let out = content;

	// 1. Anything-depth-of-"../" then "lib/utils[.js]" → aliases.lib + "/utils".
	out = out.replace(
		/(["'])(?:\.\.\/)+lib\/utils(?:\.js)?\1/g,
		(_, q) => `${q}${aliases.lib}/utils${q}`,
	);

	// 2. Sibling-component-directory imports: "../<name>/<name>[.js]",
	//    "../../primitives/<name>/<name>[.js]", or
	//    "../../components/<name>/<name>[.js]" → components/ui/<name>. The
	//    `components/` arm is what blocks need: a block at
	//    `blocks/<slug>/<slug>.tsx` importing a molecule lives two segments
	//    deep, so its specifier resolves to `../../components/alert/alert`
	//    rather than the single-`..` sibling shape primitives use. The
	//    capture forces the directory and file slug to match (registry
	//    convention — guards against rewriting unrelated paths).
	out = out.replace(
		/(["'])(?:\.\.\/)+(?:primitives\/|components\/)?([a-z][a-z0-9-]*)\/\2(?:\.js)?\1/g,
		(_, q, name) => `${q}${aliases.components}/ui/${name}${q}`,
	);

	// 3. Shared internal modules: "../_shared/<name>[.js]" → components/_shared/<name>.
	out = out.replace(
		/(["'])(?:\.\.\/)+_shared\/([a-z][a-z0-9-]*)(?:\.js)?\1/g,
		(_, q, name) => `${q}${aliases.components}/_shared/${name}${q}`,
	);

	// 4a. Cross-package variants `../<...>/<dir>/<dir>-variants[.js]` — the
	//     file slug differs from the dir slug, so rule 2's `\2` backreference
	//     skips it. Flatten to components/ui/<dir>-variants for consumers.
	out = out.replace(
		/(["'])(?:\.\.\/)+(?:primitives\/|components\/)?([a-z][a-z0-9-]*)\/\2-variants(?:\.js)?\1/g,
		(_, q, name) => `${q}${aliases.components}/ui/${name}-variants${q}`,
	);

	// 4b. Sibling variants `./<slug>-variants` — alias the relative path so
	//     resolution stays consistent with the rest of components/ui/.
	out = out.replace(
		/(["'])\.\/([a-z][a-z0-9-]*-variants)(?:\.js)?\1/g,
		(_, q, name) => `${q}${aliases.components}/ui/${name}${q}`,
	);

	// 5. Any remaining relative import ending in `.js` — drop the suffix.
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
