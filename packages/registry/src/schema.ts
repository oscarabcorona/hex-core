import { z } from "zod";

// ─── Prop Schema (machine-readable component interface) ───

export const propSchema = z.object({
	name: z.string(),
	type: z.enum(["string", "number", "boolean", "enum", "ReactNode", "function", "object"]),
	required: z.boolean().default(false),
	default: z.unknown().optional(),
	description: z.string(),
	enumValues: z.array(z.string()).optional(),
	constraints: z
		.object({
			minLength: z.number().optional(),
			maxLength: z.number().optional(),
			min: z.number().optional(),
			max: z.number().optional(),
			pattern: z.string().optional(),
		})
		.optional(),
});

export type Prop = z.infer<typeof propSchema>;

// ─── Variant Schema ───

/**
 * One value of a variant axis (e.g. `{ value: "outline", description: "..." }`).
 *
 * `useWhen` is the AI-native intent payload introduced in `@hex-core/registry`
 * 0.4.0 — a short, opinionated sentence telling the model when this specific
 * value is the right choice ("secondary actions next to a primary CTA"). The
 * field is optional so existing schemas still parse, but every shipped
 * `*.schema.ts` should populate it. Without `useWhen`, an LLM picking between
 * `"outline"` and `"ghost"` falls back to whatever shadcn's docs taught its
 * training data — i.e. not necessarily the posture this library wants.
 *
 * Keep `useWhen` short (≤120 chars) and prescriptive: lead with the situation,
 * not the implementation.
 */
export const variantValueSchema = z.object({
	value: z.string(),
	description: z.string(),
	useWhen: z.string().optional(),
});

export const variantSchema = z.object({
	name: z.string(),
	description: z.string(),
	values: z.array(variantValueSchema),
	default: z.string(),
});

export type Variant = z.infer<typeof variantSchema>;
export type VariantValue = z.infer<typeof variantValueSchema>;

// ─── Slot Schema (composition points) ───

export const slotSchema = z.object({
	name: z.string(),
	description: z.string(),
	required: z.boolean().default(false),
	acceptedTypes: z.array(z.string()).optional(),
});

export type Slot = z.infer<typeof slotSchema>;

// ─── File Schema ───

export const fileSchema = z.object({
	path: z.string(),
	content: z.string(),
	type: z.enum(["component", "lib", "hook", "style", "config", "test"]),
});

export type RegistryFile = z.infer<typeof fileSchema>;

// ─── Dependency Schema ───

/**
 * A peer dependency that is NOT assumed to already exist in the consumer's
 * project (unlike `peer: ["react"]`) and that adds significant bundle weight.
 * Listing one here triggers an opt-in prompt in the CLI before install:
 * the user sees the package name, version range, and approximate gzipped
 * bundle cost, and confirms before the CLI runs `<pm> add <name>@<version>`.
 *
 * Use for engines like `xterm`, `reactflow`, `mermaid`, `wavesurfer.js`,
 * `tiptap`, `@codemirror/*` — anything where bundling-by-default would be
 * an overreach for a consumer who only wanted the wrapper component.
 */
export const heavyPeerSchema = z.object({
	/** npm package name. */
	name: z.string(),
	/** Version range, e.g. `"^5.3.0"`. Passed verbatim to `<pm> add`. */
	version: z.string(),
	/** Approximate gzipped bundle cost in KB. Surfaced in the install prompt. */
	bundleKbGzip: z.number().optional(),
	/** One-line note explaining why this peer is required (shown in the prompt). */
	reason: z.string().optional(),
});

export type HeavyPeer = z.infer<typeof heavyPeerSchema>;

export const dependencySchema = z.object({
	npm: z.array(z.string()).default([]),
	internal: z.array(z.string()).default([]),
	peer: z.array(z.string()).default([]),
	// Optional (not `.default([])`) so existing schema files that don't
	// declare heavyPeer don't break under TS strict inference. The CLI
	// reads via `Array.isArray(deps.heavyPeer)` and treats missing as none.
	heavyPeer: z.array(heavyPeerSchema).optional(),
});

export type Dependencies = z.infer<typeof dependencySchema>;

// ─── Usage Example Schema ───

/**
 * `composition` (added 0.4.0) tags the surrounding context the example
 * demonstrates — `["dialog", "form-action", "destructive"]` for a delete-
 * confirm Button, `["form", "field", "validation"]` for a Form example.
 *
 * MCP search ranks examples by tag overlap, so a query like "destructive
 * confirm" returns this example over a bare-Button one. Tags are
 * lowercased; the canonical vocabulary is documented in
 * `packages/registry/COMPOSITION_TAGS.md` — extend it carefully (each new
 * tag fragments search results).
 */
export const usageExampleSchema = z.object({
	title: z.string(),
	description: z.string(),
	code: z.string(),
	composition: z.array(z.string()).optional(),
});

export type UsageExample = z.infer<typeof usageExampleSchema>;

// ─── AI Hint Schema ───

/**
 * One structured anti-pattern (added 0.4.0). `mistake` describes what NOT
 * to do; `insteadUse` MUST be a slug from the registry index so MCP can
 * follow the link and return the suggested alternative as a real
 * registry entry, not free text.
 *
 * Compare with `aiHintSchema.commonMistakes` (free-form strings, kept for
 * back-compat). New schemas should populate `antiPatterns` and leave
 * `commonMistakes` empty. The `build:registry` step copies
 * `antiPatterns[].mistake` into `commonMistakes` automatically so existing
 * MCP clients stay working.
 */
export const antiPatternSchema = z.object({
	mistake: z.string(),
	insteadUse: z.string().regex(/^[a-z][a-z0-9-]*$/),
	why: z.string().optional(),
});

export type AntiPattern = z.infer<typeof antiPatternSchema>;

export const aiHintSchema = z.object({
	whenToUse: z.string(),
	whenNotToUse: z.string(),
	commonMistakes: z.array(z.string()),
	antiPatterns: z.array(antiPatternSchema).optional(),
	relatedComponents: z.array(z.string()),
	accessibilityNotes: z.string(),
	tokenBudget: z.number().optional(),
});

export type AIHint = z.infer<typeof aiHintSchema>;

// ─── Category Enum ───

export const categoryEnum = z.enum([
	"primitive",
	"component",
	"block",
	"example",
	"theme",
	"hook",
	"lib",
	"ai",
	"artifact",
]);

export type Category = z.infer<typeof categoryEnum>;

// ─── Registry Item (the core schema) ───

export const registryItemSchema = z.object({
	$schema: z.string().default("https://hex-core.dev/schema/registry-item.json"),
	name: z.string().regex(/^[a-z][a-z0-9-]*$/),
	displayName: z.string(),
	description: z.string(),
	category: categoryEnum,
	subcategory: z.string().optional(),
	version: z.string().default("0.1.0"),
	framework: z.enum(["react", "vue", "svelte"]).default("react"),

	// Machine-readable component spec
	props: z.array(propSchema).default([]),
	variants: z.array(variantSchema).default([]),
	slots: z.array(slotSchema).default([]),

	// Files to install
	files: z.array(fileSchema),

	// Dependencies
	dependencies: dependencySchema,

	// Design tokens used
	tokensUsed: z.array(z.string()).default([]),

	// CSS variables introduced
	cssVariables: z
		.record(
			z.string(),
			z.object({
				light: z.string(),
				dark: z.string(),
			}),
		)
		.optional(),

	// Usage examples
	examples: z.array(usageExampleSchema).default([]),

	// AI-specific metadata
	ai: aiHintSchema,

	// Search tags
	tags: z.array(z.string()).default([]),
});

export type RegistryItem = z.infer<typeof registryItemSchema>;

// ─── Registry Index (lightweight catalog) ───

export const registryIndexItemSchema = z.object({
	name: z.string(),
	displayName: z.string(),
	description: z.string(),
	category: categoryEnum,
	subcategory: z.string().optional(),
	tags: z.array(z.string()),
	internalDeps: z.array(z.string()).default([]),
	tokenBudget: z.number().optional(),
});

export type RegistryIndexItem = z.infer<typeof registryIndexItemSchema>;

export const registryIndexSchema = z.object({
	$schema: z.string().default("https://hex-core.dev/schema/registry.json"),
	name: z.string(),
	version: z.string(),
	description: z.string(),
	homepage: z.string(),
	items: z.array(registryIndexItemSchema),
});

export type RegistryIndex = z.infer<typeof registryIndexSchema>;

// ─── Token Schemas ───

export const tokenTypeEnum = z.enum([
	"color",
	"dimension",
	"font",
	"fontWeight",
	"duration",
	"cubicBezier",
	"number",
	"shadow",
	"gradient",
	"radius",
	"spacing",
	"opacity",
]);

export const tokenValueSchema = z.object({
	value: z.string(),
	description: z.string().optional(),
	type: tokenTypeEnum,
});

export type TokenValue = z.infer<typeof tokenValueSchema>;

export const tokenGroupSchema: z.ZodType<Record<string, TokenValue | Record<string, unknown>>> =
	z.lazy(() => z.record(z.string(), z.union([tokenValueSchema, z.record(z.string(), z.unknown())])));

// ─── Per-category token schemas ───
//
// Each schema below is `tokenValueSchema` narrowed so the `type` field is a
// literal of one `tokenTypeEnum` member. Combined into a `discriminatedUnion`
// they let consumers pattern-match on `token.type` with exhaustiveness
// checking, and let `StrictTokenSet` (below) annotate canonical token slots
// with the category they MUST be (e.g. `primary` is always a color token).
//
// Inferred types are exported as `ColorToken`, `DimensionToken`, etc. so
// consumers can write `function paintBg(t: ColorToken) {...}` and have the
// type checker reject a `RadiusToken` argument at compile time.

/** A color token — `value` is an HSL triplet (`"<H> <S>% <L>%"`). */
export const colorTokenSchema = tokenValueSchema.extend({ type: z.literal("color") });
export type ColorToken = z.infer<typeof colorTokenSchema>;

/**
 * A dimension token — `value` is a length (e.g. `"2.5rem"`). Used for
 * non-spacing fixed dimensions like `--control-height-md`.
 */
export const dimensionTokenSchema = tokenValueSchema.extend({ type: z.literal("dimension") });
export type DimensionToken = z.infer<typeof dimensionTokenSchema>;

/** A font token — `value` is a font-size (e.g. `"0.875rem"`). */
export const fontTokenSchema = tokenValueSchema.extend({ type: z.literal("font") });
export type FontToken = z.infer<typeof fontTokenSchema>;

/** A font-weight token — `value` is a numeric weight (e.g. `"600"`). */
export const fontWeightTokenSchema = tokenValueSchema.extend({ type: z.literal("fontWeight") });
export type FontWeightToken = z.infer<typeof fontWeightTokenSchema>;

/** A duration token — `value` is a time (e.g. `"200ms"`). */
export const durationTokenSchema = tokenValueSchema.extend({ type: z.literal("duration") });
export type DurationToken = z.infer<typeof durationTokenSchema>;

/** A cubic-bezier easing token — `value` is a 4-tuple (e.g. `"0.4, 0, 0.2, 1"`). */
export const cubicBezierTokenSchema = tokenValueSchema.extend({ type: z.literal("cubicBezier") });
export type CubicBezierToken = z.infer<typeof cubicBezierTokenSchema>;

/** A bare numeric token — `value` is a unit-less number string (e.g. `"4"`). */
export const numberTokenSchema = tokenValueSchema.extend({ type: z.literal("number") });
export type NumberToken = z.infer<typeof numberTokenSchema>;

/** A box-shadow token — `value` is a CSS box-shadow string. */
export const shadowTokenSchema = tokenValueSchema.extend({ type: z.literal("shadow") });
export type ShadowToken = z.infer<typeof shadowTokenSchema>;

/** A gradient token — `value` is a CSS linear/radial gradient string. */
export const gradientTokenSchema = tokenValueSchema.extend({ type: z.literal("gradient") });
export type GradientToken = z.infer<typeof gradientTokenSchema>;

/** A border-radius token — `value` is a length (e.g. `"0.625rem"`). */
export const radiusTokenSchema = tokenValueSchema.extend({ type: z.literal("radius") });
export type RadiusToken = z.infer<typeof radiusTokenSchema>;

/** A spacing token — `value` is a length used for `--space-*` / `--gap-*`. */
export const spacingTokenSchema = tokenValueSchema.extend({ type: z.literal("spacing") });
export type SpacingToken = z.infer<typeof spacingTokenSchema>;

/** An opacity token — `value` is a number string in the range `[0, 1]`. */
export const opacityTokenSchema = tokenValueSchema.extend({ type: z.literal("opacity") });
export type OpacityToken = z.infer<typeof opacityTokenSchema>;

/**
 * Discriminated union over every token category. Equivalent at runtime to
 * `tokenValueSchema` (any of the 12 `tokenTypeEnum` members), but at the
 * type level the `type` field discriminates so a `switch (token.type)` body
 * narrows `token` to the matching category in each case branch.
 *
 * Use this when you want exhaustiveness checking on category branches; use
 * `tokenValueSchema` when you only care that a value carries `{value, type}`.
 */
export const tokenSchema = z.discriminatedUnion("type", [
	colorTokenSchema,
	dimensionTokenSchema,
	fontTokenSchema,
	fontWeightTokenSchema,
	durationTokenSchema,
	cubicBezierTokenSchema,
	numberTokenSchema,
	shadowTokenSchema,
	gradientTokenSchema,
	radiusTokenSchema,
	spacingTokenSchema,
	opacityTokenSchema,
]);

/**
 * A flat dictionary of token name → typed value. Used for both the `light`
 * and `dark` halves of a Theme. Open-ended on keys (consumers add new tokens
 * freely) but strict on values: every entry must declare a `type` that maps
 * to {@link tokenTypeEnum} — color, spacing, dimension, font, radius, etc.
 *
 * This is the contract Hex Studio + downstream theme packs validate against.
 */
export const tokenSetSchema = z.record(z.string(), tokenValueSchema);
export type TokenSet = z.infer<typeof tokenSetSchema>;

/** Required color tokens any Hex Core theme must define so the 47 components render correctly. */
export const REQUIRED_COLOR_TOKENS = [
	"background",
	"foreground",
	"card",
	"card-foreground",
	"popover",
	"popover-foreground",
	"primary",
	"primary-foreground",
	"secondary",
	"secondary-foreground",
	"muted",
	"muted-foreground",
	"accent",
	"accent-foreground",
	"destructive",
	"destructive-foreground",
	"border",
	"input",
	"ring",
] as const;

/** Required radius token (single — drives `--radius` and Tailwind's borderRadius). */
export const REQUIRED_RADIUS_TOKENS = ["radius"] as const;

/**
 * A token set schema where each canonical slot is pinned to its category at
 * the type level (e.g. `primary` is `ColorToken`, not just `TokenValue`),
 * extra slots are accepted via catchall, and missing required slots fail
 * `safeParse` at runtime.
 *
 * Use this for **theme validation** (init / edit flows, Studio export,
 * community theme contributions) where:
 *   - missing required tokens would visibly break the 47 components, AND
 *   - consumers want compile-time guarantees that they're handling colors
 *     where colors belong, not arbitrary `TokenValue`.
 *
 * Open-ended on additional tokens (spacing, gap, control-height, typography,
 * motion, shadows) — those are recommended but not blocking. Extra slots
 * accept any `TokenValue` shape via catchall.
 *
 * **Compatibility note:** the previous version of this schema was a
 * `tokenSetSchema.refine(...)` runtime check that only validated key
 * **presence**, leaving the inferred type loose (`Record<string, TokenValue>`)
 * AND silently accepting category mismatches at canonical slots — a theme
 * could legally put a non-color token in `primary`. The new version
 * (introduced in `@hex-core/registry@0.3.0`) tightens both layers:
 *
 *   - **Type:** each canonical slot narrows to its category (`primary` is
 *     `ColorToken`, `radius` is `RadiusToken`, etc.) — `theme.primary.type`
 *     is the literal `"color"`, not the open `tokenTypeEnum`.
 *   - **Runtime:** category mismatches at canonical slots reject. A theme
 *     that miscategorized `primary` as a radius token used to parse; it
 *     now fails with a per-slot issue.
 *
 * All 3 OSS preset themes, and any theme where canonical slots already used
 * the conventional category, parse identically under both versions. Themes
 * that miscategorized canonical slots will now reject — intended behavior.
 *
 * The validation-error shape also changed: instead of a single combined
 * "Theme is missing one or more required tokens" message, callers receive N
 * per-slot issues with `path` pointing at the offending key. See the
 * `0.3.0` changeset for the migration guide.
 */
export const strictTokenSetSchema = z
	.object({
		// Required color tokens — every Hex Core theme must define these so the
		// 47 components render correctly. Type-level narrowing to `ColorToken`
		// makes consumers' transformer / picker code type-safe.
		background: colorTokenSchema,
		foreground: colorTokenSchema,
		card: colorTokenSchema,
		"card-foreground": colorTokenSchema,
		popover: colorTokenSchema,
		"popover-foreground": colorTokenSchema,
		primary: colorTokenSchema,
		"primary-foreground": colorTokenSchema,
		secondary: colorTokenSchema,
		"secondary-foreground": colorTokenSchema,
		muted: colorTokenSchema,
		"muted-foreground": colorTokenSchema,
		accent: colorTokenSchema,
		"accent-foreground": colorTokenSchema,
		destructive: colorTokenSchema,
		"destructive-foreground": colorTokenSchema,
		border: colorTokenSchema,
		input: colorTokenSchema,
		ring: colorTokenSchema,
		// Required radius token — drives `--radius` and Tailwind's borderRadius.
		radius: radiusTokenSchema,
	})
	// Extra tokens (spacing, gap, control-height, typography, motion, etc.)
	// pass through with the open `TokenValue` shape. Consumers can refine
	// downstream via the per-category schemas (`SpacingToken`, etc.).
	.catchall(tokenValueSchema);

/**
 * A token set whose canonical slots (`background`, `primary`, `radius`, etc.)
 * narrow to their category at the type level. Extra slots fall through as
 * the open `TokenValue` shape via catchall.
 */
export type StrictTokenSet = z.infer<typeof strictTokenSetSchema>;

/**
 * The 9 theme categories used by the brand-derived preset library.
 * Studio's theme picker can surface `themesByCategory` directly without
 * authoring a separate enum at the consumer side.
 */
export const themeCategorySchema = z.enum([
	"ai",
	"dev-tools",
	"backend",
	"productivity",
	"design",
	"fintech",
	"ecommerce",
	"media",
	"automotive",
]);

export type ThemeCategory = z.infer<typeof themeCategorySchema>;

/**
 * Provenance metadata for presets derived from third-party sources
 * (e.g. voltagent/awesome-design-md MIT briefs). Studio surfaces the
 * source link in its picker and the LLM-context payload includes it.
 */
export const themeAttributionSchema = z.object({
	source: z.string(),
	license: z.string(),
	url: z.string(),
	brand: z.string().optional(),
});

export type ThemeAttribution = z.infer<typeof themeAttributionSchema>;

export const themeSchema = z.object({
	name: z.string(),
	displayName: z.string(),
	description: z.string(),
	tokens: z.object({
		light: tokenSetSchema,
		dark: tokenSetSchema,
	}),
	brand: z.string().optional(),
	category: themeCategorySchema.optional(),
	tags: z.array(z.string()).optional(),
	designBrief: z.string().optional(),
	attribution: themeAttributionSchema.optional(),
});

export type Theme = z.infer<typeof themeSchema>;

/**
 * A Theme schema where both `light` and `dark` token sets are validated by
 * {@link strictTokenSetSchema}. Use for authoring / validation flows that must
 * reject incomplete themes; runtime consumers typically use {@link themeSchema}.
 */
export const strictThemeSchema = z.object({
	name: z.string(),
	displayName: z.string(),
	description: z.string(),
	tokens: z.object({
		light: strictTokenSetSchema,
		dark: strictTokenSetSchema,
	}),
	brand: z.string().optional(),
	category: themeCategorySchema.optional(),
	tags: z.array(z.string()).optional(),
	designBrief: z.string().optional(),
	attribution: themeAttributionSchema.optional(),
});

/**
 * A `Theme` whose `tokens.light` and `tokens.dark` palettes both satisfy
 * `strictTokenSetSchema` — every required slot present and each slot pinned
 * to its canonical category at the type level. Use this when authoring or
 * validating themes for npm publication.
 */
export type StrictTheme = z.infer<typeof strictThemeSchema>;

// ─── Semantic Tokens (intent layer over raw tokens, added 0.4.0) ───

/**
 * One semantic-token entry. The raw `@hex-core/tokens` ships values
 * (`--color-destructive: hsl(0 84% 60%)`); semantic tokens add the
 * **intent** layer on top — "for which kind of UI element is this the
 * right choice?". An LLM asked "what's the right token for a delete
 * button" can reach for `button.destructive.bg` instead of guessing
 * `bg-red-500`.
 *
 * `value` references a raw token by flat curly-brace syntax —
 * `"{destructive}"`, `"{duration-normal}"`, `"{radius}"`. The token name
 * inside the braces matches the literal key in
 * `defaultTheme.tokens.light/dark`, so resolution is a single-hop
 * lookup with no namespace traversal. (Earlier prototypes used
 * dot-namespaced names like `{color.destructive}`; that's been dropped
 * because the underlying token store is flat.)
 */
export const semanticTokenEntrySchema = z.object({
	value: z.string().regex(/^\{[a-z][a-z0-9-]*\}$/),
	useWhen: z.string(),
	type: tokenTypeEnum,
});

export type SemanticTokenEntry = z.infer<typeof semanticTokenEntrySchema>;

/**
 * A flat dictionary of semantic-token name → entry. Names are
 * dot-namespaced (`button.destructive.bg`, `dialog.overlay.bg`,
 * `form.field.border-error`) so consumers can group/filter by component.
 *
 * The dot-namespace IS the API — MCP tools surface entries grouped by the
 * leading segment. Don't switch to nested objects without updating the
 * MCP layer.
 */
export const semanticTokenSetSchema = z.record(z.string().regex(/^[a-z][a-z0-9.-]*$/), semanticTokenEntrySchema);

export type SemanticTokenSet = z.infer<typeof semanticTokenSetSchema>;

// ─── Component Schema Definition (used in .schema.ts files) ───

export const componentSchemaDefinition = z.object({
	name: z.string(),
	displayName: z.string(),
	description: z.string(),
	category: categoryEnum,
	subcategory: z.string().optional(),
	props: z.array(propSchema),
	variants: z.array(variantSchema),
	slots: z.array(slotSchema),
	dependencies: dependencySchema,
	tokensUsed: z.array(z.string()),
	examples: z.array(usageExampleSchema),
	ai: aiHintSchema,
	tags: z.array(z.string()),
});

export type ComponentSchemaDefinition = z.infer<typeof componentSchemaDefinition>;
