import { expect, test } from "@playwright/test";

/**
 * The agent-facing HTTP surface: llms.txt, the registry/recipes/graph JSON
 * endpoints, and the shadcn-compatible per-item route. These are consumed by
 * machines, so the assertions pin the contract (shape + counts), not markup.
 */
test.describe("agent surface", () => {
	test("llms.txt serves the compact agent index", async ({ request }) => {
		const response = await request.get("/llms.txt");
		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("text/plain");
		const body = await response.text();
		expect(body).toContain("# Hex UI");
		expect(body).toContain("## Agent endpoints");
		expect(body).toContain("/registry.json");
		// compact by design — the catalog listing belongs to llms-full.txt
		expect(body).not.toContain("### Primitives");
	});

	test("llms-full.txt appends the full catalog", async ({ request }) => {
		const response = await request.get("/llms-full.txt");
		expect(response.status()).toBe(200);
		const body = await response.text();
		expect(body).toContain("## Catalog");
		expect(body).toContain("### Primitives");
		expect(body).toContain("### Artifacts");
		expect(body).toContain("- **button** (Button):");
	});

	test("registry.json serves the full index", async ({ request }) => {
		const response = await request.get("/registry.json");
		expect(response.status()).toBe(200);
		const index = await response.json();
		expect(index.items.length).toBeGreaterThanOrEqual(180);
	});

	test("recipes.json and graph.json serve committed registry data", async ({ request }) => {
		const recipes = await (await request.get("/recipes.json")).json();
		expect(recipes.items.length).toBeGreaterThanOrEqual(20);
		const graph = await (await request.get("/graph.json")).json();
		expect(graph.nodes.length).toBeGreaterThan(0);
		expect(graph.edges.length).toBeGreaterThan(0);
	});

	test("r/button.json serves the shadcn projection with the ai block", async ({ request }) => {
		const response = await request.get("/r/button.json");
		expect(response.status()).toBe(200);
		const item = await response.json();
		expect(item.name).toBe("button");
		expect(item.type).toBe("registry:ui");
		expect(item.title).toBe("Button");
		expect(item.files.length).toBeGreaterThan(0);
		// the cva call lives in button-variants.tsx, not necessarily files[0]
		const allContent = item.files.map((f: { content: string }) => f.content).join("\n");
		expect(allContent).toContain("cva(");
		expect(item.ai.whenToUse.length).toBeGreaterThan(0);
		expect(item.registryDependencies).toBeUndefined();
	});

	test("r route 404s outside the catalog", async ({ request }) => {
		const response = await request.get("/r/not-a-component.json");
		expect(response.status()).toBe(404);
	});

	test("r route rewrites monorepo import specifiers to @/ aliases", async ({ request }) => {
		// combobox ships sibling-dir specifiers (../command/command.js) that
		// only the install-time rewrite makes resolvable — the served
		// projection must carry @/ aliases the shadcn CLI can map.
		const combobox = await (await request.get("/r/combobox.json")).json();
		const comboboxContent = combobox.files
			.map((f: { content: string }) => f.content)
			.join("\n");
		expect(comboboxContent).toContain('@/components/ui/command');
		expect(comboboxContent).not.toContain('from "../');
		// npm deps must cover the whole inlined-file closure: dialog.tsx is
		// bundled via command, and only dialog's own entry lists its Radix dep.
		expect(combobox.dependencies).toContain("@radix-ui/react-dialog");

		// auth blocks carry a components/_shared file: it must ship as
		// registry:file pinned to its Hex path, with imports pointing there.
		const auth = await (await request.get("/r/auth-forgot-password.json")).json();
		const shared = auth.files.find((f: { path: string }) =>
			f.path.startsWith("components/_shared/"),
		);
		expect(shared.type).toBe("registry:file");
		expect(shared.target).toBe(shared.path);
		const authContent = auth.files.map((f: { content: string }) => f.content).join("\n");
		expect(authContent).toContain("@/components/_shared/auth-adapter");
		expect(authContent).not.toContain('from "../');
	});
});
