import { definePackageTests } from "../../vitest.base.js";

export default definePackageTests({
	// Run `expectTypeOf` assertions through tsc on the same `pnpm test`
	// invocation so type-level guarantees are enforced in CI. Without this,
	// expectTypeOf calls compile to no-ops at runtime and the type-level
	// suite silently fails-open if the inferred type drifts.
	typecheck: {
		enabled: true,
		tsconfig: "./tsconfig.test.json",
		include: ["test/**/*.test.ts"],
	},
});
