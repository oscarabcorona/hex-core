import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { affectedSlug, explainSlug, neighborsOfSlug, pathBetween } from "../src/commands/graph.js";

let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;
let exitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null | undefined) => {
		throw new Error(`process.exit(${code ?? 0})`);
	}) as never);
});

afterEach(() => {
	logSpy.mockRestore();
	errSpy.mockRestore();
	exitSpy.mockRestore();
});

describe("hex graph explain", () => {
	it("emits the node with grouped relations as JSON", async () => {
		await explainSlug("marketing-hero", { json: true });
		const result = JSON.parse(String(logSpy.mock.calls[0][0])) as {
			node: { id: string; community: string };
			relations: Array<{ relation: string }>;
		};
		expect(result.node.id).toBe("item:marketing-hero");
		expect(result.node.community).toBe("block/marketing");
		expect(result.relations.map((r) => r.relation)).toContain("composes");
	});

	it("renders a human report by default", async () => {
		await explainSlug("marketing-hero", { json: false });
		const out = logSpy.mock.calls.flat().join("\n");
		expect(out).toContain("MarketingHero");
		expect(out).toContain("landing-page");
	});

	it("exits with a hint for unknown slugs", async () => {
		await expect(explainSlug("not-a-slug", { json: false })).rejects.toThrow(/exit/);
		expect(errSpy.mock.calls.flat().join("\n")).toContain("not in the catalog graph");
	});
});

describe("hex graph affected", () => {
	it("emits dependents and recipes as JSON", async () => {
		await affectedSlug("button", { json: true });
		const result = JSON.parse(String(logSpy.mock.calls[0][0])) as {
			items: Array<{ slug: string; depth: number }>;
			recipes: string[];
		};
		expect(result.items.length).toBeGreaterThan(0);
		expect(result.recipes.length).toBeGreaterThan(0);
	});

	it("says so when nothing depends on a leaf item", async () => {
		await affectedSlug("aspect-ratio", { json: false });
		expect(logSpy.mock.calls.flat().join("\n")).toContain("Nothing in the catalog depends");
	});

	it("exits with a hint for unknown slugs", async () => {
		await expect(affectedSlug("not-a-slug", { json: false })).rejects.toThrow(/exit/);
		expect(errSpy.mock.calls.flat().join("\n")).toContain("not a catalog item");
	});
});

describe("hex graph neighbors", () => {
	it("filters to the requested relation", async () => {
		await neighborsOfSlug("combobox", { json: true, relation: ["requires"] });
		const result = JSON.parse(String(logSpy.mock.calls[0][0])) as Array<{ edge: { relation: string } }>;
		expect(result.length).toBeGreaterThan(0);
		expect(result.every((n) => n.edge.relation === "requires")).toBe(true);
	});

	it("rejects an unknown relation by naming the vocabulary", async () => {
		await expect(
			neighborsOfSlug("button", { json: true, relation: ["not-a-relation"] }),
		).rejects.toThrow(/exit/);
		expect(errSpy.mock.calls.flat().join("\n")).toContain("Unknown relation");
	});
});

describe("hex graph path", () => {
	it("returns a hop sequence between two slugs", async () => {
		await pathBetween("button", "card", { json: true });
		const hops = JSON.parse(String(logSpy.mock.calls[0][0])) as Array<{ node: { slug: string } }>;
		expect(hops[0].node.slug).toBe("button");
		expect(hops[hops.length - 1].node.slug).toBe("card");
	});

	it("exits when a slug is unknown", async () => {
		await expect(pathBetween("button", "not-a-slug", { json: true })).rejects.toThrow(/exit/);
	});
});
