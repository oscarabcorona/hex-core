/**
 * Fetch the getdesign npm package and vendor its `templates/` directory
 * (71 brand DESIGN.md briefs + manifest.json) into
 * `.cache/getdesign-templates/`. The companion `import-voltagent.ts`
 * script reads from that directory.
 *
 * Why this lives in a script (not as an `npm install` step):
 *   - The briefs are only consumed at *generation* time (when authors
 *     run `pnpm import:themes`); shipping them as a runtime dep would
 *     force every consumer to download ~1.5MB of markdown they'll
 *     never read.
 *   - The vendored copy is gitignored so the repo doesn't carry a
 *     duplicate of the upstream content. Reproducibility comes from
 *     re-running this script with the same getdesign version.
 *
 * Usage:
 *   pnpm import:themes:fetch              # latest published version
 *   pnpm import:themes:fetch -- 0.6.10    # pinned version
 */
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(ROOT, ".cache");
const TARGET_DIR = path.join(CACHE_DIR, "getdesign-templates");
const PKG_DIR = path.join(CACHE_DIR, ".getdesign-pkg");

function main(): void {
	const version = process.argv[2] ?? "latest";
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	fs.rmSync(TARGET_DIR, { recursive: true, force: true });
	fs.rmSync(PKG_DIR, { recursive: true, force: true });
	fs.mkdirSync(PKG_DIR, { recursive: true });

	console.log(`Fetching getdesign@${version} via npm pack…`);
	const tarball = execSync(`npm pack getdesign@${version} --pack-destination "${PKG_DIR}" --silent`, {
		encoding: "utf8",
	}).trim();
	const tarballPath = path.join(PKG_DIR, tarball);
	if (!fs.existsSync(tarballPath)) {
		throw new Error(`npm pack reported ${tarball} but file is missing at ${tarballPath}`);
	}

	console.log(`Extracting templates/ from ${tarball}…`);
	// `--strip-components 2` so `package/templates/<file>.md` lands as
	// `<file>.md` in the target directory, not nested.
	fs.mkdirSync(TARGET_DIR, { recursive: true });
	execSync(
		`tar -xzf "${tarballPath}" -C "${TARGET_DIR}" --strip-components=2 package/templates`,
		{ stdio: "inherit" },
	);

	const manifest = path.join(TARGET_DIR, "manifest.json");
	if (!fs.existsSync(manifest)) {
		throw new Error(
			`Extracted templates but manifest.json is missing at ${manifest}. The getdesign package layout may have changed.`,
		);
	}

	const briefCount = fs
		.readdirSync(TARGET_DIR)
		.filter((f) => f.endsWith(".md")).length;

	// Clean up the tarball — only the templates directory is needed.
	fs.rmSync(PKG_DIR, { recursive: true, force: true });

	console.log(`✓ Vendored ${briefCount} briefs to ${path.relative(ROOT, TARGET_DIR)}/`);
	console.log(`  Run \`pnpm import:themes\` to (re)generate presets.`);
}

main();
