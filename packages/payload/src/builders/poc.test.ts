/**
 * POC-builder regression assertions. Runs as a standalone node script via
 * `pnpm -F @hex-core/payload test:poc`. Same contract as
 * resolver.test.ts: all output on stderr, exit 0 = pass, 1 = fail.
 *
 * The generated tree was verified once for real (`pnpm install && next
 * build` green on the calibrated SaaS brief); these assertions pin the
 * properties that build depended on.
 */
import { buildApplicationMap, mapSchema, stableStringifyMap } from "./map.js";
import { loadRegistry, loadRegistryItem } from "../loaders/registry-loader.js";
import { buildPocFiles, generatePageSource } from "./poc.js";

const failures: string[] = [];

/**
 * Find identifiers a generated page references but never imports or
 * declares (TS2304). Prop-shape drift is NOT covered: `app-data-table`
 * also passed a `page`/`pageCount` API that `Pagination` never had, which
 * is TS2322 and only a real typecheck would catch.
 * Checks JSX component tags (`<Foo`) and bare identifiers passed as prop
 * values (`prop={foo}`), both against the page's imports plus its hoisted
 * fixture declarations.
 * @param source - Generated page source
 * @returns Human-readable descriptions of each undefined reference
 */
function undefinedIdentifiers(source: string): string[] {
	const known = new Set<string>();
	for (const m of source.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from/g)) {
		for (const piece of m[1].split(",")) {
			const name = piece.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()?.trim();
			if (name) known.add(name);
		}
	}
	// Value bindings: plain declarations, destructured patterns, function
	// params and arrow params. Without the last two, `.map((c) => …)` reports
	// `c` as undefined — a false positive on legitimate code.
	for (const m of source.matchAll(/(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/g)) known.add(m[1]);
	for (const m of source.matchAll(/(?:const|let|var)\s*(\{[^}]*\}|\[[^\]]*\])/g)) {
		for (const piece of m[1].replace(/[{}[\]]/g, "").split(",")) {
			const bound = piece.split(":").pop()?.trim().replace(/=.*$/, "").trim();
			if (bound && /^[A-Za-z_$][\w$]*$/.test(bound)) known.add(bound);
		}
	}
	// Parenthesised arrow params. The list must be identifiers/commas/spaces
	// only: a looser `[^)]*` spans newlines and swallows an entire JSX block
	// starting from an earlier `(`, binding the wrong names.
	for (const m of source.matchAll(/\(\s*([A-Za-z_$][\w$]*(?:\s*,\s*[A-Za-z_$][\w$]*)*)\s*\)\s*=>/g)) {
		for (const piece of m[1].split(",")) {
			const bound = piece.trim();
			if (/^[A-Za-z_$][\w$]*$/.test(bound)) known.add(bound);
		}
	}
	for (const m of source.matchAll(/\b([A-Za-z_$][\w$]*)\s*=>/g)) known.add(m[1]);

	const problems: string[] = [];
	for (const m of source.matchAll(/<([A-Z][\w$]*)(\.?)/g)) {
		// `<React.Fragment>` resolves through the member expression, not the
		// bare name — skip it rather than reporting `React` as undefined.
		if (m[2] === ".") continue;
		if (!known.has(m[1])) problems.push(`component <${m[1]}>`);
	}
	// `prop={ident}` where ident is a bare reference (not a call, member
	// access, literal, or arrow function).
	for (const m of source.matchAll(/=\{([a-z][A-Za-z0-9_$]*)\}/g)) {
		if (!known.has(m[1])) problems.push(`identifier {${m[1]}}`);
	}
	return [...new Set(problems)];
}

/**
 * Record a failed assertion.
 * @param name - Case label
 * @param detail - What was expected vs observed
 */
function fail(name: string, detail: string): void {
	failures.push(`${name}: ${detail}`);
}

const map = buildApplicationMap(
	"a SaaS site with a landing page and pricing page, plus an admin dashboard with a data table",
);
const poc = buildPocFiles(map);
const byPath = new Map(poc.files.map((f) => [f.path, f.content]));

// Routes: one per page-recipe screen; the data-table screen is install-only.
const routePaths = poc.routes.map((r) => r.route).sort();
if (JSON.stringify(routePaths) !== JSON.stringify(["/landing", "/pricing"])) {
	fail("routes", `expected /landing,/pricing — got ${routePaths.join(",")}`);
}
if (!poc.installOnlyScreens.includes("data-table-view")) {
	fail("installOnly", "expected data-table-view to be install-only");
}

// Scaffold files exist and package.json pins known-good versions.
for (const required of [
	"package.json",
	"tsconfig.json",
	"next.config.ts",
	"postcss.config.mjs",
	"hex.config.json",
	"hex.map.json",
	"README.md",
	"app/globals.css",
	"app/layout.tsx",
	"app/page.tsx",
]) {
	if (!byPath.has(required)) fail("scaffold", `missing ${required}`);
}
const packageJson = JSON.parse(byPath.get("package.json") ?? "{}") as {
	dependencies?: Record<string, string>;
};
if (packageJson.dependencies?.["@tanstack/react-table"] !== "^8.21.3") {
	fail(
		"versions",
		`@tanstack/react-table should pin ^8.21.3, got ${packageJson.dependencies?.["@tanstack/react-table"]}`,
	);
}
if (packageJson.dependencies?.["@dnd-kit/core"]?.startsWith("^") !== true) {
	fail("versions", "inline-ranged deps (@dnd-kit/core@^…) should carry their range");
}

// The landing route imports copied modules, not the monorepo barrel.
const landing = byPath.get("app/landing/page.tsx") ?? "";
if (!landing.includes('from "@/components/ui/marketing-hero"')) {
	fail("landing page", "expected import from @/components/ui/marketing-hero");
}
if (landing.includes("@hex-core/components")) {
	fail("landing page", "generated page must not import the @hex-core/components barrel");
}
if (!landing.includes("{/* hero:")) {
	fail("landing page", "expected section intent comments");
}

// Every component the pages import was copied, imports rewritten.
for (const slug of ["marketing-hero", "button", "badge"]) {
	if (!byPath.has(`components/ui/${slug}.tsx`)) fail("copied components", `missing components/ui/${slug}.tsx`);
}
if (!byPath.has("lib/utils.ts")) fail("copied components", "missing lib/utils.ts");
const hero = byPath.get("components/ui/marketing-hero.tsx") ?? "";
if (/from\s+["']\.\.\//.test(hero)) {
	fail("import rewrite", "copied component still has relative registry imports");
}

// Determinism: same map ⇒ same bytes.
const again = buildPocFiles(map);
if (JSON.stringify(again.files) !== JSON.stringify(poc.files)) {
	fail("determinism", "two builds of the same map produced different files");
}

// Page generation errors name the offending block and the fix.
const screen = map.screens.find((s) => s.source === "page-recipe");
if (screen) {
	try {
		generatePageSource(screen, {
			loadItem: (slug) => ({
				name: slug,
				displayName: slug,
				description: "",
				category: "block",
				version: "0.1.0",
				framework: "react",
				props: [],
				variants: [],
				slots: [],
				files: [],
				dependencies: {},
				tokensUsed: [],
				examples: [],
				ai: {},
				tags: [],
			}),
		});
		fail("error path", "expected generatePageSource to throw for example-less blocks");
	} catch (err) {
		const message = (err as Error).message;
		if (!message.includes(screen.sections?.[0]?.block ?? "")) {
			fail("error path", `error should name the block — got: ${message}`);
		}
	}
}

// ── Hostile-map hardening ──

/**
 * Minimal registry item with a given example code, for injected loaders.
 * @param slug - Item slug
 * @param code - Example source
 * @returns A structurally complete RegistryItem
 */
function fakeItem(slug: string, code: string) {
	return {
		name: slug,
		displayName: slug,
		description: "",
		category: "block",
		version: "0.1.0",
		framework: "react",
		props: [],
		variants: [],
		slots: [],
		files: [],
		dependencies: {},
		tokensUsed: [],
		examples: [{ title: "t", description: "d", code }],
		ai: {},
		tags: [],
	};
}

/**
 * A one-section page-recipe screen pointing at `fake-block`.
 * @param intent - Section intent text
 * @returns The screen
 */
function fakeScreen(intent: string) {
	return {
		id: "landing",
		name: "Landing",
		segment: "landing",
		source: "page-recipe" as const,
		recipe: "landing-page",
		sections: [{ id: "hero", block: "fake-block", intent, role: "primary" }],
		components: ["fake-block"],
		score: 1,
		confidence: "high" as const,
		matchReason: [],
	};
}

// A star-slash in map-supplied intent must not terminate the JSX comment.
{
	const page = generatePageSource(fakeScreen("evil */ <Hack /> {/*"), {
		loadItem: () => fakeItem("fake-block", '<div className="ok" />'),
	});
	if (page.source.includes("*/ <Hack />")) {
		fail("comment injection", "intent text escaped its JSX comment");
	}
}

// Side-effect + subpath imports pass through; the dep records the package name.
{
	const page = generatePageSource(fakeScreen("hero"), {
		loadItem: () =>
			fakeItem(
				"fake-block",
				'import "reactflow/dist/style.css";\nimport { ReactFlow } from "reactflow";\n\n<ReactFlow />',
			),
	});
	if (!page.source.includes('import "reactflow/dist/style.css";')) {
		fail("side-effect import", "expected the css import to pass through verbatim");
	}
	if (JSON.stringify(page.externalPackages) !== JSON.stringify(["reactflow"])) {
		fail("side-effect import", `expected externalPackages [reactflow], got ${JSON.stringify(page.externalPackages)}`);
	}
}

// Unsupported barrel import shapes fail loudly, naming the block.
try {
	generatePageSource(fakeScreen("hero"), {
		loadItem: () => fakeItem("fake-block", 'import Hex from "@hex-core/components";\n\n<Hex />'),
	});
	fail("unsupported import", "expected default barrel import to throw");
} catch (err) {
	if (!(err as Error).message.includes("fake-block")) {
		fail("unsupported import", "error should name the block");
	}
}

// A multi-line template literal must survive codegen byte-exact: neither
// the JSX indenter nor the fixture hoister may inject whitespace into the
// string's runtime value (a leading tab makes a markdown line a code block).
{
	const page = generatePageSource(fakeScreen("hero"), {
		loadItem: () =>
			fakeItem("fake-block", "const md = `\n<b>bold</b>\n  two-space-indent\n`;\n\n<div>{md}</div>"),
	});
	if (!page.source.includes("\n<b>bold</b>\n  two-space-indent\n`")) {
		fail("template literal", "codegen rewrote whitespace inside a template literal");
	}
}

// Fixture declarations of every binding form are detected for collision.
for (const [label, fixture] of [
	["destructured", "const { rows } = data;"],
	["let", "let count = 3;"],
	["function", "function fmt(x) { return x; }"],
] as const) {
	const twoSections = {
		...fakeScreen("hero"),
		sections: [
			{ id: "a", block: "block-a", intent: "a", role: "primary" },
			{ id: "b", block: "block-b", intent: "b", role: "primary" },
		],
	};
	try {
		generatePageSource(twoSections, {
			loadItem: (slug) => fakeItem(slug, `${fixture}\n\n<div />`),
		});
		fail(`fixture collision (${label})`, "expected a redeclaration error across sections");
	} catch (err) {
		if (!(err as Error).message.includes("redeclares")) {
			fail(`fixture collision (${label})`, `wrong error: ${(err as Error).message.slice(0, 80)}`);
		}
	}
}

// An example with no top-level JSX fails loudly instead of emitting a page
// that renders its own source as text.
try {
	generatePageSource(fakeScreen("hero"), {
		loadItem: () => fakeItem("fake-block", "const rows = [1, 2, 3];"),
	});
	fail("no-JSX body", "expected a throw for an example with no JSX");
} catch (err) {
	if (!(err as Error).message.includes("no top-level JSX")) {
		fail("no-JSX body", `wrong error: ${(err as Error).message.slice(0, 80)}`);
	}
}

// mapSchema rejects path-traversal ids — the CLI's file writes depend on it.
{
	const tampered = JSON.parse(stableStringifyMap(map)) as { screens: Array<{ id: string }> };
	tampered.screens[0].id = "../../evil";
	if (mapSchema.safeParse(tampered).success) {
		fail("traversal id", "mapSchema accepted a screen id containing ../");
	}
}


// ── Every composable item must generate a clean page section ──
// Originally scoped to page recipes, this guard could not see `timeline` —
// it is not a section of any page recipe, so the defect it was meant to
// catch stayed green. Scope by *composability* instead: every block (the
// page-section family — all 8 page recipes compose only blocks) plus any
// item whose example is import-led, i.e. claims to be usable as a section.
//
// Items whose example is a bare JSX snippet with no imports are docs
// fragments, not page sections; composing one silently emits an unimported
// component. That is a real latent gap (~40 recipe-referenced items) but a
// separate cleanup — see the changeset.
//
// NOT_COMPOSABLE items are excluded with a recorded reason per group, not
// as a blanket "client boundary" claim — several are simply bare-JSX docs
// snippets. A membership assertion below stops dead entries accumulating.
const NOT_COMPOSABLE = new Set([
	// Examples that need React state or pass functions. Generated pages are
	// Server Components that also export `metadata`, so they cannot be
	// "use client" — these can never be page sections as written.
	"calendar", "combobox", "command", "date-picker", "dropzone", "file-tree",
	"multi-combobox", "time-picker", "form",
	// Bare-JSX examples with no imports. Already skipped by the composable
	// filter below; listed so the reason is recorded rather than implicit.
	"kanban", "resizable", "sonner",
]);

{
	const registry = loadRegistry();
	// A misspelled or removed slug in the exclusion set silently widens it.
	for (const name of NOT_COMPOSABLE) {
		if (!registry.items.some((i) => i.name === name)) {
			fail("catalog guard", `NOT_COMPOSABLE lists "${name}", which is not a registry item`);
		}
	}
	// Police the exclusion set: any composable example that calls a React
	// hook needs a client boundary and must be listed. Answers "what tells
	// me when someone adds a stateful component?" — this does.
	for (const item of registry.items) {
		const full = loadRegistryItem(item.name);
		const raw = full?.examples?.[0]?.code ?? "";
		if (!full?.files.length) continue;
		if (!(item.category === "block" || raw.trimStart().startsWith("import"))) continue;
		const code = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
		if (/\buse[A-Z]\w*\s*[<(]/.test(code) && !NOT_COMPOSABLE.has(item.name)) {
			fail("catalog guard", `"${item.name}" example calls a React hook but is not in NOT_COMPOSABLE`);
		}
	}
	let checked = 0;
	for (const item of registry.items) {
		if (NOT_COMPOSABLE.has(item.name)) continue;
		const full = loadRegistryItem(item.name);
		const example = full?.examples?.[0]?.code ?? "";
		// npm-backed items (motion primitives, AI-kit hooks) ship no source to
		// copy, so they can never be a page section regardless of example shape.
		if ((full?.files.length ?? 0) === 0) continue;
		const composable = item.category === "block" || example.trimStart().startsWith("import");
		if (!composable) continue;

		const probe = {
			id: "probe", name: item.name, segment: item.name,
			source: "page-recipe" as const, recipe: "landing-page",
			sections: [{ id: "probe", block: item.name, intent: item.name, role: "primary" }],
			components: [item.name], score: 0, confidence: "high" as const, matchReason: [],
		};
		let page: { source: string };
		try {
			page = generatePageSource(probe);
		} catch (err) {
			// Items that genuinely cannot be sections are already excluded
			// above, so within this set a throw IS the defect — degrading
			// loudly is better than emitting broken code, but it still means
			// the item can't be composed. Treating a "Catalog defect:" throw
			// as acceptable is what let `timeline`'s wrong example shape sit
			// green while the screen using it was silently skipped.
			const detail = err instanceof Error ? err.message : String(err);
			fail(`catalog guard (${item.name})`, `cannot generate a section: ${detail.slice(0, 140)}`);
			continue;
		}
		checked += 1;
		for (const problem of undefinedIdentifiers(page.source)) {
			fail(`catalog guard (${item.name})`, `generated route uses undefined ${problem}`);
		}
	}
	// High-water mark, not a loose floor: an example that loses its import
	// line silently leaves the composable set — the same way `timeline` stayed
	// green. Bump deliberately when coverage grows.
	const EXPECTED_COVERAGE = 48;
	if (checked < EXPECTED_COVERAGE) {
		fail("catalog guard", `generated ${checked} routes, expected >= ${EXPECTED_COVERAGE} — coverage regressed`);
	}
}

// ── _shared export routing (TS2305, invisible to undefinedIdentifiers) ──
// A wrong-module import is still *an* import, so the name lands in `known`
// and the guard above reports nothing. Before the exportPaths fix this
// emitted `mockAuthAdapter` from the item's main module, which does not
// export it. Pin the resolved module directly.
{
	const authProbe = {
		id: "auth", name: "auth", segment: "auth",
		source: "page-recipe" as const, recipe: "landing-page",
		sections: [{ id: "auth", block: "auth-verify-otp", intent: "auth", role: "primary" }],
		components: ["auth-verify-otp"], score: 0, confidence: "high" as const, matchReason: [],
	};
	const authPage = generatePageSource(authProbe);
	if (!authPage.source.includes('from "@/components/_shared/auth-adapter"')) {
		fail("shared export routing", "mockAuthAdapter must import from @/components/_shared/auth-adapter");
	}
	if (authPage.source.includes('mockAuthAdapter } from "@/components/ui/')) {
		fail("shared export routing", "mockAuthAdapter is imported from the item's main module, which does not export it");
	}
	if (!authPage.componentSlugs.includes("auth-verify-otp")) {
		fail("shared export routing", "owning slug dropped — the _shared file would not be copied");
	}
}

if (failures.length > 0) {
	console.error(`poc: ${failures.length} regression(s)`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
}

console.error("poc: all cases passed");
