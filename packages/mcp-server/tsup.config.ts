import { defineConfig } from "tsup";

/*
 * Three entries with split configs because only `index` needs the bin
 * shebang. `clients` ships TypeScript declarations so the docs app and any
 * other consumer can import the typed wiring data. `contract-test` is built
 * (rather than run via tsx) so CI doesn't need an extra runtime dependency.
 *
 * tsup runs the array via Promise.all, so `clean: true` on any one config
 * would race the writes of the others. The `build` script in package.json
 * runs `pnpm clean` first to clear `dist/` deterministically before any
 * tsup config fires.
 */
export default defineConfig([
	{
		entry: { index: "src/index.ts" },
		format: ["esm"],
		dts: false,
		sourcemap: true,
		banner: { js: "#!/usr/bin/env node" },
	},
	{
		entry: { clients: "src/clients.ts" },
		format: ["esm"],
		dts: true,
		sourcemap: true,
	},
	{
		entry: { "contract-test": "src/contract.test.ts" },
		format: ["esm"],
		dts: false,
		sourcemap: true,
	},
]);
