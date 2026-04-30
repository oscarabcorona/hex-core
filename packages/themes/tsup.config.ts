import * as fs from "node:fs";
import * as path from "node:path";
import { defineConfig } from "tsup";

const PRESETS_DIR = path.resolve(__dirname, "src/presets");

/**
 * Build the entry map: the main barrel + one entry per voltagent
 * preset. Per-preset entries let Studio (and any consumer with a
 * known set of theme slugs) deep-import a single brand without
 * pulling the full 1.6MB catalog. The barrel still works for
 * "pick from anything" UIs.
 */
function buildEntries(): Record<string, string> {
	const entries: Record<string, string> = { index: "src/index.ts" };
	if (fs.existsSync(PRESETS_DIR)) {
		const files = fs.readdirSync(PRESETS_DIR);
		for (const file of files) {
			if (!file.endsWith(".ts")) continue;
			if (file === "index.ts") continue;
			const slug = file.replace(/\.ts$/, "");
			entries[`presets/${slug}`] = `src/presets/${file}`;
		}
		// Also surface the per-brief markdown strings as deep imports so
		// consumers can pull a single brief without the theme tokens.
		const briefsDir = path.join(PRESETS_DIR, "_briefs");
		if (fs.existsSync(briefsDir)) {
			for (const file of fs.readdirSync(briefsDir)) {
				if (!file.endsWith(".ts")) continue;
				const slug = file.replace(/\.ts$/, "");
				entries[`presets/_briefs/${slug}`] = `src/presets/_briefs/${file}`;
			}
		}
		entries["presets/index"] = "src/presets/index.ts";
	}
	return entries;
}

export default defineConfig({
	entry: buildEntries(),
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	// `splitting: true` is what makes `loadThemeBrief`'s dynamic
	// imports actually code-split. Without it, tsup inlines every
	// brief into the top-level barrel (~1.6MB) defeating tree-shake.
	splitting: true,
	external: ["@hex-core/registry", "@hex-core/tokens"],
});
