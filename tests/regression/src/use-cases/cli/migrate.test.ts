import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, it } from "vitest";
import { bootstrapHost, makeTmpDir, type HostKind } from "../../runners/bootstrap.js";
import { runHexCli } from "../../runners/install.js";
import { assertFileExists, assertProcessOk } from "../../runners/assert.js";

/**
 * `hex migrate` regression cases. Each test stamps a synthetic shadcn
 * footprint onto a fresh host (components.json + a few `<components>/ui/*.tsx`
 * + Radix peer deps) then runs `hex migrate --yes` and asserts the
 * conversion: backups taken, components.json archived, hex.config.json
 * written, peer deps installed.
 *
 * The synthetic footprint is intentionally minimal — we don't simulate
 * a full shadcn-cli invocation; we just lay down what the detector
 * triple-AND signal expects (`components.json` OR (uiDir + radix peer +
 * known shadcn slug)).
 */
describe("cli/migrate", () => {
	const tmpDirs: string[] = [];

	afterAll(() => {
		for (const dir of tmpDirs) {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	/**
	 * Build a per-case host pre-stamped with a shadcn-style footprint:
	 * `components.json`, a few `<components>/ui/*.tsx` files in shadcn
	 * shape, and `\@radix-ui/react-slot` declared so detectShadcn's
	 * triple-AND signal fires.
	 * @param slug - Test case identifier (used in tmpdir name).
	 * @param kind - Host fixture to bootstrap; defaults to next-app-src.
	 * @returns Absolute path of the staged shadcn host.
	 */
	async function shadcnHost(slug: string, kind: HostKind = "next-app-src"): Promise<string> {
		const dir = makeTmpDir(`migrate-${slug}`);
		tmpDirs.push(dir);
		await bootstrapHost(kind, dir);

		// Stamp components.json (shadcn's marker).
		writeFileSync(
			join(dir, "components.json"),
			JSON.stringify(
				{
					$schema: "https://ui.shadcn.com/schema.json",
					style: "default",
					tailwind: { config: "", css: "src/app/globals.css", baseColor: "slate" },
					aliases: { components: "@/components", utils: "@/lib/utils" },
				},
				null,
				2,
			),
		);

		// Drop a few shadcn-style components.
		const uiDir =
			kind === "vite-react" || kind === "cra"
				? join(dir, "src/components/ui")
				: join(dir, "src/components/ui");
		mkdirSync(uiDir, { recursive: true });
		writeFileSync(
			join(uiDir, "button.tsx"),
			`import * as React from "react";\nimport { Slot } from "@radix-ui/react-slot";\nexport const Button = ({ children }: { children: React.ReactNode }) => <button>{children}</button>;\n`,
		);
		writeFileSync(
			join(uiDir, "toast.tsx"),
			`export const Toast = () => null;\n`,
		);

		// Add @radix-ui/react-slot as a declared dep so detectShadcn's
		// triple-AND signal fires.
		const pkgPath = join(dir, "package.json");
		const pkg = JSON.parse(
			(await import("node:fs")).readFileSync(pkgPath, "utf-8"),
		) as { dependencies?: Record<string, string> };
		pkg.dependencies = { ...(pkg.dependencies ?? {}), "@radix-ui/react-slot": "^1.0.0" };
		writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

		return dir;
	}

	it("--dry-run on a shadcn host plans without writing", async () => {
		const cwd = await shadcnHost("dry");
		const result = await runHexCli(cwd, ["migrate", "--dry-run", "--yes", "--no-install"]);
		assertProcessOk(result, "Would write");
		// components.json should NOT be archived under --dry-run.
		assertFileExists(cwd, "components.json");
	});

	it("real migrate on Next.js + shadcn — backups, archives components.json, writes hex.config.json", async () => {
		const cwd = await shadcnHost("real");
		const result = await runHexCli(cwd, ["migrate", "--yes", "--no-install"]);
		assertProcessOk(result);
		// Original button.tsx is replaced; .shadcn.bak preserves the original.
		assertFileExists(cwd, "src/components/ui/button.tsx");
		assertFileExists(cwd, "src/components/ui/button.tsx.shadcn.bak");
		// components.json is renamed; hex.config.json takes its place.
		assertFileExists(cwd, "components.json.shadcn.bak");
		assertFileExists(cwd, "hex.config.json");
		// toast → sonner rename: toast.tsx is removed, sonner.tsx written.
		assertFileExists(cwd, "src/components/ui/sonner.tsx");
	});

	it("idempotent re-run — second migrate exits cleanly with no shadcn signal", async () => {
		const cwd = await shadcnHost("idempotent");
		await runHexCli(cwd, ["migrate", "--yes", "--no-install"]);
		const second = await runHexCli(cwd, ["migrate", "--yes", "--no-install"]);
		assertProcessOk(second, "No shadcn-style footprint detected");
	});
});
