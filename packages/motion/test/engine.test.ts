import { describe, expect, it } from "vitest";
import { buildKeyframes, hasAnimatableDiff } from "../src/engine/keyframes.js";
import { tokenEasing, springToBezier } from "../src/engine/easing.js";
import { manualClock } from "../src/engine/clock.js";

describe("engine/keyframes", () => {
	it("emits a transform-aware from→to pair", () => {
		const built = buildKeyframes({ x: 0, opacity: 0 }, { x: 100, opacity: 1 }, { duration: 200 });
		expect(built.keyframes).toHaveLength(2);
		expect(built.keyframes[0]).toEqual({
			transform: "translate3d(0px, 0px, 0)",
			opacity: 0,
		});
		expect(built.keyframes[1]).toEqual({
			transform: "translate3d(100px, 0px, 0)",
			opacity: 1,
		});
		expect(built.options.duration).toBe(200);
	});

	it("collapses to a final-state pair when reduced motion is active", () => {
		const built = buildKeyframes({ opacity: 0 }, { opacity: 1 }, { duration: 200 }, true);
		expect(built.options.duration).toBe(0);
		expect(built.keyframes[0]).toEqual(built.keyframes[1]);
	});

	it("hasAnimatableDiff detects transform deltas", () => {
		expect(hasAnimatableDiff({ x: 0 }, { x: 10 })).toBe(true);
		expect(hasAnimatableDiff({ x: 0 }, { x: 0 })).toBe(false);
		expect(hasAnimatableDiff({ opacity: 1 }, { opacity: 1, x: 0 })).toBe(false);
	});
});

describe("engine/easing", () => {
	it("resolves named tokens to cubic-bezier", () => {
		expect(tokenEasing("standard")).toContain("cubic-bezier");
		expect(tokenEasing("emphasized")).toContain("cubic-bezier");
		expect(tokenEasing("linear")).toBe("linear");
	});

	it("passes raw CSS easing strings through", () => {
		expect(tokenEasing("ease-in-out")).toBe("ease-in-out");
	});

	it("springToBezier returns a cubic-bezier", () => {
		expect(springToBezier({ stiffness: 200, damping: 20 })).toContain("cubic-bezier");
	});
});

describe("engine/clock", () => {
	it("manualClock advances deterministically", () => {
		const c = manualClock(0);
		expect(c.now()).toBe(0);
		c.advance(16);
		expect(c.now()).toBe(16);
		c.advance(16);
		expect(c.now()).toBe(32);
	});

	it("manualClock fires scheduled callbacks on advance", () => {
		const c = manualClock(0);
		const fired: number[] = [];
		c.schedule((t) => fired.push(t));
		c.advance(50);
		c.advance(25);
		expect(fired).toEqual([50, 75]);
	});
});
