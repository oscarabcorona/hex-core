import { defineConfig } from "vitest/config";

/**
 * Integration test config — spawns the built CLI binary against a tmpdir
 * scratch project. Slower than the unit suite (~5–15s total), requires
 * `pnpm build` to have run first.
 */
export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		include: ["test/integration/**/*.test.ts"],
		// Each spawn-heavy case needs its own breathing room (npm install can be
		// slow on cold CI runners).
		testTimeout: 30_000,
	},
});
