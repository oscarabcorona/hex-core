import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Heavy build/cache directory names that no source-pattern scan ever
 * wants to walk into. Kept explicit (not just "anything starting with
 * `.`") because some non-dot names — `node_modules`, `dist`, `build`,
 * `coverage`, `out`, `target` — are equally important to skip.
 */
const SKIP_DIRS = new Set([
	"node_modules",
	"dist",
	"build",
	"out",
	"coverage",
	"target",
]);

/**
 * Recursively walk a directory tree and yield file paths matching the given extensions. Skips any dotfile directory (blanket covers `.next`/`.turbo`/`.git`/`.vercel`/`.svelte-kit`/`.cache`) plus the explicit non-dot directories in {@link SKIP_DIRS} (`node_modules`, `dist`, `build`, `out`, `coverage`, `target`). Used by `hex doctor` for source-pattern scans and by other CLI commands that need to introspect the consumer's project tree without pulling in a heavyweight AST library.
 * @param root - Directory to walk. Returns immediately if it doesn't exist.
 * @param extensions - File extensions to include (with the leading dot, e.g. `.tsx`).
 * @returns Absolute paths to matching files, in deterministic order.
 */
export function walkSourceFiles(root: string, extensions: readonly string[]): string[] {
	if (!fs.existsSync(root)) return [];
	const out: string[] = [];
	const stack: string[] = [root];
	const exts = new Set(extensions);
	while (stack.length > 0) {
		const dir = stack.pop();
		if (dir === undefined) break;
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			if (entry.name.startsWith(".")) continue;
			if (SKIP_DIRS.has(entry.name)) continue;
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				stack.push(full);
			} else if (entry.isFile() && exts.has(path.extname(entry.name))) {
				out.push(full);
			}
		}
	}
	out.sort();
	return out;
}
