import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type Check, runDoctor } from "../src/commands/doctor.js";
import { _resetAliasCacheForTests } from "../src/lib/resolve-alias.js";

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-doctor-test-"));
	_resetAliasCacheForTests();
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
	_resetAliasCacheForTests();
});

function findCheck(checks: Check[], pattern: RegExp): Check | undefined {
	return checks.find((c) => pattern.test(c.name));
}

function writePkg(pkg: Record<string, unknown>) {
	fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(pkg, null, 2));
}

function writeFile(rel: string, content: string) {
	const p = path.join(tmpDir, rel);
	fs.mkdirSync(path.dirname(p), { recursive: true });
	fs.writeFileSync(p, content);
}

describe("doctor", () => {
	it("reports a fully missing project as failures across the board", async () => {
		writePkg({ name: "scratch" });
		const checks = await runDoctor(tmpDir);
		expect(findCheck(checks, /hex\.config\.json/)?.status).toBe("fail");
		expect(findCheck(checks, /tailwindcss/)?.status).toBe("fail");
		expect(findCheck(checks, /globals\.css/)?.status).toBe("fail");
	});

	it("passes a fully-configured v4 project", async () => {
		writePkg({
			dependencies: {
				tailwindcss: "^4",
				clsx: "^2",
				"tailwind-merge": "^2",
				"class-variance-authority": "^0.7",
				"tw-animate-css": "^1",
			},
		});
		writeFile("hex.config.json", JSON.stringify({ aliases: { lib: "@/lib", components: "@/components" } }));
		writeFile("app/globals.css", `@import "tailwindcss";\n@theme { --color-background: hsl(0 0% 100%); }\n`);
		writeFile("lib/utils.ts", `export const cn = (...x: unknown[]) => x.join(" ");`);

		const checks = await runDoctor(tmpDir);
		expect(findCheck(checks, /hex\.config\.json/)?.status).toBe("pass");
		expect(findCheck(checks, /tailwindcss v4/)?.status).toBe("pass");
		expect(findCheck(checks, /globals\.css/)?.status).toBe("pass");
		expect(findCheck(checks, /^clsx$/)?.status).toBe("pass");
		expect(findCheck(checks, /^tw-animate-css$/)?.status).toBe("pass");
		expect(findCheck(checks, /utils$/)?.status).toBe("pass");
	});

	it("flags a v4 project running v3 globals.css as a fail", async () => {
		writePkg({ dependencies: { tailwindcss: "^4" } });
		writeFile("hex.config.json", "{}");
		writeFile("app/globals.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");
		const checks = await runDoctor(tmpDir);
		const cssCheck = findCheck(checks, /globals\.css/);
		expect(cssCheck?.status).toBe("fail");
		expect(cssCheck?.hint).toMatch(/v3 syntax but tailwindcss is v4/);
	});

	it("flags a v3 project running v4 globals.css as a fail", async () => {
		writePkg({ dependencies: { tailwindcss: "^3" } });
		writeFile("hex.config.json", "{}");
		writeFile("app/globals.css", `@import "tailwindcss";\n@theme { }\n`);
		const checks = await runDoctor(tmpDir);
		const cssCheck = findCheck(checks, /globals\.css/);
		expect(cssCheck?.status).toBe("fail");
		expect(cssCheck?.hint).toMatch(/v4 syntax but tailwindcss is v3/);
	});

	it("v3 project: reports missing tailwind.config.ts as fail", async () => {
		writePkg({ dependencies: { tailwindcss: "^3" } });
		writeFile("hex.config.json", "{}");
		writeFile("app/globals.css", "@tailwind base;\n");
		const checks = await runDoctor(tmpDir);
		expect(findCheck(checks, /tailwind\.config\.ts/)?.status).toBe("fail");
	});

	it("v3 project: warns when tailwind.config.ts lacks the animate plugin", async () => {
		writePkg({ dependencies: { tailwindcss: "^3" } });
		writeFile("hex.config.json", "{}");
		writeFile("app/globals.css", "@tailwind base;\n");
		writeFile("tailwind.config.ts", "export default { plugins: [] }");
		const checks = await runDoctor(tmpDir);
		const cfg = findCheck(checks, /tailwind\.config\.ts/);
		expect(cfg?.status).toBe("warn");
		expect(cfg?.hint).toMatch(/tailwindcss-animate/);
	});

	it("flags missing radix peer deps inferred from installed component sources", async () => {
		writePkg({
			dependencies: {
				tailwindcss: "^4",
				clsx: "^2",
				"tailwind-merge": "^2",
				"class-variance-authority": "^0.7",
				"tw-animate-css": "^1",
				// Note: @radix-ui/react-dialog NOT installed
			},
		});
		writeFile("hex.config.json", "{}");
		writeFile("app/globals.css", `@import "tailwindcss";\n`);
		writeFile(
			"components/ui/dialog.tsx",
			`import * as DialogPrimitive from "@radix-ui/react-dialog";\nexport const x = DialogPrimitive;\n`,
		);
		const checks = await runDoctor(tmpDir);
		expect(findCheck(checks, /@radix-ui\/react-dialog/)?.status).toBe("fail");
	});

	it("warns when components live at <cwd>/components but src/ layout exists", async () => {
		writePkg({
			dependencies: {
				tailwindcss: "^4",
				clsx: "^2",
				"tailwind-merge": "^2",
				"class-variance-authority": "^0.7",
				"tw-animate-css": "^1",
			},
		});
		writeFile("hex.config.json", JSON.stringify({ aliases: { lib: "@/lib", components: "@/components" } }));
		writeFile("src/app/globals.css", `@import "tailwindcss";\n`);
		// Components ended up in the wrong place — at <cwd>/components instead of src/components.
		writeFile("components/ui/button.tsx", "export const x = 1;");

		const checks = await runDoctor(tmpDir);
		const drift = checks.find((c) => /aliases match/.test(c.name));
		expect(drift?.status).toBe("warn");
		expect(drift?.hint).toMatch(/mv components\/ui src\/components\/ui/);
	});

	it("passes the alias-consistency check when layout matches the resolved alias", async () => {
		writePkg({
			dependencies: {
				tailwindcss: "^4",
				clsx: "^2",
				"tailwind-merge": "^2",
				"class-variance-authority": "^0.7",
				"tw-animate-css": "^1",
			},
		});
		writeFile("hex.config.json", JSON.stringify({ aliases: { lib: "@/lib", components: "@/components" } }));
		writeFile("src/app/globals.css", `@import "tailwindcss";\n`);
		writeFile("src/components/ui/button.tsx", "export const x = 1;");

		const checks = await runDoctor(tmpDir);
		const drift = checks.find((c) => /aliases match/.test(c.name));
		expect(drift?.status).toBe("pass");
	});

	it("detects radix deps from src/components/ui too (--src-dir layout)", async () => {
		writePkg({
			dependencies: {
				tailwindcss: "^4",
				"@radix-ui/react-popover": "^1",
				clsx: "^2",
				"tailwind-merge": "^2",
				"class-variance-authority": "^0.7",
				"tw-animate-css": "^1",
			},
		});
		writeFile("hex.config.json", "{}");
		writeFile("app/globals.css", `@import "tailwindcss";\n`);
		writeFile(
			"src/components/ui/popover.tsx",
			`import * as PopoverPrimitive from "@radix-ui/react-popover";\n`,
		);
		const checks = await runDoctor(tmpDir);
		expect(findCheck(checks, /@radix-ui\/react-popover/)?.status).toBe("pass");
	});
});

describe("doctor --layout", () => {
	function v4Pkg(): void {
		writePkg({
			dependencies: {
				tailwindcss: "^4",
				clsx: "^2",
				"tailwind-merge": "^2",
				"class-variance-authority": "^0.7",
				"tw-animate-css": "^1",
			},
		});
		writeFile("hex.config.json", "{}");
		writeFile("app/globals.css", `@import "tailwindcss";\n`);
	}

	it("is silent (no layout findings) when --layout is not passed", async () => {
		v4Pkg();
		writeFile(
			"src/app/page.tsx",
			"export default function Page(){return <div className='space-y-8'><p>a</p><p className='space-y-8'>b</p><p className='space-y-8'>c</p></div>}",
		);
		const checks = await runDoctor(tmpDir);
		expect(checks.find((c) => c.status === "info" && /space-y/.test(c.name))).toBeUndefined();
	});

	it("flags installed-but-unused components when no source imports them", async () => {
		v4Pkg();
		writeFile("components/ui/card.tsx", "export function Card(){return null}");
		writeFile("src/app/page.tsx", "export default function Page(){return <div/>}");
		const checks = await runDoctor(tmpDir, { layout: true });
		const unused = checks.find((c) => c.status === "info" && /installed but unused: card/.test(c.name));
		expect(unused).toBeDefined();
		expect(unused?.hint).toMatch(/<Card>/);
	});

	it("does NOT flag installed-but-unused when a JSX usage is found", async () => {
		v4Pkg();
		writeFile("components/ui/card.tsx", "export function Card(){return null}");
		writeFile("src/app/page.tsx", "import {Card} from '@/components/ui/card';export default function Page(){return <Card/>}");
		const checks = await runDoctor(tmpDir, { layout: true });
		expect(checks.find((c) => /installed but unused: card/.test(c.name))).toBeUndefined();
	});

	it("emits a hand-rolled finding for space-y-* repeated 3+ times in a file", async () => {
		v4Pkg();
		writeFile(
			"src/app/page.tsx",
			`export default function Page(){\n  return <div className="space-y-8"><p className="space-y-4"/><p className="space-y-2"/></div>\n}`,
		);
		const checks = await runDoctor(tmpDir, { layout: true });
		const stack = checks.find((c) => c.status === "info" && /space-y/.test(c.name));
		expect(stack).toBeDefined();
		expect(stack?.hint).toMatch(/<Stack/);
	});

	it("emits a hand-rolled finding for breakpoint grid-cols-* variants", async () => {
		v4Pkg();
		writeFile(
			"src/app/page.tsx",
			`export default function Page(){return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"/>}`,
		);
		const checks = await runDoctor(tmpDir, { layout: true });
		const grid = checks.find((c) => c.status === "info" && /grid/.test(c.name));
		expect(grid).toBeDefined();
		expect(grid?.hint).toMatch(/<Grid/);
	});

	it("emits a hand-rolled finding for dashed empty-state divs", async () => {
		v4Pkg();
		writeFile(
			"src/app/empty.tsx",
			`export default function E(){return <div className="border-dashed flex flex-col"/>}`,
		);
		const checks = await runDoctor(tmpDir, { layout: true });
		const empty = checks.find((c) => c.status === "info" && /dashed empty/.test(c.name));
		expect(empty).toBeDefined();
		expect(empty?.hint).toMatch(/<Empty>/);
	});
});

describe("doctor — catalog graph", () => {
	it("passes when the bundled registry ships a parseable graph.json", async () => {
		writePkg({ name: "scratch" });
		const checks = await runDoctor(tmpDir);
		expect(findCheck(checks, /catalog graph/)?.status).toBe("pass");
	});
});
