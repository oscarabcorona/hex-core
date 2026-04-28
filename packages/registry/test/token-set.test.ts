/**
 * TokenSet + strictTokenSet contract tests.
 *
 * Locks down the schema authors / Hex Studio depend on:
 * - Open-ended on keys, strict on value shape.
 * - strictTokenSetSchema rejects themes missing required color/radius tokens.
 * - Existing OS preset themes (default, midnight, ember) must satisfy strictThemeSchema.
 * - Per-category token schemas (added in registry@0.3.0) reject mismatched
 *   `type` fields at runtime; type-level discrimination is exercised in the
 *   "type-level guarantees" suite below via TypeScript-driven assertions.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import {
	colorTokenSchema,
	dimensionTokenSchema,
	radiusTokenSchema,
	REQUIRED_COLOR_TOKENS,
	REQUIRED_RADIUS_TOKENS,
	strictThemeSchema,
	strictTokenSetSchema,
	themeSchema,
	tokenSchema,
	tokenSetSchema,
	type ColorToken,
	type RadiusToken,
	type StrictTokenSet,
	type TokenValue,
} from "../src/index.js";

const validToken = (type: TokenValue["type"], value: string): TokenValue => ({ type, value });

const completeMinimalTokenSet = (): Record<string, TokenValue> => {
	const tokens: Record<string, TokenValue> = {};
	for (const k of REQUIRED_COLOR_TOKENS) tokens[k] = validToken("color", "0 0% 100%");
	for (const k of REQUIRED_RADIUS_TOKENS) tokens[k] = validToken("radius", "0.5rem");
	return tokens;
};

describe("tokenSetSchema (open keys, strict values)", () => {
	it("accepts a flat record of typed tokens", () => {
		const result = tokenSetSchema.safeParse({
			background: validToken("color", "0 0% 100%"),
			"space-4": validToken("spacing", "1rem"),
		});
		expect(result.success).toBe(true);
	});

	it("rejects a token missing the type field", () => {
		const result = tokenSetSchema.safeParse({
			background: { value: "0 0% 100%" },
		});
		expect(result.success).toBe(false);
	});

	it("rejects a token with an unknown type", () => {
		const result = tokenSetSchema.safeParse({
			background: { type: "haunted", value: "0 0% 100%" },
		});
		expect(result.success).toBe(false);
	});

	it("rejects a token with a non-string value", () => {
		const result = tokenSetSchema.safeParse({
			"space-4": { type: "spacing", value: 16 },
		});
		expect(result.success).toBe(false);
	});
});

describe("strictTokenSetSchema (requires color + radius)", () => {
	it("accepts a token set that has all required tokens", () => {
		const result = strictTokenSetSchema.safeParse(completeMinimalTokenSet());
		expect(result.success).toBe(true);
	});

	it("rejects a token set missing a required color token", () => {
		const tokens = completeMinimalTokenSet();
		delete tokens.background;
		const result = strictTokenSetSchema.safeParse(tokens);
		expect(result.success).toBe(false);
	});

	it("rejects a token set missing the radius token", () => {
		const tokens = completeMinimalTokenSet();
		delete tokens.radius;
		const result = strictTokenSetSchema.safeParse(tokens);
		expect(result.success).toBe(false);
	});

	it("accepts additional optional tokens beyond the required set", () => {
		const tokens = completeMinimalTokenSet();
		tokens["space-4"] = validToken("spacing", "1rem");
		tokens["control-height-md"] = validToken("dimension", "2.5rem");
		const result = strictTokenSetSchema.safeParse(tokens);
		expect(result.success).toBe(true);
	});
});

describe("strictThemeSchema (theme-level validation)", () => {
	it("validates a complete theme with light + dark", () => {
		const result = strictThemeSchema.safeParse({
			name: "test",
			displayName: "Test",
			description: "Test theme",
			tokens: {
				light: completeMinimalTokenSet(),
				dark: completeMinimalTokenSet(),
			},
		});
		expect(result.success).toBe(true);
	});

	it("rejects a theme where dark is missing required tokens", () => {
		const incompleteDark = completeMinimalTokenSet();
		delete incompleteDark.foreground;
		const result = strictThemeSchema.safeParse({
			name: "test",
			displayName: "Test",
			description: "Test theme",
			tokens: {
				light: completeMinimalTokenSet(),
				dark: incompleteDark,
			},
		});
		expect(result.success).toBe(false);
	});
});

describe("themeSchema (loose, runtime parsing)", () => {
	it("still accepts the same complete theme as strictThemeSchema", () => {
		const result = themeSchema.safeParse({
			name: "test",
			displayName: "Test",
			description: "Test theme",
			tokens: {
				light: completeMinimalTokenSet(),
				dark: completeMinimalTokenSet(),
			},
		});
		expect(result.success).toBe(true);
	});

	it("accepts an incomplete token set (loose mode)", () => {
		const result = themeSchema.safeParse({
			name: "test",
			displayName: "Test",
			description: "Test theme",
			tokens: {
				light: { background: validToken("color", "0 0% 100%") },
				dark: { background: validToken("color", "0 0% 0%") },
			},
		});
		expect(result.success).toBe(true);
	});
});

describe("per-category token schemas", () => {
	it("colorTokenSchema accepts a color token", () => {
		const result = colorTokenSchema.safeParse({ type: "color", value: "240 5% 10%" });
		expect(result.success).toBe(true);
	});

	it("colorTokenSchema rejects a radius token", () => {
		const result = colorTokenSchema.safeParse({ type: "radius", value: "0.5rem" });
		expect(result.success).toBe(false);
	});

	it("radiusTokenSchema rejects a color token", () => {
		const result = radiusTokenSchema.safeParse({ type: "color", value: "240 5% 10%" });
		expect(result.success).toBe(false);
	});

	it("dimensionTokenSchema accepts a dimension token", () => {
		const result = dimensionTokenSchema.safeParse({ type: "dimension", value: "2.5rem" });
		expect(result.success).toBe(true);
	});

	it("tokenSchema (discriminated union) routes by `type` field", () => {
		const okColor = tokenSchema.safeParse({ type: "color", value: "240 5% 10%" });
		const okRadius = tokenSchema.safeParse({ type: "radius", value: "0.5rem" });
		const okSpacing = tokenSchema.safeParse({ type: "spacing", value: "1rem" });
		expect(okColor.success).toBe(true);
		expect(okRadius.success).toBe(true);
		expect(okSpacing.success).toBe(true);
	});

	it("tokenSchema rejects an unknown discriminator value", () => {
		const result = tokenSchema.safeParse({ type: "haunted", value: "spooky" });
		expect(result.success).toBe(false);
	});
});

describe("strictTokenSetSchema (category mismatch at canonical slots)", () => {
	// New in registry@0.3.0: each canonical slot is pinned to its category.
	// Putting a non-color token in a color slot now fails parse — the
	// previous refinement-based schema would have accepted this silently.
	it("rejects when a canonical color slot carries a non-color token", () => {
		const tokens = completeMinimalTokenSet();
		// Replace the `primary` slot with a radius-typed token — the schema
		// must reject because `primary` is pinned to `colorTokenSchema`.
		tokens.primary = validToken("radius", "0.5rem");
		const result = strictTokenSetSchema.safeParse(tokens);
		expect(result.success).toBe(false);
	});

	it("rejects when the `radius` slot carries a color token", () => {
		const tokens = completeMinimalTokenSet();
		tokens.radius = validToken("color", "240 5% 10%");
		const result = strictTokenSetSchema.safeParse(tokens);
		expect(result.success).toBe(false);
	});

	it("accepts extra non-canonical tokens with any TokenValue shape (catchall)", () => {
		const tokens = completeMinimalTokenSet();
		tokens["space-4"] = validToken("spacing", "1rem");
		tokens["control-height-md"] = validToken("dimension", "2.5rem");
		tokens["custom-shadow"] = validToken("shadow", "0 1px 2px rgb(0 0 0 / 0.1)");
		const result = strictTokenSetSchema.safeParse(tokens);
		expect(result.success).toBe(true);
	});
});

describe("type-level guarantees (registry@0.3.0)", () => {
	// These tests are compile-time assertions disguised as runtime tests —
	// `expectTypeOf` calls fail at `tsc` time if the inferred types drift.
	// Runtime exits 0 regardless; the test runner will surface tsc errors
	// during `pnpm build` if a type narrowing breaks.

	it("StrictTokenSet narrows canonical slots to their category", () => {
		const result = strictTokenSetSchema.safeParse({
			...completeMinimalTokenSet(),
			"space-4": validToken("spacing", "1rem"),
		});
		if (!result.success) throw new Error("fixture should parse");
		const tokens: StrictTokenSet = result.data;

		// The `primary` slot is type-narrowed to `ColorToken` — its `type`
		// field is the literal string "color", not the open `tokenTypeEnum`.
		expectTypeOf(tokens.primary).toEqualTypeOf<ColorToken>();
		expectTypeOf(tokens.primary.type).toEqualTypeOf<"color">();
		// Same for the radius slot.
		expectTypeOf(tokens.radius).toEqualTypeOf<RadiusToken>();
		expectTypeOf(tokens.radius.type).toEqualTypeOf<"radius">();
	});

	it("ColorToken's `type` field is the literal 'color'", () => {
		// Authors writing `function paint(c: ColorToken) {...}` get type-level
		// guarantees that callers can't pass a radius/spacing/etc. token.
		expectTypeOf<ColorToken["type"]>().toEqualTypeOf<"color">();
		expectTypeOf<RadiusToken["type"]>().toEqualTypeOf<"radius">();
	});
});
