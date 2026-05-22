/**
 * Authoring-contract guard for the page-recipe system.
 *
 * `validate-registry.test.ts` checks the *emitted* JSON; this checks the
 * *authoring* schema (`recipeSchemaDefinition`) directly, so the per-kind
 * invariants (component → steps, page → sections), the `kind` default, and
 * section-block slug validation can't regress without a red test.
 */
import { describe, expect, it } from "vitest";
import { recipeSchemaDefinition } from "../src/index.js";

const baseFields = {
	slug: "demo",
	title: "Demo",
	summary: "Demo recipe.",
	brief: "A demo recipe used in tests.",
};

const oneStep = [{ component: "button", reason: "CTA", role: "primary" as const }];
const oneSection = [
	{ id: "hero", block: "marketing-hero", intent: "Lead the page.", role: "primary" as const },
];

describe("recipeSchemaDefinition — kind + invariants", () => {
	it("defaults kind to 'component' and sections to []", () => {
		const parsed = recipeSchemaDefinition.parse({ ...baseFields, steps: oneStep });
		expect(parsed.kind).toBe("component");
		expect(parsed.sections).toEqual([]);
	});

	it("accepts a component recipe with steps", () => {
		expect(recipeSchemaDefinition.safeParse({ ...baseFields, steps: oneStep }).success).toBe(true);
	});

	it("rejects a component recipe with no steps", () => {
		const result = recipeSchemaDefinition.safeParse({ ...baseFields, steps: [] });
		expect(result.success).toBe(false);
	});

	it("accepts a page recipe with sections, theme, pageType, and layout", () => {
		const result = recipeSchemaDefinition.safeParse({
			...baseFields,
			kind: "page",
			pageType: "landing",
			theme: { preset: "default", tokenBudget: 1800 },
			sections: oneSection,
			layout: "Header → hero → footer.",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.kind).toBe("page");
			expect(result.data.sections).toHaveLength(1);
		}
	});

	it("rejects a page recipe with no sections", () => {
		const result = recipeSchemaDefinition.safeParse({
			...baseFields,
			kind: "page",
			pageType: "landing",
			sections: [],
		});
		expect(result.success).toBe(false);
	});

	it("rejects a section whose block is not a valid slug", () => {
		const result = recipeSchemaDefinition.safeParse({
			...baseFields,
			kind: "page",
			sections: [{ id: "hero", block: "Not A Slug", intent: "x", role: "primary" }],
		});
		expect(result.success).toBe(false);
	});

	it("rejects an unknown pageType", () => {
		const result = recipeSchemaDefinition.safeParse({
			...baseFields,
			kind: "page",
			pageType: "dashboard",
			sections: oneSection,
		});
		expect(result.success).toBe(false);
	});
});
