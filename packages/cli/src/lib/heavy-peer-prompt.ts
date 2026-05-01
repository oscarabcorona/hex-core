import type { HeavyPeer } from "@hex-core/registry";

/**
 * A heavy peer collected during the install loop, plus the slugs that asked
 * for it. Aggregated so a single peer required by multiple components shows
 * up once with a `requiredBy` list rather than N times.
 */
export interface PendingHeavyPeer extends HeavyPeer {
	/** Component slugs that triggered this peer. */
	requiredBy: string[];
}

export interface HeavyPeerPromptOptions {
	/** Skip the prompt and resolve as if the user accepted. Honors `--yes`. */
	assumeYes?: boolean;
	/** Inject for unit testing — defaults to `process.stdin` / `process.stdout`. */
	stdin?: NodeJS.ReadableStream;
	stdout?: NodeJS.WritableStream;
}

/**
 * Render the prompt body and read a single Y/n line from stdin. Returns
 * `true` for accept, `false` for decline. Empty input + EOF default to
 * accept (matches the visible `[Y/n]` hint).
 *
 * The whole thing is one readline interaction — no rendering library, no
 * extra dep, no progress bar. The actual install (or its absence) is
 * handled by the caller.
 */
export async function promptHeavyPeers(
	peers: PendingHeavyPeer[],
	options: HeavyPeerPromptOptions = {},
): Promise<boolean> {
	if (peers.length === 0) return true;

	const stdout = options.stdout ?? process.stdout;
	const stdin = options.stdin ?? process.stdin;

	stdout.write("\n");
	stdout.write(
		peers.length === 1
			? "This component requires one heavy peer dependency:\n"
			: `These components require ${peers.length} heavy peer dependencies:\n`,
	);
	stdout.write("\n");

	let totalKb = 0;
	let anyKnown = false;
	for (const peer of peers) {
		const sizeBit = formatSize(peer.bundleKbGzip);
		if (peer.bundleKbGzip != null) {
			totalKb += peer.bundleKbGzip;
			anyKnown = true;
		}
		const usedBy = peer.requiredBy.length > 0 ? `  for ${peer.requiredBy.join(", ")}` : "";
		stdout.write(`  → ${peer.name}@${peer.version}${sizeBit ? `  (${sizeBit})` : ""}${usedBy}\n`);
		if (peer.reason) stdout.write(`     ${peer.reason}\n`);
	}

	if (anyKnown) {
		stdout.write(`\n  Total: ~${formatTotalKb(totalKb)} added to your bundle.\n`);
	}

	if (options.assumeYes) {
		stdout.write("  --yes flag passed, installing without prompt.\n");
		return true;
	}

	stdout.write("\nInstall now? [Y/n]: ");

	// Manual line reader instead of readline.createInterface — readline
	// races 'line' and 'close' on PassThrough streams, and decline answers
	// got swallowed by an early 'close' resolving with "" (defaults to yes).
	return new Promise<boolean>((resolve) => {
		let buf = "";
		let resolved = false;
		const decide = (answer: string) => {
			if (resolved) return;
			resolved = true;
			stdin.removeListener("data", onData);
			stdin.removeListener("end", onEnd);
			const trimmed = answer.trim().toLowerCase();
			resolve(trimmed === "" || trimmed === "y" || trimmed === "yes");
		};
		const onData = (chunk: Buffer | string) => {
			buf += typeof chunk === "string" ? chunk : chunk.toString();
			const newlineIdx = buf.indexOf("\n");
			if (newlineIdx !== -1) decide(buf.slice(0, newlineIdx));
		};
		const onEnd = () => {
			// EOF before a newline: treat the buffered partial as the answer.
			decide(buf);
		};
		stdin.on("data", onData);
		stdin.once("end", onEnd);
	});
}

function formatSize(kb: number | undefined): string | null {
	if (kb == null) return null;
	if (kb >= 1000) return `~${(kb / 1000).toFixed(1)} MB gzip`;
	return `~${kb} KB gzip`;
}

function formatTotalKb(kb: number): string {
	if (kb >= 1000) return `${(kb / 1000).toFixed(1)} MB gzip`;
	return `${kb} KB gzip`;
}

/**
 * Human-readable manual install command for the resolved package manager,
 * used when the user declines or `--no-install` is set.
 */
export function formatManualInstallCommand(
	manager: "pnpm" | "yarn" | "bun" | "npm",
	peers: PendingHeavyPeer[],
): string {
	const specs = peers.map((p) => `${p.name}@${p.version}`).join(" ");
	const verb = manager === "npm" ? "install" : "add";
	return `${manager} ${verb} ${specs}`;
}
