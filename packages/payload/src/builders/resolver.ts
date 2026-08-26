import { loadRegistry, loadRegistryItem, type RegistryIndex } from "../loaders/registry-loader.js";
import { loadRecipes, type RecipeIndex } from "../loaders/recipe-loader.js";

/**
 * Cap on the number of recipe matches returned by `resolveSpec`. Recipes
 * are a smaller, more opinionated surface than components so we surface
 * fewer of them — the agent should nearly always pick one.
 */
const MAX_RECIPE_MATCHES = 4;

type RegistryIndexItemLike = Pick<
	RegistryIndex["items"][number],
	"name" | "displayName" | "description" | "tags" | "tokenBudget"
>;

export interface ComponentMatch {
	component: string;
	displayName: string;
	score: number;
	matchReason: string[];
	whenToUse: string;
	whenNotToUse: string;
	relatedComponents: string[];
	tokenBudget?: number;
}

export interface RecipeMatch {
	slug: string;
	title: string;
	summary: string;
	score: number;
	matchReason: string[];
}

export interface ResolveResult {
	brief: string;
	components: ComponentMatch[];
	recipes: RecipeMatch[];
}

/**
 * Tokenize a freeform brief into lowercase word stems. The only
 * transformation is case-folding and splitting on non-alphanumerics; any
 * stopword-style filtering stays out of scope so a brief like "form for
 * pricing" still produces "form" + "pricing" rather than silently dropping
 * "for" via a list that would drift over time.
 * @param input - Freeform text to tokenize
 * @returns Deduped lowercase tokens of length >= 3
 */
function tokenize(input: string): string[] {
	const tokens = input
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((t) => t.length >= 3);
	return Array.from(new Set(tokens));
}

interface ComponentAiMeta {
	whenToUse: string;
	whenNotToUse: string;
	relatedComponents: string[];
}

/**
 * Build a component's AI meta by reading the full registry item.
 *
 * CALL THIS ONLY FOR RESULTS YOU ARE ABOUT TO RETURN. The previous comment
 * here claimed the full item is "small (tens of KB) so reading once per
 * resolve call is cheap" — that stopped being true at 187 items, and the
 * claim outliving the fact is what hid the cost. The items average ~17 KB;
 * calling this per scoring candidate read ~2.3 MB per brief to fill in three
 * strings on eight rows. `loadRegistryItem` memoizes, so the price is paid
 * once per process, but "once" was still 133 files on the first query of
 * every MCP session.
 * @param name - Component slug to look up
 * @returns AI meta, or empty strings / empty arrays when the item is missing
 */
function getComponentAi(name: string): ComponentAiMeta {
	const item = loadRegistryItem(name);
	const fallback: ComponentAiMeta = {
		whenToUse: "",
		whenNotToUse: "",
		relatedComponents: [],
	};
	if (!item) return fallback;

	const ai = item.ai;
	return {
		whenToUse: typeof ai?.whenToUse === "string" ? ai.whenToUse : "",
		whenNotToUse: typeof ai?.whenNotToUse === "string" ? ai.whenNotToUse : "",
		relatedComponents: Array.isArray(ai?.relatedComponents)
			? ai.relatedComponents.filter((c): c is string => typeof c === "string")
			: [],
	};
}

/**
 * Split text into a Set of lowercase alphanumeric words. Used by the
 * scoring functions so "and" can't substring-match "command" and "board"
 * can't substring-match "keyboard". Same tokenization rules as `tokenize`
 * — only the dedup shape differs (Set vs ordered array).
 * @param text - Arbitrary text to split
 * @returns Set of lowercase words (each length >= 1)
 */
export function wordSet(text: string): Set<string> {
	return new Set(
		text
			.toLowerCase()
			.split(/[^a-z0-9]+/)
			.filter((w) => w.length > 0),
	);
}

/**
 * Score a single registry index item against the brief's tokens.
 * Weighting favors structural signals (name, tags) over prose (description)
 * because an agent's brief almost always contains the component's tag
 * vocabulary ("form", "dialog") before it contains prose phrasing. Each
 * token contributes at most one match reason (the highest-weight hit),
 * so a component with "form" in name + tags + description still scores +10
 * for that token, not +14. Matches are word-boundary only — `name` is
 * compared token-equal, every other field is tokenized into a word set —
 * so short tokens like "and" cannot substring-match "command".
 * @param item - Registry index entry to score
 * @param tokens - Brief tokens produced by `tokenize`
 * @returns Aggregate score and a list of per-token match reasons
 */
function scoreComponent(item: RegistryIndexItemLike, tokens: string[]): {
	score: number;
	reasons: string[];
} {
	const reasons: string[] = [];
	let score = 0;

	const name = item.name.toLowerCase();
	const nameWords = wordSet(item.name);
	const displayWords = wordSet(item.displayName);
	const descriptionWords = wordSet(item.description);
	const tagSet = new Set(item.tags.map((t) => t.toLowerCase()));

	for (const token of tokens) {
		if (name === token) {
			score += 10;
			reasons.push(`name === "${token}"`);
			continue;
		}
		if (nameWords.has(token)) {
			score += 6;
			reasons.push(`name contains word "${token}"`);
			continue;
		}
		if (tagSet.has(token)) {
			score += 5;
			reasons.push(`tag matches "${token}"`);
			continue;
		}
		if (displayWords.has(token)) {
			score += 3;
			reasons.push(`displayName contains word "${token}"`);
			continue;
		}
		if (descriptionWords.has(token)) {
			score += 1;
			reasons.push(`description mentions word "${token}"`);
		}
	}

	return { score, reasons };
}

/**
 * Score a recipe index entry against the brief's tokens. Uses the same
 * word-boundary matching as `scoreComponent` — recipe slugs like
 * "command-palette" are tokenized to {"command", "palette"}, so "and"
 * from a brief cannot substring-match "command". Weighting favors slug +
 * tags over title + summary because tags and slugs are deliberate
 * vocabulary.
 * @param recipe - Recipe index entry to score
 * @param tokens - Brief tokens produced by `tokenize`
 * @returns Aggregate score and a list of per-token match reasons
 */
function scoreRecipe(
	recipe: RecipeIndex["items"][number] & { brief?: string },
	tokens: string[],
): {
	score: number;
	reasons: string[];
} {
	const reasons: string[] = [];
	let score = 0;

	const slugWords = wordSet(recipe.slug);
	const titleWords = wordSet(recipe.title);
	const summaryWords = wordSet(recipe.summary);
	const tagSet = new Set(recipe.tags.map((t) => t.toLowerCase()));

	for (const token of tokens) {
		if (slugWords.has(token)) {
			score += 8;
			reasons.push(`recipe slug contains word "${token}"`);
			continue;
		}
		if (tagSet.has(token)) {
			score += 6;
			reasons.push(`recipe tag matches "${token}"`);
			continue;
		}
		if (titleWords.has(token)) {
			score += 4;
			reasons.push(`recipe title contains word "${token}"`);
			continue;
		}
		if (summaryWords.has(token)) {
			score += 2;
			reasons.push(`recipe summary mentions word "${token}"`);
		}
	}

	return { score, reasons };
}

export interface ResolverOptions {
	limit?: number;
	registry?: RegistryIndex;
	recipes?: RecipeIndex;
}

/**
 * Resolve a plain-English brief into a ranked shortlist of components and
 * recipes. Deterministic: same input + same registry snapshot always
 * produces the same output, so agents can cite a specific slug with
 * confidence and CI can regression-test the resolver against fixed
 * briefs.
 * @param brief - Freeform description of the UI the agent wants to build
 * @param options - Optional overrides for the registry / recipe snapshots and result limit
 * @returns A ranked result containing component and recipe matches
 */
export function resolveSpec(brief: string, options: ResolverOptions = {}): ResolveResult {
	const tokens = tokenize(brief);
	if (tokens.length === 0) {
		return { brief, components: [], recipes: [] };
	}

	const registry = options.registry ?? loadRegistry();
	const recipes = options.recipes ?? loadRecipes();
	const limit = options.limit ?? 8;

	// Score first, WITHOUT touching the AI meta. Reading it here meant loading
	// the full item JSON for every candidate that scored above zero — on a
	// ten-token brief that is 133 of 187 items, ~2.3 MB read and parsed, to
	// produce three strings each for the 8 that survive the slice below.
	// Measured: 44.5 ms cold, against 1.4 ms warm. The AI fields are output
	// only — `scoreComponent` never reads them and neither does the sort — so
	// deferring them past the slice is free.
	interface ScoredComponent {
		item: (typeof registry.items)[number];
		score: number;
		reasons: string[];
	}
	const componentScored: ScoredComponent[] = [];
	for (const item of registry.items) {
		const { score, reasons } = scoreComponent(item, tokens);
		if (score <= 0) continue;
		componentScored.push({ item, score, reasons });
	}
	componentScored.sort(
		(a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name),
	);

	const componentMatches: ComponentMatch[] = componentScored
		.slice(0, limit)
		.map(({ item, score, reasons }) => {
			const ai = getComponentAi(item.name);
			return {
				component: item.name,
				displayName: item.displayName,
				score,
				matchReason: reasons,
				whenToUse: ai.whenToUse,
				whenNotToUse: ai.whenNotToUse,
				relatedComponents: ai.relatedComponents,
				tokenBudget: item.tokenBudget,
			};
		});

	const recipeScored: RecipeMatch[] = [];
	for (const recipe of recipes.items) {
		const { score, reasons } = scoreRecipe(recipe, tokens);
		if (score <= 0) continue;
		recipeScored.push({
			slug: recipe.slug,
			title: recipe.title,
			summary: recipe.summary,
			score,
			matchReason: reasons,
		});
	}
	recipeScored.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));

	return {
		brief,
		components: componentMatches,
		recipes: recipeScored.slice(0, Math.min(limit, MAX_RECIPE_MATCHES)),
	};
}
