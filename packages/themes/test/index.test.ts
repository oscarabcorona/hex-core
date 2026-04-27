/**
 * Smoke tests for @hex-core/themes.
 *
 * Locks down what the catalog surface looks like so consumers (theme
 * studios, switcher UIs) can rely on listPremiumThemes() / getPremiumTheme()
 * shapes as the catalog grows.
 */
import { describe, expect, it } from "vitest";
import {
	emberTheme,
	getPremiumTheme,
	listPremiumThemes,
	midnightTheme,
	premiumThemes,
} from "../src/index.js";

describe("@hex-core/themes catalog", () => {
	it("exports midnight + ember as the initial premium catalog", () => {
		expect(midnightTheme.name).toBe("midnight");
		expect(emberTheme.name).toBe("ember");
		expect(Object.keys(premiumThemes).sort()).toEqual(["ember", "midnight"]);
	});

	it("listPremiumThemes returns metadata for every catalog entry", () => {
		const list = listPremiumThemes();
		expect(list).toHaveLength(Object.keys(premiumThemes).length);
		for (const t of list) {
			expect(t.name).toBeTruthy();
			expect(t.displayName).toBeTruthy();
			expect(t.description).toBeTruthy();
		}
	});

	it("getPremiumTheme resolves known names and returns undefined for misses", () => {
		expect(getPremiumTheme("midnight")).toBe(midnightTheme);
		expect(getPremiumTheme("ember")).toBe(emberTheme);
		expect(getPremiumTheme("nonexistent")).toBeUndefined();
	});

	it("each catalog entry carries a complete light + dark token set", () => {
		for (const theme of Object.values(premiumThemes)) {
			expect(theme.tokens.light.background).toBeDefined();
			expect(theme.tokens.dark.background).toBeDefined();
		}
	});
});
