import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"timeline/index": "src/timeline/index.ts",
		"adapters/motion/index": "src/adapters/motion/index.ts",
	},
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	splitting: true,
	external: ["react", "react-dom", "motion", "motion/react", "@hex-core/registry"],
});
