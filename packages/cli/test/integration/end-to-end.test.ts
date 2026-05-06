/**
 * End-to-end CLI integration test.
 *
 * Spawns the built `dist/index.js` against a tmpdir scratch project to
 * exercise the full init → add flow the same way an npx consumer would.
 * Catches the regression class that pure unit tests miss: ESM resolution
 * issues, registry path resolution against the bundled tarball location,
 * stderr leaks, file-permission problems, and shape drift between
 * "calling addComponents() in the test" and "running the binary."
 *
 * Excluded from the default `vitest run` via vitest.config.ts. Run via:
 *   pnpm --filter @hex-core/cli test:integration
 *
 * Requires the CLI to be built first (`pnpm --filter @hex-core/cli build`).
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliBin = path.resolve(__dirname, "../../dist/index.js");

let tmpDir: string;

beforeAll(() => {
	if (!fs.existsSync(cliBin)) {
		throw new Error(
			`CLI not built at ${cliBin}. Run \`pnpm --filter @hex-core/cli build\` before this test.`,
		);
	}
});

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-cli-e2e-"));
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

function runCli(args: string[]) {
	const result = spawnSync("node", [cliBin, ...args], {
		cwd: tmpDir,
		encoding: "utf8",
		env: { ...process.env, NO_COLOR: "1" },
	});
	return {
		status: result.status,
		stdout: result.stdout ?? "",
		stderr: result.stderr ?? "",
	};
}

function writePkg(deps: Record<string, string>) {
	fs.writeFileSync(
		path.join(tmpDir, "package.json"),
		JSON.stringify({ name: "scratch", dependencies: deps }, null, 2),
	);
}

describe("CLI binary end-to-end (built dist/index.js)", () => {
	it("init in a Tailwind v4 project writes the bridge-pattern globals.css", () => {
		writePkg({ tailwindcss: "^4", react: "^19" });
		fs.mkdirSync(path.join(tmpDir, "app"));

		const init = runCli(["init", "--no-install"]);
		expect(init.status).toBe(0);
		expect(init.stderr).not.toContain("Could not find registry");
		expect(init.stdout).toContain("Detected Tailwind v4");

		const cssPath = path.join(tmpDir, "app/globals.css");
		expect(fs.existsSync(cssPath)).toBe(true);
		const css = fs.readFileSync(cssPath, "utf8");
		// Bridge pattern: raw triplets in :root, hsl(var(--…)) in @theme inline
		expect(css).toContain(`@import "tailwindcss";`);
		expect(css).toContain("@theme inline {");
		expect(css).toMatch(/--color-background: hsl\(var\(--background\)\);/);
		expect(css).toMatch(/:root \{[\s\S]+?--background: [\d.]+ [\d.]+% [\d.]+%;/);
	});

	it("add writes components with @/ alias imports and silently skips lib files on second run", () => {
		writePkg({ tailwindcss: "^4", react: "^19" });
		fs.mkdirSync(path.join(tmpDir, "app"));
		// Skip init for this test — add only needs hex.config to honor aliases.
		fs.writeFileSync(
			path.join(tmpDir, "hex.config.json"),
			JSON.stringify({ aliases: { components: "@/components", lib: "@/lib" } }),
		);

		const first = runCli(["add", "button", "--no-install", "--no-deps"]);
		expect(first.status).toBe(0);
		expect(first.stderr).not.toContain("Could not find registry");
		expect(first.stdout).toContain("Write: components/ui/button.tsx");
		expect(first.stdout).toContain("Write: lib/utils.ts");

		const buttonSrc = fs.readFileSync(path.join(tmpDir, "components/ui/button.tsx"), "utf8");
		expect(buttonSrc).toMatch(/from\s+["']@\/lib\/utils["']/);
		expect(buttonSrc).not.toMatch(/\.js["']/); // .js suffix dropped

		const second = runCli(["add", "input", "--no-install", "--no-deps"]);
		expect(second.status).toBe(0);
		// lib/utils.ts already exists — must NOT print Skip lib (silent skip)
		expect(second.stdout).not.toMatch(/Skip: lib\/utils\.ts/);
		expect(second.stdout).toContain("Write: components/ui/input.tsx");
	});

	it("hex theme edit mutates --primary in :root after init (the v4 bridge regression check)", () => {
		writePkg({ tailwindcss: "^4", react: "^19" });
		fs.mkdirSync(path.join(tmpDir, "app"));

		const init = runCli(["init", "--no-install"]);
		expect(init.status).toBe(0);

		const cssPath = path.join(tmpDir, "app/globals.css");
		const before = fs.readFileSync(cssPath, "utf8");
		// Confirm the raw triplet is there for the regex to find
		expect(before).toMatch(/:root \{[\s\S]+?--primary: [\d.]+ [\d.]+% [\d.]+%;/);

		const edit = runCli([
			"theme",
			"edit",
			"--file",
			"app/globals.css",
			"--token",
			"primary=999 99% 99%",
			"--mode",
			"both",
		]);
		expect(edit.status).toBe(0);

		const after = fs.readFileSync(cssPath, "utf8");
		expect(after).toMatch(/--primary:\s*999 99% 99%;/);
		// Both :root AND .dark must have updated
		const occurrences = (after.match(/--primary:\s*999 99% 99%;/g) ?? []).length;
		expect(occurrences).toBeGreaterThanOrEqual(2);
	});

	it("doctor reports all-pass on a fully-set-up v4 project", () => {
		writePkg({
			tailwindcss: "^4",
			react: "^19",
			clsx: "^2",
			"tailwind-merge": "^2",
			"class-variance-authority": "^0.7",
			"tw-animate-css": "^1",
		});
		fs.mkdirSync(path.join(tmpDir, "app"));

		runCli(["init", "--no-install"]);
		runCli(["add", "button", "--no-install", "--no-deps"]);

		// Manually add @radix-ui peers that button needs (since --no-install)
		const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf8"));
		pkg.dependencies["@radix-ui/react-slot"] = "^1";
		fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(pkg));

		const doctor = runCli(["doctor"]);
		expect(doctor.stdout).toContain("Hex Core doctor");
		expect(doctor.stdout).toContain("[ok]   tailwindcss v4");
		expect(doctor.stdout).toContain("[ok]   globals.css (v4 syntax)");
		// All checks should pass — exit 0
		expect(doctor.status).toBe(0);
	});

	it("list output includes the recipes section (Round-2 fix D)", () => {
		const list = runCli(["list"]);
		expect(list.status).toBe(0);
		expect(list.stdout).toContain("Recipes (spec-driven blueprints)");
		expect(list.stdout).toContain("auth-form");
		expect(list.stdout).toContain("Try one: hex recipe add");
	});

	it("hex add sonner prints the Toaster mount reminder (Round-2 fix F)", () => {
		writePkg({ tailwindcss: "^4", react: "^19" });
		fs.writeFileSync(
			path.join(tmpDir, "hex.config.json"),
			JSON.stringify({ aliases: { components: "@/components", lib: "@/lib" } }),
		);
		const add = runCli(["add", "sonner", "--no-install", "--no-deps"]);
		expect(add.status).toBe(0);
		expect(add.stdout).toContain("Next steps:");
		expect(add.stdout).toContain("<Toaster />");
		expect(add.stdout).toContain("@/components/ui/sonner");
	});
});
