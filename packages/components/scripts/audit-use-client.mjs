#!/usr/bin/env node
/**
 * Audit which `src/**\/*.tsx` files need a `"use client"` directive.
 *
 * Heuristic + walker live in `_client-patterns.mjs` so this script and
 * `inject-use-client.mjs` stay in lockstep — see that module's comment for
 * the rule set.
 *
 * Output: a JSON map `{ filePath: "client" | "server" }` printed to stdout.
 * Also writes a human-readable summary to stderr.
 *
 * Usage: `node scripts/audit-use-client.mjs` (run from packages/components/).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
	classifySources,
	hasUseClientDirective,
	walkTsx,
} from "./_client-patterns.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "../src");

const result = classifySources(srcDir);
const summary = { client: [], server: [], alreadyMarked: [] };

for (const file of walkTsx(srcDir)) {
	const rel = path.relative(srcDir, file);
	const content = fs.readFileSync(file, "utf8");
	if (hasUseClientDirective(content)) summary.alreadyMarked.push(rel);
	if (result[rel] === "client" && !hasUseClientDirective(content)) {
		summary.client.push(rel);
	} else if (result[rel] === "server") {
		summary.server.push(rel);
	}
}

console.error(`\n=== "use client" audit ===`);
console.error(
	`${summary.alreadyMarked.length} files already marked, ${summary.client.length} need marking, ${summary.server.length} are RSC-safe (server)`,
);
console.error(`\nRSC-safe (server) — leave bare:`);
for (const f of summary.server) console.error(`  ${f}`);
console.error(`\nClient-only — needs "use client" added:`);
for (const f of summary.client) console.error(`  ${f}`);

console.log(JSON.stringify(result, null, 2));
