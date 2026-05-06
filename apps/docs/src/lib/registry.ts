import registryIndex from "../../../../registry/registry.json";

export interface RegistryIndexItem {
	name: string;
	displayName: string;
	description: string;
	category: string;
	subcategory?: string;
	tags: string[];
	internalDeps: string[];
	tokenBudget?: number;
}

export interface PropDef {
	name: string;
	type: string;
	required: boolean;
	default?: unknown;
	description: string;
	enumValues?: string[];
}

export interface VariantDef {
	name: string;
	description: string;
	values: { value: string; description: string }[];
	default: string;
}

export interface AIHints {
	whenToUse: string;
	whenNotToUse: string;
	commonMistakes: string[];
	relatedComponents: string[];
	accessibilityNotes: string;
	tokenBudget: number;
}

export interface Example {
	title: string;
	description: string;
	code: string;
}

export interface RegistryItem {
	name: string;
	displayName: string;
	description: string;
	category: string;
	subcategory?: string;
	version?: string;
	framework?: string;
	props: PropDef[];
	variants: VariantDef[];
	examples: Example[];
	ai: AIHints;
	dependencies: { npm: string[]; internal: string[]; peer: string[] };
	tags: string[];
}

interface RegistryIndex {
	items: RegistryIndexItem[];
}

const index = registryIndex as RegistryIndex;

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
};

/** Preferred display order of categories across the docs surface. */
export const CATEGORY_ORDER = ["primitive", "ai", "component", "block", "hook"] as const;

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
