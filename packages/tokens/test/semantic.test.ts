import { describe, expect, it } from "vitest";
import {
	defaultSemanticTokens,
	defaultTheme,
	emberTheme,
	midnightTheme,
	resolveSemanticToken,
} from "../src/index.js";

/**
 * Locks in the contract that every value in `defaultSemanticTokens`
 * resolves against ALL OSS preset themes (light + dark, default +
 * midnight + ember). Earlier prototype used dot-namespaced refs
 * (`{color.destructive}`) that didn't match the flat token store —
 * this test would have failed loudly under that mismatch. The
 * theme-portability claim in the JSDoc + changeset depends on this:
 * a future preset theme that drops a referenced flat token name
 * fails the suite before it ships.
 */
const THEMES = [
	["default", defaultTheme],
	["midnight", midnightTheme],
	["ember", emberTheme],
] as const;

describe("defaultSemanticTokens", () => {
	for (const [name, theme] of THEMES) {
		for (const mode of ["light", "dark"] as const) {
			it(`every entry resolves against ${name}.${mode}`, () => {
				for (const [slot, entry] of Object.entries(defaultSemanticTokens)) {
					const resolved = resolveSemanticToken(entry.value, theme.tokens[mode]);
					expect(
						resolved,
						`semantic token ${slot} → ${entry.value} resolves to nothing in ${name}.${mode}`,
					).not.toBeNull();
				}
			});
		}
	}

	it("the resolved type matches the declared semantic-entry type", () => {
		for (const [name, entry] of Object.entries(defaultSemanticTokens)) {
			const resolved = resolveSemanticToken(entry.value, defaultTheme.tokens.light);
			expect(resolved?.type, `${name} type mismatch`).toBe(entry.type);
		}
	});
});

describe("resolveSemanticToken", () => {
	it("resolves a valid reference", () => {
		const r = resolveSemanticToken("{primary}", defaultTheme.tokens.light);
		expect(r).not.toBeNull();
		expect(r?.type).toBe("color");
	});

	it("returns null on a malformed reference", () => {
		expect(resolveSemanticToken("primary", defaultTheme.tokens.light)).toBeNull();
		expect(resolveSemanticToken("{Primary}", defaultTheme.tokens.light)).toBeNull();
		expect(resolveSemanticToken("{}", defaultTheme.tokens.light)).toBeNull();
	});

	it("returns null when the token doesn't exist in the set", () => {
		expect(resolveSemanticToken("{nonexistent-token}", defaultTheme.tokens.light)).toBeNull();
	});
});
