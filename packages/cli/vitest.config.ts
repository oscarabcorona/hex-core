import { defineConfig } from "vitest/config";

// picocolors enables ANSI codes when `CI` is in the environment (GitHub
// Actions sets this unconditionally). Tests assert against literal strings
// like `Write: lib/utils.ts`, so force colors off via NO_COLOR before any
// test module imports picocolors. Local runs without `CI` are already
// color-free thanks to the TTY check.
process.env.NO_COLOR = "1";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		include: ["src/**/*.test.ts", "test/**/*.test.ts"],
		// Integration tests spawn the built CLI binary against a tmpdir scratch
		// project. They require `pnpm build` to have run first, are slower than
		// unit tests (~5–10s each), and shell out to npm — so they're gated
		// behind a separate `test:integration` script and excluded from the
		// default `vitest run`.
		exclude: ["test/integration/**", "node_modules/**", "dist/**"],
	},
});
