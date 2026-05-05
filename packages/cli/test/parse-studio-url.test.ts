import { describe, expect, it } from "vitest";
import { parseStudioUrl } from "../src/lib/parse-studio-url.js";

describe("parseStudioUrl", () => {
	it("parses base + per-mode tokens + radius", () => {
		const url =
			"https://www.hex-core.dev/studio?base=midnight&mode=light&radius=0.825&background_light=220+31%25+61%25&primary_dark=240+50%25+50%25&density=spacious";
		const out = parseStudioUrl(url);
		expect(out.base).toBe("midnight");
		expect(out.light.background).toEqual({ value: "220 31% 61%", type: "color" });
		expect(out.dark.primary).toEqual({ value: "240 50% 50%", type: "color" });
		expect(out.light.radius).toEqual({ value: "0.825rem", type: "radius" });
		expect(out.dark.radius).toEqual({ value: "0.825rem", type: "radius" });
		expect(out.warnings.some((w) => w.includes("density"))).toBe(true);
	});

	it("rejects URLs without base", () => {
		expect(() =>
			parseStudioUrl("https://www.hex-core.dev/studio?primary_light=220+50%25+50%25"),
		).toThrow(/base/);
	});

	it("rejects non-http schemes", () => {
		expect(() => parseStudioUrl("file:///etc/passwd?base=midnight")).toThrow(/http/);
	});

	it("rejects unknown hosts", () => {
		expect(() => parseStudioUrl("https://evil.example/studio?base=midnight")).toThrow(/host/);
	});

	it("warns and skips malformed triplets", () => {
		const out = parseStudioUrl(
			"https://hex-core.dev/studio?base=midnight&primary_light=not-a-triplet",
		);
		expect(out.light.primary).toBeUndefined();
		expect(out.warnings.some((w) => w.includes("primary_light"))).toBe(true);
	});

	it("warns and skips unknown URL params", () => {
		const out = parseStudioUrl(
			"https://hex-core.dev/studio?base=midnight&completely_unknown=foo",
		);
		expect(out.warnings.some((w) => w.includes("completely_unknown"))).toBe(true);
	});

	it("preserves explicit unit on radius", () => {
		const out = parseStudioUrl("https://hex-core.dev/studio?base=midnight&radius=12px");
		expect(out.light.radius).toEqual({ value: "12px", type: "radius" });
	});
});
