#!/usr/bin/env node
/**
 * Re-inject `"use client"` directives into per-component dist files.
 *
 * Why: tsup (rollup under the hood) strips directives during bundling. Our
 * source files declare `"use client"` correctly, but `dist/dialog.js`,
 * `dist/button.js`, etc. lose them. Without this step, every consumer-facing
 * file is treated as RSC-safe — which silently breaks Radix and any hook
 * call at runtime.
 *
 * What: classifies sources via the shared heuristic in `_client-patterns.mjs`
 * (single source of truth, also used by `audit:use-client`), then writes
 * `"use client";\n` to the top of every dist/<name>.js whose source is
 * `"client"`. Idempotent — skips files that already carry the directive.
 *
 * Mapping: src files like `primitives/button/button.tsx` map to dist files
 * like `dist/button.js` (entry name = source basename, per tsup config).
 *
 * Usage: runs automatically as part of the `build` script (postbuild).
 * Manual invocation: `node scripts/inject-use-client.mjs`.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
	hasUseClientDirective,
	isClientSource,
	walkTsx,
} from "./_client-patterns.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, "..");
const distDir = path.join(pkgRoot, "dist");
const srcDir = path.join(pkgRoot, "src");

function injectDirective(distFile) {
	if (!fs.existsSync(distFile)) return "missing";
	const distContent = fs.readFileSync(distFile, "utf8");
	if (hasUseClientDirective(distContent)) return "already";
	fs.writeFileSync(distFile, `"use client";\n${distContent}`);
	return "injected";
}

let injected = 0;
let alreadyMarked = 0;
let serverSafe = 0;
let missingDist = 0;

for (const sourceFile of walkTsx(srcDir)) {
	const content = fs.readFileSync(sourceFile, "utf8");
	if (!isClientSource(content)) {
		serverSafe++;
		continue;
	}

	const base = path.basename(sourceFile, path.extname(sourceFile));
	const distFile = path.join(distDir, `${base}.js`);

	const result = injectDirective(distFile);
	if (result === "missing") missingDist++;
	else if (result === "already") alreadyMarked++;
	else injected++;
}

// Barrel `dist/index.js` re-exports both server-safe and client-only modules.
// Since `splitting: false` inlines all of them into one file, the barrel must
// be marked client — a server import would crash at first Radix call. Deep
// imports (`@hex-core/components/<name>`) remain the RSC-safe path.
const barrelResult = injectDirective(path.join(distDir, "index.js"));
const barrelStatus =
	barrelResult === "injected"
		? "barrel=injected"
		: barrelResult === "already"
		  ? "barrel=already"
		  : "barrel=MISSING";

console.error(
	`[inject-use-client] injected=${injected} alreadyMarked=${alreadyMarked} server-safe=${serverSafe} missing-dist=${missingDist} ${barrelStatus}`,
);

// Hard-fail when a source file expected a dist counterpart that didn't
// land. Otherwise a tsup entry-name regression silently publishes
// unmarked client bundles — bundle.test.ts would catch it but plain
// `pnpm build` would not, and `publish-local.sh` runs build directly.
if (missingDist > 0 || barrelResult === "missing") {
	process.exit(1);
}
