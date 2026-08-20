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
import { buildPocFiles, generatePageSource } from "./poc.js";

const failures: string[] = [];

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

if (failures.length > 0) {
	console.error(`poc: ${failures.length} regression(s)`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
}

console.error("poc: all cases passed");
