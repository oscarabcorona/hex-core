import { describe, expect, it } from "vitest";
import { composeTimeline, type TimelineNode } from "../src/timeline/composer.js";

const tree: TimelineNode = {
	id: "root",
	children: [
		{
			id: "scene-a",
			start: 0,
			duration: 800,
			children: [
				{
					id: "clip-title",
					target: "#title",
					start: 0,
					duration: 400,
					from: { opacity: 0 },
					to: { opacity: 1 },
				},
			],
		},
		{
			id: "scene-b",
			start: 600,
			duration: 1400,
			children: [
				{
					id: "clip-cta",
					target: "#cta",
					start: 100,
					duration: 600,
					from: { y: 24 },
					to: { y: 0 },
					easing: "emphasized",
				},
			],
		},
	],
};

describe("timeline/composer determinism", () => {
	it("flattens scenes into absolute-time clip descriptors", () => {
		const clips = composeTimeline(tree);
		expect(clips).toHaveLength(2);
		expect(clips[0]).toMatchObject({ id: "clip-title", t0: 0, t1: 400 });
		expect(clips[1]).toMatchObject({ id: "clip-cta", t0: 700, t1: 1300 });
	});

	it("returns identical descriptor lists for identical inputs", () => {
		const a = composeTimeline(tree);
		const b = composeTimeline(tree);
		expect(b).toEqual(a);
	});

	it("does not mutate the input tree", () => {
		const before = JSON.stringify(tree);
		composeTimeline(tree);
		expect(JSON.stringify(tree)).toBe(before);
	});
});
