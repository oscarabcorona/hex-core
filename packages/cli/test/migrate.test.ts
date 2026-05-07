import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { migrateProject } from "../src/commands/migrate.js";
import { _resetAliasCacheForTests } from "../src/lib/resolve-alias.js";

let tmpDir: string;
let originalCwd: string;
let logSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;
let exitSpy: ReturnType<typeof vi.spyOn>;

const SHADCN_BUTTON = `import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
// shadcn button — pre-migration content marker
export const Button = ({ children }: { children: React.ReactNode }) => <button>{children}</button>;
`;

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-migrate-"));
	process.chdir(tmpDir);
	_resetAliasCacheForTests();
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
	errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null | undefined) => {
		throw new Error(`process.exit(${code ?? 0})`);
	}) as never);
});

afterEach(() => {
	process.chdir(originalCwd);
	fs.rmSync(tmpDir, { recursive: true, force: true });
	_resetAliasCacheForTests();
	logSpy.mockRestore();
	warnSpy.mockRestore();
	errSpy.mockRestore();
	exitSpy.mockRestore();
});

function writeFile(rel: string, content = "") {
	const abs = path.join(tmpDir, rel);
	fs.mkdirSync(path.dirname(abs), { recursive: true });
	fs.writeFileSync(abs, content);
}

/** Build a minimal but realistic Next.js App Router + shadcn fixture. */
function buildShadcnFixture(opts: { srcLayout?: boolean; slugs?: string[] } = {}) {
	const srcLayout = opts.srcLayout ?? true;
	const slugs = opts.slugs ?? ["button", "toast", "carousel"];
	const root = srcLayout ? "src" : ".";
	writeFile(
		"package.json",
		JSON.stringify(
			{
				name: "scratch",
				dependencies: {
					next: "^16.0.0",
					react: "^19.0.0",
					"react-dom": "^19.0.0",
					tailwindcss: "^4.0.0",
					"@radix-ui/react-slot": "^1.0.0",
				},
			},
			null,
			2,
		),
	);
	writeFile(
		"tsconfig.json",
		JSON.stringify({ compilerOptions: { paths: { "@/*": [srcLayout ? "./src/*" : "./*"] } } }, null, 2),
	);
	writeFile(`${root === "." ? "app" : `${root}/app`}/layout.tsx`, "");
	writeFile("components.json", JSON.stringify({ aliases: { components: "@/components", utils: "@/lib/utils" } }));
	for (const slug of slugs) {
		writeFile(`${root === "." ? "components" : `${root}/components`}/ui/${slug}.tsx`, SHADCN_BUTTON);
	}
}

const DEFAULT_OPTIONS = {
	yes: true,
	dryRun: false,
	backup: true,
	install: false,
	from: undefined,
	theme: "preserve" as const,
	only: [],
};

describe("migrate", () => {
	it("exits cleanly when no shadcn footprint is detected", async () => {
		writeFile("package.json", JSON.stringify({ name: "scratch", dependencies: { next: "^16.0.0", tailwindcss: "^4" } }));
		writeFile("src/app/layout.tsx", "");
		await migrateProject(DEFAULT_OPTIONS);
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toMatch(/No shadcn-style footprint detected/);
	});

	it("aborts when tailwindcss is missing", async () => {
		writeFile("package.json", JSON.stringify({ name: "scratch", dependencies: { next: "^16.0.0", "@radix-ui/react-slot": "^1.0.0" } }));
		writeFile("components.json", "{}");
		await expect(migrateProject(DEFAULT_OPTIONS)).rejects.toThrow(/process\.exit\(1\)/);
		const stderr = errSpy.mock.calls.flat().join("\n");
		expect(stderr).toMatch(/Tailwind CSS is not installed/);
	});

	it("aborts when package.json is missing", async () => {
		await expect(migrateProject(DEFAULT_OPTIONS)).rejects.toThrow(/process\.exit\(1\)/);
	});

	it("dry-run plans without writing", async () => {
		buildShadcnFixture();
		const beforeContent = fs.readFileSync(path.join(tmpDir, "src/components/ui/button.tsx"), "utf-8");
		await migrateProject({ ...DEFAULT_OPTIONS, dryRun: true });
		const afterContent = fs.readFileSync(path.join(tmpDir, "src/components/ui/button.tsx"), "utf-8");
		expect(afterContent).toBe(beforeContent);
		expect(fs.existsSync(path.join(tmpDir, "src/components/ui/button.tsx.shadcn.bak"))).toBe(false);
		expect(fs.existsSync(path.join(tmpDir, "components.json"))).toBe(true);
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toMatch(/Would write:/);
	});

	it("real run writes Hex Core source + creates .shadcn.bak", async () => {
		buildShadcnFixture({ slugs: ["button"] });
		await migrateProject({ ...DEFAULT_OPTIONS });
		const buttonAfter = fs.readFileSync(path.join(tmpDir, "src/components/ui/button.tsx"), "utf-8");
		expect(buttonAfter).not.toContain("pre-migration content marker");
		// Hex Core's button has a CVA variants split.
		expect(fs.existsSync(path.join(tmpDir, "src/components/ui/button-variants.tsx"))).toBe(true);
		expect(fs.existsSync(path.join(tmpDir, "src/components/ui/button.tsx.shadcn.bak"))).toBe(true);
		const bakContent = fs.readFileSync(path.join(tmpDir, "src/components/ui/button.tsx.shadcn.bak"), "utf-8");
		expect(bakContent).toContain("pre-migration content marker");
	});

	it("renames toast → sonner and reports the follow-up Toaster mount hint", async () => {
		buildShadcnFixture({ slugs: ["toast"] });
		await migrateProject({ ...DEFAULT_OPTIONS });
		// Hex Core's sonner registry item ships components/ui/sonner.tsx.
		expect(fs.existsSync(path.join(tmpDir, "src/components/ui/sonner.tsx"))).toBe(true);
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toMatch(/toast → sonner/);
		expect(stdout).toMatch(/Mount <Toaster \/> in src\/app\/layout\.tsx/);
	});

	it("skips carousel with the no-mapping reason", async () => {
		buildShadcnFixture({ slugs: ["carousel"] });
		await migrateProject({ ...DEFAULT_OPTIONS });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toMatch(/carousel — no Hex Core equivalent/);
		// No backup written because nothing was overwritten.
		expect(fs.existsSync(path.join(tmpDir, "src/components/ui/carousel.tsx.shadcn.bak"))).toBe(false);
	});

	it("--no-backup suppresses the .shadcn.bak", async () => {
		buildShadcnFixture({ slugs: ["button"] });
		await migrateProject({ ...DEFAULT_OPTIONS, backup: false });
		expect(fs.existsSync(path.join(tmpDir, "src/components/ui/button.tsx.shadcn.bak"))).toBe(false);
	});

	it("--only filters which slugs are migrated", async () => {
		buildShadcnFixture({ slugs: ["button", "input", "label"] });
		await migrateProject({ ...DEFAULT_OPTIONS, only: ["button"] });
		// Button replaced
		const button = fs.readFileSync(path.join(tmpDir, "src/components/ui/button.tsx"), "utf-8");
		expect(button).not.toContain("pre-migration content marker");
		// Input + label left alone
		const input = fs.readFileSync(path.join(tmpDir, "src/components/ui/input.tsx"), "utf-8");
		expect(input).toContain("pre-migration content marker");
	});

	it("renames components.json → components.json.shadcn.bak after a successful run", async () => {
		buildShadcnFixture({ slugs: ["button"] });
		await migrateProject({ ...DEFAULT_OPTIONS });
		expect(fs.existsSync(path.join(tmpDir, "components.json"))).toBe(false);
		expect(fs.existsSync(path.join(tmpDir, "components.json.shadcn.bak"))).toBe(true);
	});

	it("writes hex.config.json mirroring shadcn's aliases when none exists yet", async () => {
		buildShadcnFixture({ slugs: ["button"] });
		await migrateProject({ ...DEFAULT_OPTIONS });
		const hex = JSON.parse(fs.readFileSync(path.join(tmpDir, "hex.config.json"), "utf-8"));
		expect(hex.aliases.components).toBe("@/components");
		expect(hex.aliases.lib).toBe("@/lib");
	});

	it("does not overwrite an existing hex.config.json", async () => {
		buildShadcnFixture({ slugs: ["button"] });
		const customConfig = { framework: "react", aliases: { components: "@/ui", lib: "@/utils" } };
		writeFile("hex.config.json", JSON.stringify(customConfig));
		await migrateProject({ ...DEFAULT_OPTIONS });
		const hex = JSON.parse(fs.readFileSync(path.join(tmpDir, "hex.config.json"), "utf-8"));
		expect(hex.aliases.components).toBe("@/ui");
	});

	it("idempotent re-run exits cleanly with no shadcn signal after first migration", async () => {
		buildShadcnFixture({ slugs: ["button"] });
		await migrateProject({ ...DEFAULT_OPTIONS });
		logSpy.mockClear();
		await migrateProject({ ...DEFAULT_OPTIONS });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toMatch(/No shadcn-style footprint detected/);
	});

	it("--no-install prints the manual install line instead of running the PM", async () => {
		buildShadcnFixture({ slugs: ["button"] });
		await migrateProject({ ...DEFAULT_OPTIONS, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toMatch(/Skipping auto-install/);
		// One of the deps Hex Core's button declares
		expect(stdout).toMatch(/class-variance-authority/);
	});

	it("works for the no-src layout (Next.js without --src-dir)", async () => {
		buildShadcnFixture({ srcLayout: false, slugs: ["button"] });
		await migrateProject({ ...DEFAULT_OPTIONS });
		expect(fs.existsSync(path.join(tmpDir, "components/ui/button.tsx.shadcn.bak"))).toBe(true);
		const buttonAfter = fs.readFileSync(path.join(tmpDir, "components/ui/button.tsx"), "utf-8");
		expect(buttonAfter).not.toContain("pre-migration content marker");
	});

	it("--theme=replace rewrites the consumer's globals.css palette", async () => {
		buildShadcnFixture({ slugs: ["button"] });
		// Seed a globals.css with shadcn-style :root tokens. themeApply does
		// surgical replacement of the :root and .dark blocks.
		const initialCss = `@import "tailwindcss";\n\n:root {\n  --primary: 0 0% 0%;\n  --background: 0 0% 100%;\n}\n\n.dark {\n  --primary: 0 0% 100%;\n  --background: 0 0% 0%;\n}\n\n/* user custom rule, must survive */\n.my-marker { color: red; }\n`;
		writeFile("src/app/globals.css", initialCss);
		await migrateProject({ ...DEFAULT_OPTIONS, theme: "replace" });
		const after = fs.readFileSync(path.join(tmpDir, "src/app/globals.css"), "utf-8");
		// Hex Core's default :root has tokens like --background and --primary
		// at non-monochrome values; the marker shadcn line we seeded is gone.
		expect(after).not.toContain("--primary: 0 0% 0%;");
		// Custom rule preserved.
		expect(after).toContain(".my-marker { color: red; }");
	});

	it("without --yes (and not --dry-run), prints the confirm-prompt hint and does not write", async () => {
		buildShadcnFixture({ slugs: ["button"] });
		const before = fs.readFileSync(path.join(tmpDir, "src/components/ui/button.tsx"), "utf-8");
		await migrateProject({ ...DEFAULT_OPTIONS, yes: false });
		const after = fs.readFileSync(path.join(tmpDir, "src/components/ui/button.tsx"), "utf-8");
		expect(after).toBe(before);
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toMatch(/Re-run with .*--yes/);
	});
});
