import * as path from "node:path";
import fg from "fast-glob";
import { defineConfig } from "tsup";

/**
 * Build entries: the main barrel + the timeline subpath + the optional
 * motion@^11 adapter + one per Phase 2 wrapper component. Per-component
 * subpath bundles let consumers `import { FadeIn } from "@hex-core/motion/fade-in"`
 * for tree-shake-friendly deep imports — equivalent of the pattern used in
 * `packages/components/tsup.config.ts`.
 */
function buildEntries(): Record<string, string> {
	const entries: Record<string, string> = {
		index: "src/index.ts",
		"timeline/index": "src/timeline/index.ts",
		"adapters/motion/index": "src/adapters/motion/index.ts",
	};
	const components = fg.sync("src/components/*/*.tsx", {
		cwd: path.resolve(__dirname),
		absolute: false,
	});
	for (const file of components) {
		const name = path.basename(file, ".tsx");
		entries[name] = file;
	}
	return entries;
}

export default defineConfig({
	entry: buildEntries(),
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	splitting: true,
	external: ["react", "react-dom", "motion", "motion/react", "@hex-core/registry"],
});
