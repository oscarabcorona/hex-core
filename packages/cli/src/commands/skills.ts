import * as fs from "node:fs";
import * as path from "node:path";
import { printSkillsHint } from "../lib/post-install.js";
import { findSkillsDir } from "../lib/skills-dir.js";

export interface SkillsInstallOptions {
	/** Optional install target. Defaults to `<cwd>/.claude/skills/`. */
	target?: string;
	/** Replace existing skill directories instead of skipping them. */
	overwrite: boolean;
}

/**
 * Recursively copy a directory tree, preserving relative paths. Symlinks
 * in the source are intentionally ignored (not followed) so a malicious
 * skills pack can't redirect the copy outside its own tree. Small enough
 * that we don't pull in `fs-extra` or similar — stays zero-dep.
 * @param src - Source directory (absolute)
 * @param dest - Destination directory (absolute)
 */
function copyDirRecursive(src: string, dest: string): void {
	fs.mkdirSync(dest, { recursive: true });
	for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);
		if (entry.isDirectory()) {
			copyDirRecursive(srcPath, destPath);
		} else if (entry.isFile()) {
			fs.copyFileSync(srcPath, destPath);
		}
		// Symlinks / sockets / devices: intentionally ignored.
	}
}

/**
 * Install hex-core's bundled agent skills into a target directory. Default
 * target is `<cwd>/.claude/skills/`, which is where Claude Code looks for
 * project-scoped skills. Per-directory idempotency: an existing skill
 * directory is skipped unless `--overwrite` is passed.
 * @param options - Install flags
 */
export async function installSkills(options: SkillsInstallOptions): Promise<void> {
	const skillsDir = findSkillsDir();
	if (!skillsDir) {
		console.error("Could not find bundled skills directory.");
		process.exit(1);
	}

	const cwd = process.cwd();
	const targetRoot = options.target
		? path.resolve(cwd, options.target)
		: path.resolve(cwd, ".claude", "skills");

	fs.mkdirSync(targetRoot, { recursive: true });

	const installed: string[] = [];
	const skipped: string[] = [];

	for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		const src = path.join(skillsDir, entry.name);
		const skillManifest = path.join(src, "SKILL.md");
		if (!fs.existsSync(skillManifest)) continue;

		const dest = path.join(targetRoot, entry.name);
		if (fs.existsSync(dest)) {
			if (!options.overwrite) {
				skipped.push(entry.name);
				continue;
			}
			// --overwrite: remove whatever is there (could be a file, a dir, or a
			// dangling symlink) before re-copying. Without this, a stray file with
			// a skill's name would cause `mkdirSync` to throw EEXIST.
			fs.rmSync(dest, { recursive: true, force: true });
		}

		copyDirRecursive(src, dest);
		installed.push(entry.name);
	}

	const displayTarget = path.relative(cwd, targetRoot) || targetRoot;
	console.log(`\nInstalled ${installed.length} Hex Core skill(s) into ${displayTarget}:`);
	for (const name of installed) {
		console.log(`  + ${name}`);
	}

	if (skipped.length > 0) {
		console.log(`\nSkipped ${skipped.length} existing skill(s) (use --overwrite to replace):`);
		for (const name of skipped) {
			console.log(`  - ${name}`);
		}
	}

	// Always print — the skills were just copied here, so the hint is
	// guaranteed to be accurate.
	printSkillsHint(cwd, { always: true });

	console.log();
}
