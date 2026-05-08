import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/** Minimal Vite + React + Tailwind v4 scaffold for the regression suite.
 *  Aliases match the tsconfig `paths` so `@/components/ui/<slug>` resolves
 *  end-to-end (TS + bundler). */
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
});
