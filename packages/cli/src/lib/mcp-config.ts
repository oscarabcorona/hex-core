import * as fs from "node:fs";
import * as path from "node:path";

interface McpTarget {
	kind: "claude-code" | "cursor" | "continue";
	relPath: string;
	/** When true, create the file if missing — the writer treats it as the canonical target. */
	createIfMissing?: boolean;
}

/**
 * AI-tool MCP server config files that `hex init --mcp` knows how to wire.
 *
 * Ordered by priority. The first entry is **created on demand** because
 * Claude Code's project-scope MCP file (`.mcp.json` at repo root) is
 * commit-tracked and is the canonical place for shared team MCP servers
 * — but it may not exist on a fresh repo. Cursor and Continue use their
 * own per-tool dirs; those targets are only matched when present.
 *
 * Notably NOT in the list: `.claude/settings.json` and `.claude/settings.local.json`
 * — Claude Code reads `mcpServers` from `.mcp.json` (project) or
 * `~/.claude.json` (user), not from the settings file (which is for
 * permissions/hooks/plugins). Writing `mcpServers` into the settings
 * file is a silent no-op.
 */
const TARGETS: readonly McpTarget[] = [
	{ kind: "claude-code", relPath: ".mcp.json", createIfMissing: true },
	{ kind: "cursor", relPath: ".cursor/mcp.json" },
	{ kind: "continue", relPath: ".continue/config.json" },
];

/** Outcome of an MCP config write attempt. */
export interface McpWriteResult {
	/** True when this run wrote (or would have written) a new entry. */
	wrote: boolean;
	/** True when an existing `hex-core` entry was already present. */
	alreadyConfigured: boolean;
	/** Path that was (or would be) written, relative to cwd. */
	target: string | null;
	/** True when no supported config file was detected (only possible after we drop createIfMissing). */
	noTarget: boolean;
	/** True when a candidate file exists but parses as broken JSON — caller should surface the path. */
	malformed: boolean;
}

/**
 * Configuration written into the AI-tool's `mcpServers["hex-core"]` slot.
 * Uses `npx -y` so the consumer doesn't have to add `@hex-core/mcp` to
 * their project's npm deps — the MCP launcher pulls it on demand.
 */
const HEX_CORE_MCP_ENTRY = {
	command: "npx",
	args: ["-y", "@hex-core/mcp@latest"],
} as const;

/**
 * Runtime type guard for plain object shapes used as MCP config roots.
 * Avoids the `as Record<string, unknown>` cast pattern.
 * @param v - The value to test.
 * @returns True when `v` is a non-null, non-array object.
 */
function isPlainObject(v: unknown): v is Record<string, unknown> {
	return v !== null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Find the first AI-tool MCP config file present in the consumer's cwd.
 * Returns the canonical Claude Code target (`.mcp.json`) when no file
 * yet exists, since the writer will create it on demand.
 *
 * @param cwd - The consumer's working directory.
 * @returns The matched target + absolute path. Never returns null —
 *   `.mcp.json` is always a valid creation target.
 */
export function detectMcpTarget(cwd: string): { target: McpTarget; abs: string } {
	for (const target of TARGETS) {
		const abs = path.join(cwd, target.relPath);
		if (fs.existsSync(abs)) return { target, abs };
	}
	// No file exists — return the canonical create-on-demand target.
	const fallback = TARGETS[0];
	if (!fallback || fallback.createIfMissing !== true) {
		throw new Error("hex-core/cli: MCP target table is missing a createIfMissing entry");
	}
	return { target: fallback, abs: path.join(cwd, fallback.relPath) };
}

/**
 * Add a `hex-core` entry to the detected AI-tool's MCP config. Read–merge–
 * write — never clobbers existing `mcpServers` entries; bails out cleanly
 * when `hex-core` is already configured. Pretty-prints with 2-space
 * indent to match the shape the tools already write.
 *
 * Creates `.mcp.json` at the repo root when no MCP config file exists yet
 * (the canonical Claude Code project-scope convention).
 *
 * Malformed JSON in an existing target is left untouched — the caller
 * gets `malformed: true` so it can print the path for the user to fix.
 *
 * @param cwd - The consumer's working directory.
 * @param options - When `dryRun` is true, returns the would-be result
 *   without touching the filesystem.
 * @returns A describable outcome the caller can print.
 */
export function writeMcpEntry(
	cwd: string,
	options: { dryRun?: boolean } = {},
): McpWriteResult {
	const hit = detectMcpTarget(cwd);
	const relTarget = hit.target.relPath;

	// Read with try/catch on the action — avoids the existsSync()+readFileSync()
	// check-then-act race CodeQL's `js/file-system-race` flags. ENOENT is the
	// only "no file" signal we expect; any other read error is treated as
	// malformed so the user sees the path and can investigate.
	let raw: string | null = null;
	try {
		raw = fs.readFileSync(hit.abs, "utf-8");
	} catch (err) {
		const code = (err as NodeJS.ErrnoException).code;
		if (code !== "ENOENT") {
			return { wrote: false, alreadyConfigured: false, target: relTarget, noTarget: false, malformed: true };
		}
	}

	let parsed: Record<string, unknown> = {};
	if (raw !== null && raw.trim().length > 0) {
		try {
			const candidate: unknown = JSON.parse(raw);
			if (isPlainObject(candidate)) parsed = candidate;
		} catch {
			// Malformed JSON in the consumer's config is theirs to fix.
			// Surface the path so they know which file is broken.
			return { wrote: false, alreadyConfigured: false, target: relTarget, noTarget: false, malformed: true };
		}
	}

	const existingServers = parsed.mcpServers;
	const mcpServers: Record<string, unknown> = isPlainObject(existingServers)
		? { ...existingServers }
		: {};

	if ("hex-core" in mcpServers) {
		return { wrote: false, alreadyConfigured: true, target: relTarget, noTarget: false, malformed: false };
	}

	if (options.dryRun) {
		return { wrote: true, alreadyConfigured: false, target: relTarget, noTarget: false, malformed: false };
	}

	mcpServers["hex-core"] = HEX_CORE_MCP_ENTRY;
	const next = { ...parsed, mcpServers };
	fs.mkdirSync(path.dirname(hit.abs), { recursive: true });
	fs.writeFileSync(hit.abs, `${JSON.stringify(next, null, 2)}\n`, "utf-8");
	return { wrote: true, alreadyConfigured: false, target: relTarget, noTarget: false, malformed: false };
}
