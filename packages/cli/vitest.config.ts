import { defineConfig } from "vitest/config";

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
