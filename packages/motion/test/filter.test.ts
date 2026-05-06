import { describe, expect, it } from "vitest";
import { buildKeyframes, hasAnimatableDiff } from "../src/engine/keyframes.js";

describe("engine/keyframes filter prop", () => {
	it("emits a filter keyframe when set on from/to", () => {
		const built = buildKeyframes({ filter: "blur(8px)" }, { filter: "blur(0px)" }, { duration: 200 });
		expect(built.keyframes[0]).toEqual({ filter: "blur(8px)" });
		expect(built.keyframes[1]).toEqual({ filter: "blur(0px)" });
	});

	it("hasAnimatableDiff detects filter changes", () => {
		expect(hasAnimatableDiff({ filter: "blur(8px)" }, { filter: "blur(0px)" })).toBe(true);
		expect(hasAnimatableDiff({ filter: "blur(0px)" }, { filter: "blur(0px)" })).toBe(false);
	});

	it("collapses to final state under reduced motion", () => {
		const built = buildKeyframes(
			{ filter: "blur(8px)" },
			{ filter: "blur(0px)" },
			{ duration: 200 },
			true,
		);
		expect(built.options.duration).toBe(0);
		expect(built.keyframes[0]).toEqual(built.keyframes[1]);
	});
});
