import { z } from "zod";
import { internalDepToSlug } from "./recipe-schema.js";
import { aiHintSchema, type RegistryItem } from "./schema.js";

/**
 * Interop with the shadcn CLI's namespaced-registry protocol.
 *
 * shadcn CLI 3+ installs from any registry declared in the consumer's
 * `components.json`:
 *
 * ```json
 * { "registries": { "@hex": "https://hex-core.dev/r/{name}.json" } }
 * ```
 *
 * after which `npx shadcn@latest add @hex/button` fetches that URL and
 * expects the registry-item wire format documented at
 * https://ui.shadcn.com/schema/registry-item.json. Hex items are richer than
 * that format (structured dependencies, machine-readable `ai` block, token
 * metadata), so the docs site serves each item through this projection: the
 * shadcn-required fields are mapped, and the Hex extras ride along as
 * additive keys (`ai` top-level, catalog metadata under `meta`) per the
 * strategy of extending shadcn's standard rather than forking it.
 */

/** Item-level `type` values this projection emits. */
const shadcnItemTypeEnum = z.enum([
	"registry:ui",
	"registry:block",
	"registry:hook",
	"registry:lib",
	"registry:theme",
]);

/** File-level `type` values this projection emits. */
const shadcnFileTypeEnum = z.enum([
	"registry:ui",
	"registry:lib",
	"registry:hook",
	"registry:file",
]);

export const shadcnRegistryFileSchema = z.object({
	path: z.string(),
	content: z.string(),
	type: shadcnFileTypeEnum,
	/** Required by shadcn for `registry:file`; omitted otherwise. */
	target: z.string().optional(),
});

export type ShadcnRegistryFile = z.infer<typeof shadcnRegistryFileSchema>;

/**
 * Minimal mirror of shadcn's registry-item schema — the fields the shadcn
 * CLI reads — plus the additive Hex keys. Used by the round-trip test and
 * by any consumer that wants to validate what the `/r/{name}.json` route
 * serves.
 */
export const shadcnRegistryItemSchema = z.object({
	$schema: z.string(),
	name: z.string(),
	type: shadcnItemTypeEnum,
	title: z.string(),
	description: z.string(),
	dependencies: z.array(z.string()).optional(),
	files: z.array(shadcnRegistryFileSchema),
	cssVars: z
		.object({
			light: z.record(z.string(), z.string()).optional(),
			dark: z.record(z.string(), z.string()).optional(),
		})
		.optional(),
	/** Hex catalog metadata (category, tags, token budget) — additive. */
	meta: z
		.object({
			category: z.string(),
			subcategory: z.string().optional(),
			tags: z.array(z.string()),
			tokensUsed: z.array(z.string()),
			tokenBudget: z.number().optional(),
		})
		.optional(),
	/** The Hex machine-readable intent block — additive, verbatim. */
	ai: aiHintSchema.optional(),
});

export type ShadcnRegistryItem = z.infer<typeof shadcnRegistryItemSchema>;

/**
 * Map a Hex item category to the shadcn item `type`.
 * @param category - The Hex category
 * @returns The shadcn `registry:*` type
 */
function itemType(category: RegistryItem["category"]): z.infer<typeof shadcnItemTypeEnum> {
	switch (category) {
		case "block":
			return "registry:block";
		case "hook":
			return "registry:hook";
		case "lib":
			return "registry:lib";
		case "theme":
			return "registry:theme";
		case "primitive":
		case "component":
		case "example":
		case "ai":
		case "artifact":
		case "motion":
			return "registry:ui";
	}
}

/**
 * Map a Hex file type to the shadcn file `type`.
 *
 * The shadcn CLI places files by TYPE, not by registry path: `registry:ui`
 * flattens to the consumer's ui directory, `registry:lib` to the lib
 * directory. That matches the Hex layout for `components/ui/*` and `lib/*`
 * files — but anything else (`components/_shared/*`, styles, configs) would
 * be silently flattened somewhere imports don't expect, so those become
 * `registry:file` with the Hex path pinned as the install `target`.
 * @param file - The Hex registry file
 * @returns The projected shadcn file
 */
function projectFile(file: RegistryItem["files"][number]): ShadcnRegistryFile {
	switch (file.type) {
		case "component":
			if (!file.path.startsWith("components/ui/")) {
				return { path: file.path, content: file.content, type: "registry:file", target: file.path };
			}
			return { path: file.path, content: file.content, type: "registry:ui" };
		case "lib":
			if (!file.path.startsWith("lib/")) {
				return { path: file.path, content: file.content, type: "registry:file", target: file.path };
			}
			return { path: file.path, content: file.content, type: "registry:lib" };
		case "hook":
			return { path: file.path, content: file.content, type: "registry:hook" };
		case "style":
		case "config":
		case "test":
			return { path: file.path, content: file.content, type: "registry:file", target: file.path };
	}
}

/**
 * The slice of a registry item {@link ShadcnProjectionOptions.resolveInternalItem}
 * must return — just enough to walk the internal-dependency closure.
 */
export interface InternalDependencySource {
	dependencies: {
		npm?: string[];
		internal?: string[];
		heavyPeer?: { name: string; version: string }[];
	};
}

/** Options for {@link toShadcnRegistryItem}. */
export interface ShadcnProjectionOptions {
	/**
	 * Transform applied to every projected file's `content`. Hex registry
	 * sources ship monorepo-source-style import specifiers
	 * (`../../primitives/button/button.js`, `../command/command.js`,
	 * `../_shared/auth-adapter.js`) that only the Hex CLI's install-time
	 * rewrite makes resolvable — the shadcn CLI rewrites `@/` aliases but
	 * never relative paths. Callers serving items to shadcn consumers MUST
	 * pass `@hex-core/payload`'s `rewriteRegistryImports` here (injected
	 * rather than imported so this package keeps its dependency direction).
	 * Without a transform, content ships verbatim and the caller owns
	 * resolvability.
	 */
	transformFileContent?: (content: string, file: RegistryItem["files"][number]) => string;
	/**
	 * Lookup for internal dependencies by slug. Hex items inline their
	 * transitive FILES but list only their direct npm deps — the Hex CLI
	 * installs the rest while resolving `dependencies.internal` recursively,
	 * a pass the shadcn CLI does not have. With a resolver, the projection
	 * walks the internal closure and unions every reachable item's npm (and
	 * heavyPeer) deps into `dependencies`, so `shadcn add` installs a
	 * working component (e.g. combobox bundles dialog.tsx and therefore
	 * needs `@radix-ui/react-dialog`, which only `command`'s entry lists).
	 * Without it, only the item's own npm deps ship.
	 */
	resolveInternalItem?: (slug: string) => InternalDependencySource | null;
}

/**
 * Union the item's npm dependencies with those of its internal-dependency
 * closure (breadth-first, cycle-safe). heavyPeer entries are pinned as
 * `name@version` since the shadcn CLI has no opt-in prompt to defer them to.
 * @param item - The item being projected
 * @param resolve - Optional internal-dependency lookup; see
 * {@link ShadcnProjectionOptions.resolveInternalItem}
 * @returns The full npm dependency list for the shadcn wire object
 */
function collectNpmDependencies(
	item: RegistryItem,
	resolve: ShadcnProjectionOptions["resolveInternalItem"],
): string[] {
	const npm = new Set(item.dependencies.npm);
	const heavy = new Map<string, string>();
	for (const peer of item.dependencies.heavyPeer ?? []) heavy.set(peer.name, peer.version);

	if (resolve) {
		const queue = [...item.dependencies.internal];
		const visited = new Set<string>();
		while (queue.length > 0) {
			const dep = queue.shift();
			if (dep === undefined) break;
			// Internal deps come as source paths ("components/command/command")
			// or bare slugs; "lib/*" entries resolve to null and carry no npm
			// deps of their own beyond what items already list.
			const slug = dep.includes("/") ? internalDepToSlug(dep) : dep;
			if (!slug || visited.has(slug)) continue;
			visited.add(slug);
			const resolved = resolve(slug);
			if (!resolved) continue;
			for (const name of resolved.dependencies.npm ?? []) npm.add(name);
			for (const peer of resolved.dependencies.heavyPeer ?? []) {
				if (!heavy.has(peer.name)) heavy.set(peer.name, peer.version);
			}
			queue.push(...(resolved.dependencies.internal ?? []));
		}
	}

	return [...npm, ...[...heavy.entries()].map(([name, version]) => `${name}@${version}`)];
}

/**
 * Project a Hex registry item into the shadcn registry-item wire format.
 *
 * Notes on the mapping:
 * - `registryDependencies` is deliberately omitted: Hex items are built with
 *   their transitive internal files inlined, so a second resolution pass by
 *   the shadcn CLI would double-install shared files.
 * - `heavyPeer` dependencies (xterm, reactflow, …) are folded into
 *   `dependencies` as `name@version` — the shadcn CLI has no opt-in prompt,
 *   and a component that installs working beats one that saves bundle size
 *   by breaking.
 * - `peer` dependencies (react, react-dom) are NOT emitted; shadcn assumes
 *   the host project provides them.
 * @param item - The parsed Hex registry item
 * @param options - Projection options; see {@link ShadcnProjectionOptions}
 * @returns The shadcn-compatible wire object
 */
export function toShadcnRegistryItem(
	item: RegistryItem,
	options: ShadcnProjectionOptions = {},
): ShadcnRegistryItem {
	const dependencies = collectNpmDependencies(item, options.resolveInternalItem);

	const cssVariables = item.cssVariables ?? {};
	const cssVarEntries = Object.entries(cssVariables);
	const cssVars =
		cssVarEntries.length > 0
			? {
					light: Object.fromEntries(cssVarEntries.map(([name, v]) => [name, v.light])),
					dark: Object.fromEntries(cssVarEntries.map(([name, v]) => [name, v.dark])),
				}
			: undefined;

	return {
		$schema: "https://ui.shadcn.com/schema/registry-item.json",
		name: item.name,
		type: itemType(item.category),
		title: item.displayName,
		description: item.description,
		...(dependencies.length > 0 ? { dependencies } : {}),
		files: item.files.map((file) => {
			const projected = projectFile(file);
			return options.transformFileContent
				? { ...projected, content: options.transformFileContent(projected.content, file) }
				: projected;
		}),
		...(cssVars ? { cssVars } : {}),
		meta: {
			category: item.category,
			...(item.subcategory !== undefined ? { subcategory: item.subcategory } : {}),
			tags: item.tags,
			tokensUsed: item.tokensUsed,
			...(item.ai.tokenBudget !== undefined ? { tokenBudget: item.ai.tokenBudget } : {}),
		},
		ai: item.ai,
	};
}
