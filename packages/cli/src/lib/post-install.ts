import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Print a tip pointing the user at the bundled Hex Core agent skills, when
 * any are installed under `.claude/skills/hex-core-*`. The skills (e.g.
 * `hex-core-overview`, `hex-core-cli`, `hex-core-anti-patterns`) carry the
 * onboarding guidance that real-session feedback flagged as undiscoverable
 * — surfacing the tip at every post-install touchpoint closes that gap.
 *
 * Silent no-op when no Hex Core skills are present. Always prints the same
 * lines so the regression suite can assert against a stable string.
 *
 * @param cwd - The consumer's working directory.
 * @param options - When `always` is true, print regardless of detection
 *   (use from `hex skills install`, which just placed the skills and
 *   should always advertise them).
 */
export function printSkillsHint(cwd: string, options: { always?: boolean } = {}): void {
	if (!options.always && !hasHexCoreSkill(cwd)) return;
	console.log("\nFor next steps, ask your AI session to invoke the hex-core-overview skill");
	console.log("  (or hex-core-cli for command reference, hex-core-anti-patterns to avoid common misses).");
}

/**
 * Detect whether the consumer's `.claude/skills/` directory contains at
 * least one `hex-core-*` skill with a `SKILL.md` file inside.
 *
 * @param cwd - The consumer's working directory.
 * @returns True when at least one Hex Core skill is installed.
 */
function hasHexCoreSkill(cwd: string): boolean {
	const skillsRoot = path.join(cwd, ".claude", "skills");
	if (!fs.existsSync(skillsRoot)) return false;
	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(skillsRoot, { withFileTypes: true });
	} catch {
		return false;
	}
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		if (!entry.name.startsWith("hex-core-")) continue;
		if (fs.existsSync(path.join(skillsRoot, entry.name, "SKILL.md"))) return true;
	}
	return false;
}
