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
	// Every entry uses React hooks / context, so the whole package is client-only.
	// tsup strips per-file "use client" directives during bundling; the banner
	// re-applies it on each output file so consumers can import the wrappers
	// directly into a Server Component (RSC) page without an RSC boundary error.
	banner: { js: '"use client";' },
	external: ["react", "react-dom", "motion", "motion/react", "@hex-core/registry"],
});
