import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listComponents } from "../src/commands/list.js";

let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
	logSpy.mockRestore();
});

describe("hex list", () => {
	it("prints components by category and recipes at the bottom", async () => {
		await listComponents();
		const stdout = logSpy.mock.calls.flat().join("\n");

		expect(stdout).toContain("Hex Core Components");
		expect(stdout).toMatch(/Total: \d+ components/);

		// Recipes section appears after the components list
		expect(stdout).toContain("Recipes (spec-driven blueprints)");
		// Real recipe slug from the bundled registry
		expect(stdout).toContain("auth-form");
		// Try-one CTA points at the first recipe alphabetically
		expect(stdout).toMatch(/Try one: hex recipe add /);
	});
});
