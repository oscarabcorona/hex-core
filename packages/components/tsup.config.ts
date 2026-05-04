import * as path from "node:path";
import fg from "fast-glob";
import { defineConfig } from "tsup";

/**
 * Per-component file split (1.4.0+).
 *
 * Before: a single `dist/index.js` with a tsup `banner: { js: '"use client";' }`
 * forcing the whole 365K bundle to be a Client Component. Importing any single
 * component poisoned the consumer's RSC tree.
 *
 * After: one entry per component file. Each source file declares its own
 * `"use client"` directive at the top if (and only if) it actually needs one.
 * Pure-visual components (Badge, Card, Stack, Cluster, Grid, Skeleton,
 * Pagination, Timeline, Stepper, Input, Textarea, etc.) ship without the
 * directive and are RSC-safe — consumers can render `<Card>...</Card>` in a
 * Server Component without forcing the subtree client-side.
 *
 * Existing `import { Button } from "@hex-core/components"` keeps working via
 * the `index` entry (the barrel re-exports everything). New optimization-aware
 * consumers use `import { Button } from "@hex-core/components/button"` for
 * tree-shake-friendly + RSC-safe deep imports.
 */

const entryFiles = fg.sync(
	[
		"src/index.ts",
		"src/schemas.ts",
		"src/primitives/*/*.tsx",
		"src/components/*/*.tsx",
		"src/ai/*/*.tsx",
		"src/artifacts/*/*.tsx",
	],
	{
		ignore: ["**/*.test.tsx", "**/*.schema.ts", "**/_shared/**"],
		cwd: path.resolve(__dirname),
		absolute: false,
	},
);

const entry = Object.fromEntries(
	entryFiles.map((relPath) => {
		// "src/index.ts"  → "index"
		// "src/primitives/button/button.tsx" → "button"
		// "src/components/data-table/data-table.tsx" → "data-table"
		const base = path.basename(relPath, path.extname(relPath));
		return [base, relPath];
	}),
);

export default defineConfig({
	entry,
	format: ["esm"],
	// `experimentalDts` (tsup 8.x) drives type-decl generation through
	// the TS compiler API + a lightweight rollup pass instead of the
	// classic `rollup-plugin-dts` worker. The legacy path forced each
	// of the 70+ entries to walk the FULL upstream type graph
	// (streamdown → @ai-sdk → react-markdown → shiki's 600-literal
	// `BundledLanguage`) inside a single worker, exhausting >4GB of
	// heap. The experimental pipeline reuses TS's incremental program
	// across entries and emits per-file `.d.ts` first, so the worker
	// peaks at <1GB on this workspace.
	experimentalDts: true,
	clean: true,
	sourcemap: true,
	// `splitting: false` is critical for "use client" preservation. With
	// splitting on, rollup hoists shared logic into chunks and strips
	// directives — the per-component entry shims end up empty re-exports
	// without their `"use client"` marker. With splitting off, each entry
	// becomes a self-contained module that preserves its source directive
	// at the top of the emitted file. Cost: some helper duplication
	// (cn(), cva variants), but each emitted file stays under ~6KB and
	// gzips dedupe well at the consumer's bundler level.
	splitting: false,
	treeshake: true,
	// No global "use client" banner — each source file declares its own
	// directive. Pure-visual components stay RSC-safe; tsup preserves the
	// directive at the top of each emitted dist/<name>.js.
	external: [
		"react",
		"react-dom",
		"react-hook-form",
		"@hookform/resolvers",
		"zod",
		"@tanstack/react-table",
		"sonner",
		"react-day-picker",
		"date-fns",
		"cmdk",
		"input-otp",
		"vaul",
		"react-resizable-panels",
		"@xterm/xterm",
		"reactflow",
		"wavesurfer.js",
		"mermaid",
		"d3-hierarchy",
		"d3-shape",
		/^@radix-ui\//,
		"class-variance-authority",
		"clsx",
		"tailwind-merge",
		// Cross-entry boundary: keep the sibling import in `code-block.tsx`
		// (async Server Component) pointing at the separate `"use client"`
		// `code-block-copy.tsx` island at runtime. Without this, `splitting:
		// false` inlines the client hooks (`useState`, `navigator.clipboard`)
		// into the server bundle and the RSC boundary collapses.
		//
		// The regex MUST be anchored to the sibling-relative form so the
		// flat-dist barrel re-export `from "./ai/code-block/code-block-copy.js"`
		// in `src/index.ts` is NOT treated as external (it has no
		// corresponding nested file in the flat `dist/`; it must be inlined
		// + rewritten to the sibling `./code-block-copy.js`).
		/^\.\/code-block-copy(\.js)?$/,
	],
});
