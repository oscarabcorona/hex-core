/**
 * Minimal TTY-aware progress spinner. Renders to stderr so it doesn't
 * pollute stdout pipelines, and silently no-ops in CI or when stderr
 * isn't a TTY — both are common when the CLI is invoked from a subprocess
 * or piped through `tee`.
 */

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function isInteractive(): boolean {
	if (process.env.CI === "true") return false;
	if (process.env.NO_COLOR) return false;
	return Boolean(process.stderr.isTTY);
}

/**
 * Wrap an async operation with a spinner. Always resolves with the
 * operation's value (errors propagate naturally after the spinner stops).
 *
 * @param label - Static text shown next to the spinning frame.
 * @param fn - Async unit of work whose duration the spinner covers.
 */
export async function withSpinner<T>(label: string, fn: () => Promise<T>): Promise<T> {
	if (!isInteractive()) return fn();
	let frame = 0;
	const interval = setInterval(() => {
		process.stderr.write(`\r${FRAMES[frame % FRAMES.length]} ${label}`);
		frame++;
	}, 80);
	try {
		return await fn();
	} finally {
		clearInterval(interval);
		// Erase the spinner line so the next log starts clean.
		process.stderr.write(`\r${" ".repeat(label.length + 4)}\r`);
	}
}
