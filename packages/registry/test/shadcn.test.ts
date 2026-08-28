/**
 * shadcn projection round-trip.
 *
 * Every built registry item must project into a wire object that satisfies
 * the shadcn registry-item contract — this is what the docs site serves at
 * `/r/{name}.json` for `npx shadcn add @hex/<name>`. A projection that only
 * works for the items someone spot-checked is how interop quietly breaks,
 * so the sweep covers the whole catalog like validate-registry.test.ts does.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { registryItemSchema } from "../src/index.js";
import { shadcnRegistryItemSchema, toShadcnRegistryItem } from "../src/shadcn.js";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ITEMS_DIR = join(HERE, "../../../registry/items");

const itemFiles = readdirSync(ITEMS_DIR)
	.filter((f) => f.endsWith(".json"))
	.map((f) => join(ITEMS_DIR, f));

describe("shadcn registry-item projection", () => {
	it.each(itemFiles)("projects to a valid shadcn item: %s", (file) => {
		const item = registryItemSchema.parse(JSON.parse(readFileSync(file, "utf8")));
		const projected = toShadcnRegistryItem(item);
		const result = shadcnRegistryItemSchema.safeParse(projected);
		if (!result.success) {
			throw new Error(
				`${file}\n${result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`,
			);
		}
	});

	it.each(itemFiles)("pins non-standard paths with an explicit target: %s", (file) => {
		const item = registryItemSchema.parse(JSON.parse(readFileSync(file, "utf8")));
		const projected = toShadcnRegistryItem(item);
		for (const projectedFile of projected.files) {
			const standard =
				projectedFile.path.startsWith("components/ui/") || projectedFile.path.startsWith("lib/");
			if (!standard) {
				// shadcn places files by type (ui → flattened into the consumer's
				// ui dir), which would break `_shared/` relative layouts — those
				// must ship as registry:file with the Hex path pinned.
				expect(projectedFile.type, projectedFile.path).toBe("registry:file");
				expect(projectedFile.target, projectedFile.path).toBe(projectedFile.path);
			}
		}
	});

	it("unions npm deps across the internal-dependency closure", () => {
		const load = (slug: string) => {
			const path = join(ITEMS_DIR, `${slug}.json`);
			return registryItemSchema.parse(JSON.parse(readFileSync(path, "utf8")));
		};
		// combobox bundles dialog.tsx (via command) but lists neither dialog's
		// npm dep nor dialog in its own internal list — only the closure walk
		// reaches it. Without a resolver, the dep must be absent.
		const bare = toShadcnRegistryItem(load("combobox"));
		expect(bare.dependencies).not.toContain("@radix-ui/react-dialog");
		const resolved = toShadcnRegistryItem(load("combobox"), {
			resolveInternalItem: (slug) => load(slug),
		});
		expect(resolved.dependencies).toContain("@radix-ui/react-dialog");
		expect(resolved.dependencies).toContain("cmdk");
		// auth blocks bundle label.tsx via primitives/label/label
		const auth = toShadcnRegistryItem(load("auth-forgot-password"), {
			resolveInternalItem: (slug) => load(slug),
		});
		expect(auth.dependencies).toContain("@radix-ui/react-label");
	});

	it("applies transformFileContent to every file", () => {
		const item = registryItemSchema.parse(
			JSON.parse(readFileSync(join(ITEMS_DIR, "combobox.json"), "utf8")),
		);
		const projected = toShadcnRegistryItem(item, {
			transformFileContent: (content) => `/* rewritten */\n${content}`,
		});
		for (const file of projected.files) {
			expect(file.content.startsWith("/* rewritten */")).toBe(true);
		}
	});

	it("maps the load-bearing fields (button)", () => {
		const item = registryItemSchema.parse(
			JSON.parse(readFileSync(join(ITEMS_DIR, "button.json"), "utf8")),
		);
		const projected = toShadcnRegistryItem(item);
		expect(projected.name).toBe("button");
		expect(projected.type).toBe("registry:ui");
		expect(projected.title).toBe("Button");
		expect(projected.files.length).toBe(item.files.length);
		expect(projected.dependencies).toContain("class-variance-authority");
		// peer deps are the host's job, not an install instruction
		expect(projected.dependencies).not.toContain("react");
		// the Hex intent block rides along verbatim
		expect(projected.ai?.whenToUse).toBe(item.ai.whenToUse);
		// no second resolution pass: transitive files are already inlined
		expect(projected).not.toHaveProperty("registryDependencies");
	});
});
