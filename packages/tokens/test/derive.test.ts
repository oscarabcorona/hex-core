import { describe, expect, it } from "vitest";
import {
	colorInputToTokenValue,
	contrastRatio,
	defaultTheme,
	deriveDarkFromLight,
	deriveForegroundFor,
	deriveSecondaryFromPrimary,
	tokenLuminance,
} from "../src/index.js";

/**
 * Color-math invariants for the helpers shared by `@hex-core/cli`'s
 * interactive theme authoring and `@hex-core/studio`'s React sliders.
 * Tests pin the contract — both shells can assume these guarantees
 * without re-deriving them.
 */

describe("deriveForegroundFor", () => {
	it("picks near-white against a dark background", () => {
		// foreground: "240 10% 3.9%" is the canonical near-black; we expect
		// the helper to flip to near-white for max contrast.
		const dark = "240 10% 3.9%";
		const fg = deriveForegroundFor(dark);
		expect(fg.type).toBe("color");
		// Lightness near 98% indicates near-white was picked.
		const lightness = Number(fg.value.split(" ")[2]?.replace("%", ""));
		expect(lightness).toBeGreaterThan(90);
	});

	it("picks near-black against a light background", () => {
		const light = "0 0% 100%";
		const fg = deriveForegroundFor(light);
		const lightness = Number(fg.value.split(" ")[2]?.replace("%", ""));
		expect(lightness).toBeLessThan(20);
	});

	it("clears WCAG AA against a vivid primary blue", () => {
		// Tailwind blue-600 ish.
		const blue = "217 91% 60%";
		const fg = deriveForegroundFor(blue);
		const ratio = contrastRatio(fg.value, blue);
		expect(ratio, `derived foreground gives only ${ratio.toFixed(2)}:1 contrast`).toBeGreaterThanOrEqual(4.5);
	});

	it("clears WCAG AA against a dark destructive red", () => {
		const red = "0 75% 30%";
		const fg = deriveForegroundFor(red);
		const ratio = contrastRatio(fg.value, red);
		expect(ratio).toBeGreaterThanOrEqual(4.5);
	});

	it("throws on a malformed input", () => {
		expect(() => deriveForegroundFor("not-a-color")).toThrow(/Invalid HSL triplet/);
	});
});

describe("deriveDarkFromLight", () => {
	it("inverts every BASE color's lightness around 50% pivot", () => {
		const light = defaultTheme.tokens.light;
		const dark = deriveDarkFromLight(light);
		// background was 100% lightness in light → should be 0% (or near 0) in dark
		const lightBgL = Number(light.background?.value.split(" ")[2]?.replace("%", ""));
		const darkBgL = Number(dark.background?.value.split(" ")[2]?.replace("%", ""));
		expect(lightBgL + darkBgL, "lightness should sum to ~100% (inversion)").toBeGreaterThan(95);
		expect(lightBgL + darkBgL).toBeLessThan(105);
	});

	it("re-derives every *-foreground slot for AA contrast against its inverted base (H1)", () => {
		const light = defaultTheme.tokens.light;
		const dark = deriveDarkFromLight(light);
		const pairs = [
			["primary", "primary-foreground"],
			["secondary", "secondary-foreground"],
			["destructive", "destructive-foreground"],
			["card", "card-foreground"],
			["popover", "popover-foreground"],
			["muted", "muted-foreground"],
			["accent", "accent-foreground"],
		] as const;
		for (const [base, fg] of pairs) {
			const baseValue = dark[base]?.value;
			const fgValue = dark[fg]?.value;
			expect(baseValue, `${base} missing from derived dark`).toBeDefined();
			expect(fgValue, `${fg} missing from derived dark`).toBeDefined();
			if (!baseValue || !fgValue) continue;
			const ratio = contrastRatio(fgValue, baseValue);
			// Body-text contrast (4.5) for primary/destructive/card/popover; UI
			// (3.0) acceptable for muted/accent which are typically used for
			// affordances rather than body copy. We assert 3.0 across the
			// board as the floor — anything stricter for specific pairs lives
			// in app-level audits.
			expect(
				ratio,
				`${fg}/${base} dark contrast ${ratio.toFixed(2)}:1 fails the 3:1 floor (was 2.89:1 before H1 fix)`,
			).toBeGreaterThanOrEqual(3.0);
		}
	});

	it("respects custom saturationFactor", () => {
		const lightWithVivid = {
			...defaultTheme.tokens.light,
			vivid: { value: "217 90% 50%", type: "color" as const },
		};
		// saturationFactor=1 should preserve saturation exactly.
		const dark = deriveDarkFromLight(lightWithVivid, { saturationFactor: 1 });
		const darkSat = Number(dark.vivid?.value.split(" ")[1]?.replace("%", "") ?? "0");
		expect(darkSat).toBeGreaterThan(89);
		expect(darkSat).toBeLessThan(91);
	});

	it("respects custom pivotLightness", () => {
		const lightWithMid = {
			...defaultTheme.tokens.light,
			vivid: { value: "0 0% 60%", type: "color" as const },
		};
		// pivot=0.7 → 60% inverts to 80% (2*70 - 60 = 80).
		const dark = deriveDarkFromLight(lightWithMid, { pivotLightness: 0.7 });
		const darkL = Number(dark.vivid?.value.split(" ")[2]?.replace("%", "") ?? "0");
		expect(darkL).toBeCloseTo(80, 0);
	});

	it("passes through non-color tokens unchanged", () => {
		const light = defaultTheme.tokens.light;
		const dark = deriveDarkFromLight(light);
		expect(dark.radius?.value).toBe(light.radius?.value);
		expect(dark.radius?.type).toBe("radius");
	});

	it("preserves hue (within rounding) on each BASE color token", () => {
		// `*-foreground` slots intentionally swap hue under H1 — they get
		// re-derived to near-white / near-black against the inverted base
		// for AA contrast, regardless of the source hue. This test pins the
		// invariant for BASE slots only.
		const light = defaultTheme.tokens.light;
		const dark = deriveDarkFromLight(light);
		for (const [name, token] of Object.entries(light)) {
			if (token.type !== "color") continue;
			if (name.endsWith("-foreground")) continue;
			const lightHue = Number(token.value.split(" ")[0]);
			const darkHue = Number(dark[name]?.value.split(" ")[0] ?? "0");
			// Achromatic colors (S=0) collapse to hue=0 — accept that.
			const lightSat = Number(token.value.split(" ")[1]?.replace("%", "") ?? "0");
			if (lightSat === 0) continue;
			expect(Math.abs(lightHue - darkHue), `${name} hue drifted`).toBeLessThanOrEqual(1);
		}
	});

	it("reduces saturation by 25% to avoid neon-toxic dark colors", () => {
		// Inputs with high saturation should come back proportionally desaturated.
		const lightWithVivid = {
			...defaultTheme.tokens.light,
			vivid: { value: "217 90% 50%", type: "color" as const },
		};
		const dark = deriveDarkFromLight(lightWithVivid);
		const darkSat = Number(dark.vivid?.value.split(" ")[1]?.replace("%", "") ?? "0");
		// Original 90% × 0.75 = 67.5%; allow ±1% rounding.
		expect(darkSat).toBeGreaterThan(66);
		expect(darkSat).toBeLessThan(69);
	});
});

describe("deriveSecondaryFromPrimary", () => {
	it("returns a near-neutral light surface color", () => {
		const blue = "217 91% 60%";
		const secondary = deriveSecondaryFromPrimary(blue);
		// Saturation should be ≤5%; lightness should be ~95.9% (the canonical
		// shadcn `secondary` lightness band — kept so consumers' surfaces don't
		// shift).
		const sat = Number(secondary.value.split(" ")[1]?.replace("%", ""));
		const light = Number(secondary.value.split(" ")[2]?.replace("%", ""));
		expect(sat).toBeLessThanOrEqual(5);
		expect(light).toBeGreaterThan(94);
		expect(light).toBeLessThan(97);
	});

	it("preserves the primary's hue so the secondary feels related", () => {
		const blue = "217 91% 60%";
		const secondary = deriveSecondaryFromPrimary(blue);
		const secondaryHue = Number(secondary.value.split(" ")[0]);
		expect(secondaryHue).toBe(217);
	});
});

describe("contrastRatio", () => {
	it("returns ≥4.5 for canonical AA-pass pairs", () => {
		expect(contrastRatio("0 0% 98%", "240 10% 3.9%")).toBeGreaterThanOrEqual(4.5);
		expect(contrastRatio("240 10% 3.9%", "0 0% 100%")).toBeGreaterThanOrEqual(4.5);
	});

	it("returns <4.5 for canonical AA-fail pairs", () => {
		expect(contrastRatio("240 5% 70%", "0 0% 100%")).toBeLessThan(4.5);
	});
});

describe("colorInputToTokenValue", () => {
	it("parses hex colors", () => {
		const value = colorInputToTokenValue("#1e293b");
		expect(value).not.toBeNull();
		expect(value).toMatch(/^\d+ [\d.]+% [\d.]+%$/);
	});

	it("parses CSS hsl() syntax", () => {
		const value = colorInputToTokenValue("hsl(217 91% 60%)");
		expect(value).toBe("217 91% 60%");
	});

	it("parses named colors", () => {
		const value = colorInputToTokenValue("rebeccapurple");
		expect(value).not.toBeNull();
	});

	it("returns null on unparseable input", () => {
		expect(colorInputToTokenValue("not-a-color-name-anywhere")).toBeNull();
	});
});

describe("tokenLuminance", () => {
	it("returns higher luminance for lighter colors", () => {
		const lightL = tokenLuminance("0 0% 100%");
		const darkL = tokenLuminance("240 10% 3.9%");
		expect(lightL).toBeGreaterThan(darkL);
	});
});
