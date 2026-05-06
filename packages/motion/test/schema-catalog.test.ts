import { describe, expect, it } from "vitest";
import { componentSchemaDefinition, type ComponentSchemaDefinition } from "@hex-core/registry";
import { fadeInSchema } from "../src/schemas/fade-in.schema.js";
import { slideInSchema } from "../src/schemas/slide-in.schema.js";
import { scaleInSchema } from "../src/schemas/scale-in.schema.js";
import { blurInSchema } from "../src/schemas/blur-in.schema.js";
import { pulseSchema } from "../src/schemas/pulse.schema.js";
import { bounceSchema } from "../src/schemas/bounce.schema.js";
import { shimmerSchema } from "../src/schemas/shimmer.schema.js";
import { staggerSchema } from "../src/schemas/stagger.schema.js";
import { revealOnScrollSchema } from "../src/schemas/reveal-on-scroll.schema.js";
import { countUpSchema } from "../src/schemas/count-up.schema.js";
import { typewriterSchema } from "../src/schemas/typewriter.schema.js";
import { marqueeSchema } from "../src/schemas/marquee.schema.js";
import { shakeSchema } from "../src/schemas/shake.schema.js";
import { parallaxSchema } from "../src/schemas/parallax.schema.js";
import { pageTransitionSchema } from "../src/schemas/page-transition.schema.js";

const CATALOG: ComponentSchemaDefinition[] = [
	fadeInSchema,
	slideInSchema,
	scaleInSchema,
	blurInSchema,
	pulseSchema,
	bounceSchema,
	shimmerSchema,
	staggerSchema,
	revealOnScrollSchema,
	countUpSchema,
	typewriterSchema,
	marqueeSchema,
	shakeSchema,
	parallaxSchema,
	pageTransitionSchema,
];

describe("Phase 2 catalog schemas", () => {
	it("ships exactly 15 wrapper schemas", () => {
		expect(CATALOG).toHaveLength(15);
	});

	it.each(CATALOG.map((s) => [s.name, s]))(
		"%s parses against componentSchemaDefinition",
		(_name, schema) => {
			const result = componentSchemaDefinition.safeParse(schema);
			if (!result.success) console.error(result.error.issues);
			expect(result.success).toBe(true);
		},
	);

	it.each(CATALOG.map((s) => [s.name, s]))("%s has category=motion", (_name, schema) => {
		expect(schema.category).toBe("motion");
	});

	it.each(CATALOG.map((s) => [s.name, s]))("%s declares full AI hint block", (_name, schema) => {
		expect(schema.ai.whenToUse).toBeTruthy();
		expect(schema.ai.whenNotToUse).toBeTruthy();
		expect(schema.ai.commonMistakes.length).toBeGreaterThan(0);
		expect(schema.ai.accessibilityNotes).toBeTruthy();
		expect(schema.ai.tokenBudget).toBeTypeOf("number");
	});

	it("every catalog item declares dependencies.npm: ['@hex-core/motion']", () => {
		for (const s of CATALOG) {
			expect(s.dependencies.npm).toContain("@hex-core/motion");
		}
	});
});
