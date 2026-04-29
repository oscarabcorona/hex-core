import { describe, expect, it } from "vitest";
import { defaultSemanticTokens, defaultTheme, resolveSemanticToken } from "../src/index.js";

/**
 * Locks in the contract that every value in `defaultSemanticTokens`
 * resolves against the canonical light + dark `TokenSet`s. Earlier
 * prototype used dot-namespaced refs (`{color.destructive}`) that
 * didn't match the flat token store — this test would have failed
 * loudly under that mismatch.
 */
describe("defaultSemanticTokens", () => {
	it("every entry references a token that exists in defaultTheme.light", () => {
		for (const [name, entry] of Object.entries(defaultSemanticTokens)) {
			const resolved = resolveSemanticToken(entry.value, defaultTheme.tokens.light);
			expect(
				resolved,
				`semantic token ${name} → ${entry.value} resolves to nothing in defaultTheme.light`,
			).not.toBeNull();
		}
	});

	it("every entry references a token that exists in defaultTheme.dark", () => {
		for (const [name, entry] of Object.entries(defaultSemanticTokens)) {
			const resolved = resolveSemanticToken(entry.value, defaultTheme.tokens.dark);
			expect(
				resolved,
				`semantic token ${name} → ${entry.value} resolves to nothing in defaultTheme.dark`,
			).not.toBeNull();
		}
	});

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
