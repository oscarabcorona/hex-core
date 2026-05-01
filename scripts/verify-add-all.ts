/**
 * Verify every registry component installs cleanly via `hex add <slug>`
 * and leaves a project where every `@/...` import resolves to a file the
 * CLI actually wrote.
 *
 * Each component runs in its own temp dir so dependency-graph walks are
 * tested in isolation, not piggy-backed on previous installs.
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CLI_BIN = path.join(ROOT, "packages/cli/dist/index.js");
const REGISTRY_INDEX = path.join(ROOT, "registry/registry.json");

interface RegistryIndex {
	items: Array<{ name: string }>;
}

const HEX_CONFIG = {
	$schema: "https://hex-core.dev/schema/hex-config.json",
	tailwind: "v4",
	aliases: { components: "@/components", lib: "@/lib" },
};

interface Failure {
	component: string;
	kind: "missing-file" | "cli-error";
	detail: string;
}

if (!fs.existsSync(CLI_BIN)) {
	console.error(`✗ CLI bundle not found at ${CLI_BIN}.`);
	console.error(`  Run \`pnpm --filter @hex-core/cli build\` first.`);
	process.exit(1);
}

const failures: Failure[] = [];
const slugs = (JSON.parse(fs.readFileSync(REGISTRY_INDEX, "utf-8")) as RegistryIndex).items.map((i) => i.name);

console.log(`Verifying ${slugs.length} components...\n`);

for (const slug of slugs) {
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `hex-verify-${slug}-`));
	try {
		fs.writeFileSync(path.join(tmp, "hex.config.json"), JSON.stringify(HEX_CONFIG, null, 2));
		try {
			// execFileSync (no shell) — args are passed verbatim, eliminating
			// any shell-injection surface from path or slug values.
			execFileSync("node", [CLI_BIN, "add", slug, "--no-install"], {
				cwd: tmp,
				stdio: "pipe",
			});
		} catch (err) {
			failures.push({
				component: slug,
				kind: "cli-error",
				detail: (err as { stderr?: Buffer }).stderr?.toString() ?? String(err),
			});
			continue;
		}

		const written = walk(tmp).filter((p) => /\.(tsx?|jsx?)$/.test(p));
		for (const file of written) {
			const content = fs.readFileSync(file, "utf-8");
			// Match every "@/..." specifier — these all need to resolve under cwd.
			for (const m of content.matchAll(/from\s+["'](@\/[^"']+)["']/g)) {
				const spec = m[1];
				const rel = spec.replace(/^@\//, "");
				// tsconfig "@/*" maps to "<cwd>/*", so resolution targets are
				// `<cwd>/<rel>` plus `.ts`, `.tsx`, or directory + index.
				const candidates = [
					path.join(tmp, `${rel}.tsx`),
					path.join(tmp, `${rel}.ts`),
					path.join(tmp, rel, "index.tsx"),
					path.join(tmp, rel, "index.ts"),
				];
				const exists = candidates.some((p) => fs.existsSync(p));
				if (!exists) {
					failures.push({
						component: slug,
						kind: "missing-file",
						detail: `${path.relative(tmp, file)}  imports ${spec}  (file not written)`,
					});
				}
			}
		}
		process.stdout.write(".");
	} finally {
		fs.rmSync(tmp, { recursive: true, force: true });
	}
}

console.log("\n");

if (failures.length === 0) {
	console.log(`✓ All ${slugs.length} components install cleanly with no unresolved imports.`);
	process.exit(0);
}

console.log(`✗ ${failures.length} failure(s) across ${new Set(failures.map((f) => f.component)).size} component(s):\n`);
const grouped = new Map<string, Failure[]>();
for (const f of failures) {
	if (!grouped.has(f.component)) grouped.set(f.component, []);
	grouped.get(f.component)!.push(f);
}
for (const [slug, fs_] of grouped) {
	console.log(`  ${slug}`);
	for (const f of fs_) console.log(`    [${f.kind}] ${f.detail}`);
}
process.exit(1);

/**
 * Recursively list all files under `dir`. No symlinks, no node_modules
 * (verify dirs never have any).
 */
function walk(dir: string): string[] {
	const out: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...walk(full));
		else if (entry.isFile()) out.push(full);
	}
	return out;
}
