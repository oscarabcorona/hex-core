import { describe, expect, it } from "vitest";
import { componentSchemaDefinition, type ComponentSchemaDefinition } from "@hex-core/registry";
import { motionSchema } from "../src/schemas/motion.schema.js";
import { presenceSchema } from "../src/schemas/presence.schema.js";
import { transitionSchema } from "../src/schemas/transition.schema.js";
import { variantsSchema } from "../src/schemas/variants.schema.js";
import { useAnimateSchema } from "../src/schemas/use-animate.schema.js";
import { useScrollSchema } from "../src/schemas/use-scroll.schema.js";
import { motionTimelineSchema } from "../src/schemas/motion-timeline.schema.js";
import { sceneSchema } from "../src/schemas/scene.schema.js";
import { clipSchema } from "../src/schemas/clip.schema.js";
import { trackSchema } from "../src/schemas/track.schema.js";
import { motionProSchema } from "../src/schemas/motion-pro.schema.js";

const SCHEMAS: ComponentSchemaDefinition[] = [
	motionSchema,
	presenceSchema,
	transitionSchema,
	variantsSchema,
	useAnimateSchema,
	useScrollSchema,
	motionTimelineSchema,
	sceneSchema,
	clipSchema,
	trackSchema,
	motionProSchema,
];

describe("motion schemas", () => {
	it("ships at least 10 motion items", () => {
		expect(SCHEMAS.length).toBeGreaterThanOrEqual(10);
	});

	it.each(SCHEMAS.map((s) => [s.name, s]))(
		"%s parses against componentSchemaDefinition",
		(_name, schema) => {
			const result = componentSchemaDefinition.safeParse(schema);
			if (!result.success) {
				console.error(result.error.issues);
			}
			expect(result.success).toBe(true);
		},
	);

	it.each(SCHEMAS.map((s) => [s.name, s]))(
		"%s declares category 'motion'",
		(_name, schema) => {
			expect(schema.category).toBe("motion");
		},
	);

	it.each(SCHEMAS.map((s) => [s.name, s]))(
		"%s populates required AI hints",
		(_name, schema) => {
			expect(schema.ai.whenToUse).toBeTruthy();
			expect(schema.ai.whenNotToUse).toBeTruthy();
			expect(schema.ai.commonMistakes.length).toBeGreaterThan(0);
			expect(schema.ai.accessibilityNotes).toBeTruthy();
			expect(schema.ai.tokenBudget).toBeTypeOf("number");
		},
	);
});
