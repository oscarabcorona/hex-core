import { z } from "zod";
import { compareStrings } from "../lib/compare.js";
import { loadGraph } from "../graph/graph-loader.js";
import type { CatalogGraph } from "../graph/graph-schema.js";
import { neighbors, requiresClosure } from "../graph/graph-query.js";
import { loadRecipe as loadRecipeFromDisk, loadRecipes, type Recipe, type RecipeIndex } from "../loaders/recipe-loader.js";
import { loadRegistry, type RegistryIndex } from "../loaders/registry-loader.js";
import { resolveSpec } from "./resolver.js";

/**
 * Application-map builder — the deterministic "map a big app brief onto
 * the catalog" engine behind `hex map` and MCP `map_application`.
 * Pipeline: segment the brief → score each segment with `resolveSpec` →
 * type each segment as a page-recipe / recipe / components screen →
 * expand to a full install list via the graph's `requires` closure →
 * attach suggestions, anti-pattern warnings, checklist, and token
 * budgets. No LLM anywhere: the calling agent supplies judgment, this
 * module supplies a reproducible mapping it can cite.
 */

/** Map format version this build emits and understands. */
export const MAP_FORMAT_VERSION = 1;

/**
 * Validate a raw parsed value as an application map, checking `version`
 * first so a map written by a newer CLI produces an actionable upgrade
 * message instead of a bare zod literal error. `hex.map.json` is
 * long-lived and user-committed, so this path matters.
 * @param raw - Value obtained from `JSON.parse` of a hex.map.json
 * @returns A zod-style result carrying the map or the failure reason
 */
export function parseMap(raw: unknown): { success: true; data: ApplicationMap } | { success: false; error: string } {
	if (typeof raw === "object" && raw !== null && "version" in raw) {
		const version = (raw as { version: unknown }).version;
		if (typeof version === "number" && version > MAP_FORMAT_VERSION) {
			return {
				success: false,
				error: `map is format v${version}, but this build understands v${MAP_FORMAT_VERSION} — update @hex-core/cli, or re-run \`hex map\` to regenerate it`,
			};
		}
	}
	const result = mapSchema.safeParse(raw);
	if (result.success) return { success: true, data: result.data };
	return {
		success: false,
		error: result.error.issues
			.slice(0, 5)
			.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
			.join("; "),
	};
}

/** `$schema` URL stamped on every emitted map. */
export const MAP_SCHEMA_URL = "https://hex-core.dev/schema/map.json";

/** Minimum `resolveSpec` score for a recipe to claim a whole segment. */
const RECIPE_SCORE_THRESHOLD = 12;
/** Minimum component score to appear on a `components` screen. */
const COMPONENT_SCORE_THRESHOLD = 5;
/** Max components kept on a `components` screen. */
const COMPONENTS_PER_SCREEN = 6;
/** Max segments a brief is split into (excess merges into the last). */
const MAX_SEGMENTS = 12;
/** Max related-component suggestions on a map. */
const MAX_SUGGESTIONS = 8;

/**
 * Slug pattern for every map field that flows into file paths, generated
 * identifiers, or registry lookups (`screens[].id`, section ids, block /
 * component / recipe slugs). `hex.map.json` is a hand-edited, shareable
 * artifact — without this constraint a hostile map could smuggle path
 * traversal (`"id": "../../.git/hooks/x"`) into `hex poc`'s file writes
 * or break out of generated source. Every builder-produced value already
 * conforms.
 */
const MAP_SLUG = /^[a-z0-9][a-z0-9-]*$/;

/** One planned screen (or feature area) of the mapped application. */
export const mapScreenSchema = z
	.object({
		id: z.string().regex(MAP_SLUG),
		name: z.string().min(1),
		segment: z.string().min(1),
		source: z.enum(["page-recipe", "recipe", "components"]),
		recipe: z.string().regex(MAP_SLUG).optional(),
		sections: z
			.array(
				z
					.object({
						id: z.string().regex(MAP_SLUG),
						block: z.string().regex(MAP_SLUG),
						intent: z.string(),
						role: z.string(),
					})
					.strict(),
			)
			.optional(),
		components: z.array(z.string().regex(MAP_SLUG)),
		score: z.number(),
		confidence: z.enum(["high", "medium", "low"]),
		matchReason: z.array(z.string()),
	})
	.strict();
export type MapScreen = z.infer<typeof mapScreenSchema>;

/** The full application map — the artifact `hex.map.json` holds. */
export const mapSchema = z
	.object({
		$schema: z.string(),
		version: z.literal(1),
		brief: z.string(),
		screens: z.array(mapScreenSchema),
		theme: z.object({ preset: z.string() }).strict(),
		install: z.object({ components: z.array(z.string().regex(MAP_SLUG)) }).strict(),
		suggestions: z
			.array(z.object({ slug: z.string(), reason: z.string(), via: z.literal("related") }).strict()),
		warnings: z.array(z.object({ slug: z.string(), insteadUse: z.string(), note: z.string() }).strict()),
		checklist: z.array(
			z
				.object({
					id: z.string(),
					check: z.string(),
					severity: z.string(),
					source: z.string(),
					from: z.string(),
				})
				.strict(),
		),
		tokenBudget: z.object({ total: z.number(), byScreen: z.record(z.string(), z.number()) }).strict(),
	})
	.strict();
export type ApplicationMap = z.infer<typeof mapSchema>;

/** Injection options — the CLI passes its own registry snapshot so its registry-dir resolution stays authoritative. */
export interface MapBuilderOptions {
	/** Catalog graph snapshot; defaults to the payload registry directory. */
	graph?: CatalogGraph;
	/** Registry index snapshot; defaults to the payload registry directory. */
	registry?: RegistryIndex;
	/** Recipe index snapshot; defaults to the payload registry directory. */
	recipes?: RecipeIndex;
	/** Compiled-recipe loader; defaults to the payload registry directory. */
	loadRecipe?: (slug: string) => Recipe | null;
	/** Per-segment component-match limit passed to `resolveSpec`. */
	limit?: number;
}

/**
 * Split a freeform brief into screen-sized segments. Splits on newlines,
 * bullet markers, semicolons, sentence boundaries, and connective
 * phrases ("plus", "and a/an…"), then merges fragments too short to
 * carry meaning (fewer than 2 scoring tokens) into their predecessor and caps the
 * count at 12. Exported for tests and for CLIs that want to show which
 * segment produced which screen.
 * @param brief - Freeform application description
 * @returns Ordered non-empty segments (never empty for a non-blank brief)
 */
export function segmentBrief(brief: string): string[] {
	// Collapse whitespace runs first. The split pattern below contains
	// `\s+` sequences followed by literals that can fail to match, which
	// backtracks polynomially on long whitespace runs (CodeQL
	// js/polynomial-redos): a brief with 64k consecutive tabs took 2.2s
	// before this, growing 4x per doubling. Briefs are uncontrolled input —
	// `hex map --spec` reads an arbitrary file. After normalization every
	// `\s+` can match at most one character, so the split is linear.
	// Both replaces are single unanchored quantifiers with nothing after
	// them to fail, so they cannot backtrack.
	const normalized = brief.replace(/[^\S\n]+/g, " ").replace(/\n+/g, "\n");

	const rough = normalized
		.split(/[\n;.!?]+|(?:^|\s)[-*•]\s+|,?\s+(?:plus|and then|then)\s+|,\s+(?:and\s+)?(?=an?\s)/g)
		.map((part) => (part ?? "").trim())
		.filter((part) => part.length > 0);

	const tokenCount = (text: string): number =>
		text
			.toLowerCase()
			.split(/[^a-z0-9]+/)
			.filter((t) => t.length >= 3).length;

	const merged: string[] = [];
	for (const part of rough) {
		if (merged.length > 0 && tokenCount(part) < 2) {
			merged[merged.length - 1] = `${merged[merged.length - 1]} ${part}`;
		} else {
			merged.push(part);
		}
	}
	// A leading short fragment had no predecessor — fold it forward.
	if (merged.length >= 2 && tokenCount(merged[0]) < 2) {
		merged[1] = `${merged[0]} ${merged[1]}`;
		merged.shift();
	}
	if (merged.length > MAX_SEGMENTS) {
		const head = merged.slice(0, MAX_SEGMENTS - 1);
		head.push(merged.slice(MAX_SEGMENTS - 1).join(" "));
		return head;
	}
	return merged.length > 0 ? merged : [normalized.trim()].filter((s) => s.length > 0);
}

/**
 * Slugify a text fragment into a screen id.
 * @param input - Arbitrary text
 * @returns Lowercase hyphenated slug, capped at 32 chars, never empty
 */
function slugifyId(input: string): string {
	let raw = input
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^(?:a|an|the)-/, "")
		// The collapse above leaves no adjacent hyphens, so a bounded `-?`
		// is sufficient. `/^-+|-+$/` would backtrack polynomially on a long
		// interior hyphen run (CodeQL js/polynomial-redos, ~96ms at 16k).
		.replace(/^-/, "")
		.replace(/-$/, "");
	if (raw.length > 32) {
		// Cut at a word boundary so ids never end mid-word.
		const cut = raw.slice(0, 32);
		raw = cut.includes("-") ? cut.slice(0, cut.lastIndexOf("-")) : cut;
	}
	return raw.length > 0 ? raw : "screen";
}

/**
 * Title-case a slug for display ("pricing-page" → "Pricing page").
 * @param slug - Lowercase hyphenated slug
 * @returns Display name
 */
function titleFromSlug(slug: string): string {
	const spaced = slug.replace(/-/g, " ");
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Grade how decisively the top candidate beat the runner-up.
 * @param top - Winning score
 * @param runnerUp - Second-best score in the same pool (0 when absent)
 * @returns Confidence bucket
 */
function gradeConfidence(top: number, runnerUp: number): "high" | "medium" | "low" {
	if (runnerUp <= 0) return "high";
	if (top >= runnerUp * 2) return "high";
	if (top < runnerUp * 1.2) return "low";
	return "medium";
}

/**
 * Build a deterministic application map from a freeform brief.
 * Same brief + same registry snapshot ⇒ byte-identical map.
 * @param brief - Freeform description of the application to build
 * @param options - Injected registry/graph snapshots and limits
 * @returns The application map (empty screens/install for an unmatchable brief)
 */
export function buildApplicationMap(brief: string, options: MapBuilderOptions = {}): ApplicationMap {
	const graph = options.graph ?? loadGraph();
	const registry = options.registry ?? loadRegistry();
	const recipes = options.recipes ?? loadRecipes();
	const loadRecipeBySlug = options.loadRecipe ?? loadRecipeFromDisk;

	const recipeInfo = new Map(recipes.items.map((r) => [r.slug, r]));
	const itemBudget = new Map(registry.items.map((i) => [i.name, i.tokenBudget ?? 0]));

	const screens: MapScreen[] = [];
	const usedRecipes = new Set<string>();
	const usedIds = new Set<string>();

	/**
	 * Reserve a unique screen id, suffixing on collision.
	 * @param base - Preferred id
	 * @returns The reserved id
	 */
	const reserveId = (base: string): string => {
		let id = base;
		let n = 2;
		while (usedIds.has(id)) {
			id = `${base}-${n}`;
			n += 1;
		}
		usedIds.add(id);
		return id;
	};

	for (const segment of segmentBrief(brief)) {
		const result = resolveSpec(segment, { registry, recipes, limit: options.limit ?? 8 });

		// Prefer page recipes: EVERY page recipe clearing the threshold gets a
		// screen (a segment like "landing page and pricing page" names two).
		// Otherwise the single best recipe of any kind claims the segment.
		const scoredRecipes = result.recipes.filter((r) => r.score >= RECIPE_SCORE_THRESHOLD);
		const pageMatches = scoredRecipes.filter((r) => recipeInfo.get(r.slug)?.kind === "page");
		const selected = pageMatches.length > 0 ? pageMatches : scoredRecipes.slice(0, 1);

		if (selected.length > 0) {
			const selectedSlugs = new Set(selected.map((r) => r.slug));
			// Page screens measure ambiguity against rival *page* recipes only —
			// a component recipe covering a subset (landing-hero vs landing-page)
			// is composition, not a competing interpretation.
			const runnerUp =
				pageMatches.length > 0
					? (result.recipes.find(
							(r) => !selectedSlugs.has(r.slug) && recipeInfo.get(r.slug)?.kind === "page",
						)?.score ?? 0)
					: (result.recipes.find((r) => !selectedSlugs.has(r.slug))?.score ?? 0);
			for (const recipeMatch of selected) {
				if (usedRecipes.has(recipeMatch.slug)) continue;
				usedRecipes.add(recipeMatch.slug);
				const info = recipeInfo.get(recipeMatch.slug);
				const compiled = loadRecipeBySlug(recipeMatch.slug);
				const isPage = info?.kind === "page";
				const screen: MapScreen = {
					id: reserveId(recipeMatch.slug.replace(/-page$/, "")),
					name: recipeMatch.title,
					segment,
					source: isPage ? "page-recipe" : "recipe",
					recipe: recipeMatch.slug,
					components: info?.components ?? [],
					score: recipeMatch.score,
					confidence: gradeConfidence(recipeMatch.score, runnerUp),
					matchReason: recipeMatch.matchReason,
				};
				if (isPage && compiled) {
					screen.sections = compiled.sections.map((s) => ({
						id: s.id,
						block: s.block,
						intent: s.intent,
						role: s.role,
					}));
				}
				screens.push(screen);
			}
			continue;
		}

		const components = result.components
			.filter((c) => c.score >= COMPONENT_SCORE_THRESHOLD)
			.slice(0, COMPONENTS_PER_SCREEN);
		if (components.length === 0) continue;

		screens.push({
			id: reserveId(slugifyId(segment)),
			name: titleFromSlug(components[0].component),
			segment,
			source: "components",
			components: components.map((c) => c.component),
			score: components[0].score,
			confidence: gradeConfidence(components[0].score, components[1]?.score ?? 0),
			matchReason: components[0].matchReason,
		});
	}

	return assembleMap(brief, screens, { graph, recipeInfo, itemBudget, loadRecipeBySlug });
}

/** Shared context for `assembleMap`. */
interface AssembleContext {
	graph: CatalogGraph;
	recipeInfo: Map<string, RecipeIndex["items"][number]>;
	itemBudget: Map<string, number>;
	loadRecipeBySlug: (slug: string) => Recipe | null;
}

/**
 * Assemble the full application map for a set of screens: `requires`
 * closure, related suggestions, anti-pattern warnings, theme vote,
 * merged checklist, and token budgets. Shared by the brief pipeline and
 * `mapFromRecipe`.
 * @param brief - The originating brief (recorded verbatim on the map)
 * @param screens - Typed screens in final order
 * @param ctx - Graph + registry lookups
 * @returns The completed application map
 */
function assembleMap(brief: string, screens: MapScreen[], ctx: AssembleContext): ApplicationMap {
	const { graph, recipeInfo, itemBudget, loadRecipeBySlug } = ctx;

	// Full install list: every screen's components expanded through `requires`.
	const directSlugs = screens.flatMap((s) => s.components);
	const install = requiresClosure(graph, directSlugs);
	const installSet = new Set(install);

	// Related 1-hop suggestions — schema-authored "you might also want".
	const suggestionMap = new Map<string, string>();
	for (const slug of install) {
		for (const neighbor of neighbors(graph, slug, ["related"])) {
			if (neighbor.direction !== "out") continue;
			if (neighbor.node.kind !== "item" || installSet.has(neighbor.node.slug)) continue;
			if (!suggestionMap.has(neighbor.node.slug)) {
				suggestionMap.set(neighbor.node.slug, `related to ${slug}`);
			}
		}
	}
	const suggestions = [...suggestionMap.entries()]
		.sort((a, b) => compareStrings(a[0], b[0]))
		.slice(0, MAX_SUGGESTIONS)
		.map(([slug, reason]) => ({ slug, reason, via: "related" as const }));

	// Anti-pattern warnings for anything being installed.
	const warnings: ApplicationMap["warnings"] = [];
	for (const slug of install) {
		for (const neighbor of neighbors(graph, slug, ["instead-use"])) {
			if (neighbor.direction !== "out") continue;
			warnings.push({ slug, insteadUse: neighbor.node.slug, note: neighbor.edge.note ?? "" });
		}
	}
	warnings.sort((a, b) => compareStrings(a.slug, b.slug) || compareStrings(a.insteadUse, b.insteadUse));

	// Theme: majority preset across matched page recipes (via graph `themes` edges).
	const presetVotes = new Map<string, number>();
	for (const screen of screens) {
		if (screen.source !== "page-recipe" || !screen.recipe) continue;
		for (const neighbor of neighbors(graph, screen.recipe, ["themes"])) {
			if (neighbor.node.kind !== "theme") continue;
			presetVotes.set(neighbor.node.slug, (presetVotes.get(neighbor.node.slug) ?? 0) + 1);
		}
	}
	const preset =
		[...presetVotes.entries()].sort((a, b) => b[1] - a[1] || compareStrings(a[0], b[0]))[0]?.[0] ?? "default";

	// Merged checklist with recipe provenance, deduped by id (first wins).
	const checklist: ApplicationMap["checklist"] = [];
	const checklistIds = new Set<string>();
	for (const screen of screens) {
		if (!screen.recipe) continue;
		const compiled = loadRecipeBySlug(screen.recipe);
		for (const item of compiled?.checklist ?? []) {
			if (checklistIds.has(item.id)) continue;
			checklistIds.add(item.id);
			checklist.push({ ...item, from: screen.recipe });
		}
	}

	// Token budgets: page/recipe screens use the authored recipe budget when
	// present; components screens sum their items' budgets.
	const byScreen: Record<string, number> = {};
	for (const screen of screens) {
		const recipeBudget = screen.recipe ? recipeInfo.get(screen.recipe)?.tokenBudget : undefined;
		byScreen[screen.id] =
			recipeBudget ?? screen.components.reduce((sum, slug) => sum + (itemBudget.get(slug) ?? 0), 0);
	}
	const total = Object.values(byScreen).reduce((sum, n) => sum + n, 0);

	return {
		$schema: MAP_SCHEMA_URL,
		version: 1,
		brief,
		screens,
		theme: { preset },
		install: { components: install },
		suggestions,
		warnings,
		checklist,
		tokenBudget: { total, byScreen },
	};
}

/**
 * Build an application map for one explicitly chosen recipe (the
 * `hex poc --recipe <slug>` / MCP `scaffold_poc {recipe}` path) — no
 * scoring involved, the choice is the caller's.
 * @param slug - Recipe slug to materialize
 * @param options - Injected registry/graph snapshots
 * @returns The single-screen application map
 * @throws {Error} When the slug names no recipe
 */
export function mapFromRecipe(slug: string, options: MapBuilderOptions = {}): ApplicationMap {
	const graph = options.graph ?? loadGraph();
	const registry = options.registry ?? loadRegistry();
	const recipes = options.recipes ?? loadRecipes();
	const loadRecipeBySlug = options.loadRecipe ?? loadRecipeFromDisk;

	const recipeInfo = new Map(recipes.items.map((r) => [r.slug, r]));
	const itemBudget = new Map(registry.items.map((i) => [i.name, i.tokenBudget ?? 0]));

	const info = recipeInfo.get(slug);
	const compiled = loadRecipeBySlug(slug);
	if (!info || !compiled) {
		throw new Error(`Unknown recipe "${slug}" — run \`hex recipe list\` for available slugs.`);
	}
	const isPage = info.kind === "page";
	const screen: MapScreen = {
		id: slug.replace(/-page$/, ""),
		name: info.title,
		segment: `recipe ${slug}`,
		source: isPage ? "page-recipe" : "recipe",
		recipe: slug,
		components: info.components,
		score: 0,
		confidence: "high",
		matchReason: ["explicitly requested"],
	};
	if (isPage) {
		screen.sections = compiled.sections.map((s) => ({
			id: s.id,
			block: s.block,
			intent: s.intent,
			role: s.role,
		}));
	}
	return assembleMap(screen.segment, [screen], { graph, recipeInfo, itemBudget, loadRecipeBySlug });
}

/**
 * Serialize a map with stable formatting (2-space indent, construction
 * key order) — the canonical bytes for `hex.map.json`.
 * @param map - The application map to serialize
 * @returns Pretty-printed JSON without a trailing newline
 */
export function stableStringifyMap(map: ApplicationMap): string {
	return JSON.stringify(map, null, 2);
}
