/**
 * Import-rewrite regression assertions. Runs as a standalone node script via
 * `pnpm -F @hex-core/payload test:rewrite-imports`. Same contract as
 * resolver.test.ts: all output on stderr, exit 0 = pass, 1 = fail.
 *
 * This function is the only thing standing between the monorepo-source
 * specifiers the registry stores and an import the consumer's bundler can
 * resolve. An unrewritten specifier is not a lint nit — it is a file that does
 * not compile after `hex add`.
 *
 * Cases run against MOVED aliases rather than the defaults on purpose. With
 * the defaults, `components/` and `lib/` sit under one parent, so a leftover
 * `../../lib/x` resolves by accident and a gap in this function is invisible.
 * A consumer who moved `lib` — the entire reason `hex.config.json` has the
 * key — is the case that exposes it, and is how the hardcoded-`utils` bug
 * below stayed hidden.
 */
import { rewriteRegistryImports } from "./rewrite-imports.js";

const MOVED = { components: "@/ui", lib: "@/shared/helpers" };

const failures: string[] = [];

/**
 * Record a failed assertion.
 * @param name - Case label
 * @param detail - What was expected vs observed
 */
function fail(name: string, detail: string): void {
	failures.push(`${name}: ${detail}`);
}

/**
 * Assert one rewrite produces an exact string.
 * @param name - Case label
 * @param input - Source text to rewrite
 * @param expected - The exact expected output
 * @param aliases - Alias config to rewrite against
 */
function expectRewrite(
	name: string,
	input: string,
	expected: string,
	aliases = MOVED,
): void {
	const actual = rewriteRegistryImports(input, aliases);
	if (actual !== expected) fail(name, `expected ${expected}, got ${actual}`);
}

// ── lib modules ──
// Rule 1 was hardcoded to `utils`, so `color` and `chart-palette` — the other
// two lib modules the registry ships — reached consumers still spelled
// `../../lib/<name>`, in eight items. `utils` is asserted alongside them so a
// regression that re-narrows the rule fails on the pair, not on the one name
// that always worked.
for (const name of ["utils", "color", "chart-palette"]) {
	expectRewrite(
		`lib/${name}`,
		`import { x } from "../../lib/${name}.js";`,
		`import { x } from "@/shared/helpers/${name}";`,
	);
}

// Every lib module in one file, not just the first.
const multiLib = [
	`import { cn } from "../../lib/utils.js";`,
	`import { toHsl } from "../../lib/color.js";`,
	`import { palette } from "../../lib/chart-palette.js";`,
].join("\n");
const multiOut = rewriteRegistryImports(multiLib, MOVED);
if (/\.\.\//.test(multiOut)) {
	fail("lib/multi", `a relative specifier survived: ${multiOut}`);
}
if ((multiOut.match(/@\/shared\/helpers\//g) ?? []).length !== 3) {
	fail("lib/multi", `expected 3 rewritten lib imports, got: ${multiOut}`);
}

// Any nesting depth.
expectRewrite("lib/depth-1", `from "../lib/utils.js"`, `from "@/shared/helpers/utils"`);
expectRewrite("lib/depth-3", `from "../../../lib/utils.js"`, `from "@/shared/helpers/utils"`);

// ── component modules ──
const componentCases: Array<[string, string]> = [
	[`from "../command/command.js"`, `from "@/ui/ui/command"`],
	[`from "../../primitives/button/button.js"`, `from "@/ui/ui/button"`],
	[`from "../../components/alert/alert.js"`, `from "@/ui/ui/alert"`],
	[`from "../_shared/auth-adapter.js"`, `from "@/ui/_shared/auth-adapter"`],
	[`from "./button-variants.js"`, `from "@/ui/ui/button-variants"`],
	[`from "../../primitives/button/button-variants.js"`, `from "@/ui/ui/button-variants"`],
	[`from "../types.js"`, `from "@/ui/ui/types"`],
];
for (const [input, expected] of componentCases) {
	expectRewrite(`component ${input}`, input, expected);
}

// ── what it must not touch ──
const bare = [
	`import * as React from "react";`,
	`import { Slot } from "@radix-ui/react-slot";`,
	`import { cva } from "class-variance-authority";`,
].join("\n");
expectRewrite("bare specifiers untouched", bare, bare);

// ── default aliases ──
// Called without the second argument so the DEFAULT_ALIASES path is exercised
// for real, rather than by passing a copy of it.
const defaultCases: Array<[string, string]> = [
	[`from "../../lib/color.js"`, `from "@/lib/color"`],
	[`from "../../lib/utils.js"`, `from "@/lib/utils"`],
	[`from "../../primitives/button/button.js"`, `from "@/components/ui/button"`],
];
for (const [input, expected] of defaultCases) {
	const actual = rewriteRegistryImports(input);
	if (actual !== expected) fail(`defaults ${input}`, `expected ${expected}, got ${actual}`);
}

if (failures.length > 0) {
	console.error(`rewrite-imports: ${failures.length} regression(s)`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
}

console.error(`rewrite-imports: all cases passed`);
