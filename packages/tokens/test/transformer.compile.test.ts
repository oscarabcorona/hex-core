/**
 * Compile-level regression test for `generateGlobalsCss`.
 *
 * Today's transformer test asserts the output's STRING shape (contains
 * `@theme inline`, contains `:root { --background:`, etc.). That catches
 * a token going missing — but it doesn't catch a malformed declaration,
 * an unbalanced brace, an invalid property name, or a stray character
 * that would compile-fail in a consumer's `next dev`.
 *
 * Parse the generated CSS with postcss and assert the AST is well-formed.
 * postcss is forgiving about Tailwind-specific at-rules (`@import`,
 * `@theme`, `@custom-variant`) — it parses them as generic at-rules and
 * doesn't validate their semantics — but it WILL throw on syntactic
 * malformation, which is the regression class we care about here.
 */
import postcss, { type AtRule, type Rule } from "postcss";
import { describe, expect, it } from "vitest";
import { defaultTheme, emberTheme, generateGlobalsCss, midnightTheme } from "../src/index.js";

const allThemes: Array<[string, typeof defaultTheme]> = [
	["default", defaultTheme],
	["midnight", midnightTheme],
	["ember", emberTheme],
];

describe("generateGlobalsCss — postcss compile (no syntax errors)", () => {
	describe.each(allThemes)("theme %s", (_name, theme) => {
		it("v3 output parses without throwing", () => {
			const css = generateGlobalsCss(theme, { target: "v3" });
			expect(() => postcss.parse(css)).not.toThrow();
		});

		it("v4 output parses without throwing", () => {
			const css = generateGlobalsCss(theme, { target: "v4" });
			expect(() => postcss.parse(css)).not.toThrow();
		});
	});

	it("v4 output: every color token reaches @theme inline as a hsl(var(--<key>)) bridge", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		const root = postcss.parse(css);

		const themeBlock = root.nodes.find(
			(n): n is AtRule => n.type === "atrule" && n.name === "theme",
		);
		expect(themeBlock).toBeDefined();
		expect(themeBlock?.params).toBe("inline");

		const declared: string[] = [];
		themeBlock?.walkDecls((decl) => {
			declared.push(decl.prop);
			// Every bridge declaration must be hsl(var(--<base>)).
			expect(decl.value).toMatch(/^hsl\(var\(--[a-z0-9-]+\)\)$/);
		});
		expect(declared).toContain("--color-background");
		expect(declared).toContain("--color-primary");
		expect(declared).toContain("--color-border");
	});

	it("v4 output: :root and .dark each declare the matching raw triplet that the bridge reads", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		const root = postcss.parse(css);

		const rootRule = root.nodes.find(
			(n): n is Rule => n.type === "rule" && n.selector === ":root",
		);
		const darkRule = root.nodes.find(
			(n): n is Rule => n.type === "rule" && n.selector === ".dark",
		);
		expect(rootRule).toBeDefined();
		expect(darkRule).toBeDefined();

		const rootTriplet = (key: string) =>
			rootRule?.nodes.find(
				(n): n is import("postcss").Declaration => n.type === "decl" && n.prop === `--${key}`,
			)?.value;
		expect(rootTriplet("background")).toMatch(/^[\d.]+ [\d.]+% [\d.]+%$/);
		expect(rootTriplet("primary")).toMatch(/^[\d.]+ [\d.]+% [\d.]+%$/);

		// .dark must declare the same set of color tokens as :root (so the
		// bridge cascade actually flips dark mode rather than half-flipping it).
		const colorKeys = ["background", "foreground", "primary", "border", "destructive"];
		for (const key of colorKeys) {
			const inDark = darkRule?.nodes.find(
				(n): n is import("postcss").Declaration => n.type === "decl" && n.prop === `--${key}`,
			);
			expect(inDark, `dark block missing --${key}`).toBeDefined();
		}
	});

	it("v3 output: parses with the legacy @tailwind directives + @layer base structure", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v3" });
		const root = postcss.parse(css);

		const tailwindDirectives = root.nodes.filter(
			(n): n is AtRule => n.type === "atrule" && n.name === "tailwind",
		);
		expect(tailwindDirectives.map((d) => d.params).sort()).toEqual([
			"base",
			"components",
			"utilities",
		]);

		const layerBlocks = root.nodes.filter(
			(n): n is AtRule => n.type === "atrule" && n.name === "layer",
		);
		expect(layerBlocks.length).toBeGreaterThan(0);
		expect(layerBlocks[0].params).toBe("base");
	});

	it("v4 output emits exactly one @theme block (the inline bridge), not a duplicate non-inline @theme", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		const root = postcss.parse(css);
		const themeBlocks = root.nodes.filter(
			(n): n is AtRule => n.type === "atrule" && n.name === "theme",
		);
		expect(themeBlocks).toHaveLength(1);
		expect(themeBlocks[0].params).toBe("inline");
	});
});
