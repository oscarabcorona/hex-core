import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		include: ["src/**/*.test.ts", "test/**/*.test.ts"],
		// Run `expectTypeOf` assertions through tsc on the same `pnpm test`
		// invocation so type-level guarantees are enforced in CI. Without
		// this, expectTypeOf calls compile to no-ops at runtime and the
		// type-level suite at test/token-set.test.ts:222-251 silently
		// fails-open if the inferred type drifts.
		typecheck: {
			enabled: true,
			tsconfig: "./tsconfig.test.json",
			include: ["test/**/*.test.ts"],
		},
	},
});
