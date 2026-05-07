import { describe, expect, it } from "vitest";
import { shouldReduceMotion } from "../src/engine/reduced-motion.js";

describe("reduced-motion", () => {
	it('"never" always returns false', () => {
		expect(shouldReduceMotion("never")).toBe(false);
	});

	it('"always" always returns true', () => {
		expect(shouldReduceMotion("always")).toBe(true);
	});

	it('"user" reads from window.matchMedia', () => {
		const original = window.matchMedia;
		window.matchMedia = (q: string) =>
			({
				matches: true,
				media: q,
				onchange: null,
				addEventListener: () => {},
				removeEventListener: () => {},
				addListener: () => {},
				removeListener: () => {},
				dispatchEvent: () => false,
			}) as MediaQueryList;
		expect(shouldReduceMotion("user")).toBe(true);
		window.matchMedia = original;
	});
});
