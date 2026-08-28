import {
	registryIndexSchema,
	type RegistryIndex,
	type RegistryIndexItem,
	type RegistryItem,
} from "@hex-core/registry";
import registryIndex from "../../../../registry/registry.json";

/**
 * Typed access to the committed registry index.
 *
 * The types come from `@hex-core/registry`, which infers them from the Zod
 * schemas that `scripts/build-registry.ts` validates every item against.
 * This module used to redeclare six of them by hand — `RegistryItem`,
 * `RegistryIndexItem`, `PropDef`, `VariantDef`, `AIHints`, `Example` — and
 * then `as`-cast the imported JSON into them, so a schema change could
 * drift the docs types silently and the cast would keep compiling.
 *
 * Parsing at the boundary is the fix: a registry that no longer matches
 * the schema fails the build here rather than rendering wrong.
 */
const index: RegistryIndex = registryIndexSchema.parse(registryIndex);

export type { RegistryIndexItem };

/** All component summaries from the registry index. */
export function listComponents(): RegistryIndexItem[] {
	return index.items;
}

/** Subset of registry items whose `category` is `"block"` — page-level compositions. */
export function listBlocks(): RegistryIndexItem[] {
	return index.items.filter((item) => item.category === "block");
}

/** Display labels for the `category` field on each registry item. */
export const CATEGORY_LABELS: Record<string, string> = {
	primitive: "Primitives",
	ai: "AI",
	component: "Components",
	block: "Blocks",
	hook: "Hooks",
	motion: "Motion",
	artifact: "Artifacts",
};

/** Preferred display order of categories across the docs surface. */
export const CATEGORY_ORDER = [
	"primitive",
	"ai",
	"motion",
	"artifact",
	"component",
	"block",
	"hook",
] as const;

/**
 * Group components by `category` (primitive, component, block, etc.). Return
 * type is `Partial<Record>` because callers must handle missing categories
 * (e.g. the registry has no `hook` entries today).
 * @returns Record of category → components list (values possibly undefined)
 */
export function componentsByCategory(): Partial<Record<string, RegistryIndexItem[]>> {
	const groups: Partial<Record<string, RegistryIndexItem[]>> = {};
	for (const item of index.items) {
		const list = groups[item.category] ?? [];
		list.push(item);
		groups[item.category] = list;
	}
	return groups;
}

/**
 * Derive the install command for a component.
 * @param slug - Component name
 * @returns The pnpm dlx install command
 */
export function installCommand(slug: string): string {
	return `pnpm dlx @hex-core/cli add ${slug}`;
}

/** Label for the install command's package manager (e.g. shown as a code-block header). */
export const INSTALL_COMMAND_LABEL = "pnpm";

/**
 * Fallback usage stub for components without examples. Returns an import-only
 * snippet so the "Usage" section always has something to render when there's
 * no live demo/example. Components that ship an `examples[0]` show that code
 * via `ComponentPreview` instead — the caller is expected to check.
 * @param item - Full registry item
 * @returns A minimal import stub
 */
export function usageFallback(item: RegistryItem): string {
	return `import { ${item.displayName} } from "@/components/ui/${item.name}"`;
}

/**
 * Convert a heading title into a URL-safe anchor slug.
 * @param title - The section title
 * @returns A lowercase, hyphen-separated slug
 */
export function slugify(title: string): string {
	return title.toLowerCase().replace(/\s+/g, "-");
}
