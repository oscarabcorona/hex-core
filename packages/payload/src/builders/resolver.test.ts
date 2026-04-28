/**
 * Resolver regression assertions. Runs as a standalone node script via
 * `pnpm -F \@hex-core/payload test:resolver`. Lightweight — no test runner
 * dependency — because the resolver is a pure function and a broken
 * scoring rule should fail loudly in a single file.
 *
 * Add a new case by appending to `CASES`. Each case fixes the expected
 * ranking for a brief; any future scoring change must either re-justify
 * the brief or update the case deliberately.
 *
 * All output (success AND failure) writes to stderr. Exit code is the
 * machine-readable contract: 0 = pass, 1 = fail. Stdout is left empty
 * so piping this into another command stays clean.
 */
import { resolveSpec } from "./resolver.js";

interface Case {
	name: string;
	brief: string;
	expect: {
		topRecipe?: string | null; // null means "no recipe should win"
		maxRecipeScore?: number; // cap on the top recipe score (for "no good match" cases)
		topComponent?: string;
	};
}

const CASES: Case[] = [
	// Regression: "kanban board with drag and drop columns" used to rank
	// `command-palette` at score 12 because "and" substring-matched
	// "command" and "board" substring-matched "keyboard". Word-boundary
	// scoring in resolver.ts eliminates those hits.
	{
		name: "kanban brief must not substring-match command-palette",
		brief: "kanban board with drag and drop columns",
		expect: {
			topRecipe: null,
			maxRecipeScore: 6, // noise floor from filler tokens is acceptable
		},
	},
	{
		name: "settings brief resolves to settings-page",
		brief: "build me a settings page with notifications toggle",
		expect: { topRecipe: "settings-page" },
	},
	{
		name: "delete-account brief resolves to confirm-destructive",
		brief:
			"help me add a delete account flow with a warning where user has to type account name to confirm",
		expect: { topRecipe: "confirm-destructive" },
	},
	{
		name: "cmd-k brief resolves to command-palette",
		brief: "add a cmd-k command palette to the app",
		expect: { topRecipe: "command-palette" },
	},
];

const failures: string[] = [];

for (const c of CASES) {
	const result = resolveSpec(c.brief);
	const topRecipe = result.recipes[0]?.slug ?? null;
	const topRecipeScore = result.recipes[0]?.score ?? 0;
	const topComponent = result.components[0]?.component;

	if (c.expect.topRecipe !== undefined) {
		if (c.expect.topRecipe === null) {
			// Accept "no recipe" or "weak recipe under maxRecipeScore".
			const maxAllowed = c.expect.maxRecipeScore ?? 0;
			if (topRecipeScore > maxAllowed) {
				failures.push(
					`${c.name}: expected no recipe (or score <= ${maxAllowed}), got ${topRecipe}(${topRecipeScore})`,
				);
			}
		} else if (topRecipe !== c.expect.topRecipe) {
			failures.push(
				`${c.name}: expected top recipe ${c.expect.topRecipe}, got ${topRecipe}(${topRecipeScore})`,
			);
		}
	}
	if (c.expect.topComponent !== undefined && topComponent !== c.expect.topComponent) {
		failures.push(`${c.name}: expected top component ${c.expect.topComponent}, got ${topComponent}`);
	}
}

if (failures.length > 0) {
	console.error(`resolver: ${failures.length} regression(s)`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
}

console.error(`resolver: ${CASES.length} cases passed`);
