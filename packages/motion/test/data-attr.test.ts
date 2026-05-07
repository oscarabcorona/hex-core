import { describe, expect, it } from "vitest";
import { parseMotionDataAttr } from "../src/react/data-attr.js";

describe("data-attr parser", () => {
	it("returns null for empty/missing input", () => {
		expect(parseMotionDataAttr("")).toBeNull();
		expect(parseMotionDataAttr(null)).toBeNull();
		expect(parseMotionDataAttr(undefined)).toBeNull();
	});

	it("returns null for unknown presets", () => {
		expect(parseMotionDataAttr("not-a-preset")).toBeNull();
	});

	it("parses fade-in with timing overrides", () => {
		const parsed = parseMotionDataAttr("fade-in;dur:300;delay:50;easing:emphasized");
		expect(parsed).not.toBeNull();
		expect(parsed!.from).toEqual({ opacity: 0 });
		expect(parsed!.to).toEqual({ opacity: 1 });
		expect(parsed!.transition.duration).toBe(300);
		expect(parsed!.transition.delay).toBe(50);
		expect(parsed!.transition.easing).toBe("emphasized");
	});

	it("ignores unknown keys", () => {
		const parsed = parseMotionDataAttr("slide-up;wat:nope;dur:100");
		expect(parsed!.transition.duration).toBe(100);
	});

	it("tolerates whitespace between segments", () => {
		const parsed = parseMotionDataAttr(" fade-in ; dur : 250 ");
		expect(parsed!.transition.duration).toBe(250);
	});
});
