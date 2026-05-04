"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Headless terminal display backed by xterm.js. Renders an xterm grid
 * inside a div the consumer styles. No PTY, no shell — the consumer
 * owns the data-flow:
 *
 *   - Pass `output` (string or string[]) to write to the display. Each
 *     change is diffed against the prior render and only the new tail
 *     is `term.write()`-ed, so feeding a streaming buffer doesn't redraw.
 *   - Pass `onInput` to receive bytes the user typed. Wire it to a
 *     WebSocket / IPC / fetch stream — terminal doesn't care.
 *
 * Heavy peer: requires `@xterm/xterm` (~150 KB gzip). The hex-core CLI's
 * `add` flow prompts before installing.
 *
 * @example
 * <Terminal
 *   output={["$ ls\r\n", "package.json  src/\r\n", "$ "]}
 *   onInput={(data) => ws.send(data)}
 *   rows={24}
 *   cols={80}
 * />
 */
export interface TerminalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onInput"> {
	/**
	 * Bytes to display. String is written verbatim; string[] is joined.
	 * On change, only the suffix beyond the prior render is emitted, so
	 * appending to a streaming buffer is O(delta).
	 */
	output?: string | string[];
	/** Receive bytes the user typed (incl. control sequences). */
	onInput?: (data: string) => void;
	/** Initial cols. xterm allows runtime resize via fit-addon (not bundled). Default 80. */
	cols?: number;
	/** Initial rows. Default 24. */
	rows?: number;
	/** Theme tokens — defaults to neutral light/dark via CSS vars. */
	theme?: "dark" | "light";
	/** Enable cursor blink. Default true. */
	cursorBlink?: boolean;
	/** Whether the user can type into the terminal. Default true. */
	disableInput?: boolean;
}

const DARK_THEME = {
	background: "#0a0a0a",
	foreground: "#e5e5e5",
	cursor: "#e5e5e5",
	selectionBackground: "#404040",
};
const LIGHT_THEME = {
	background: "#fafafa",
	foreground: "#171717",
	cursor: "#171717",
	selectionBackground: "#d4d4d4",
};

/**
 * Renders an xterm.js terminal display.
 * @param props - Terminal output + input handler + display options
 * @returns A div containing the xterm grid
 */
function Terminal({
	output,
	onInput,
	cols = 80,
	rows = 24,
	theme = "dark",
	cursorBlink = true,
	disableInput = false,
	className,
	...rest
}: TerminalProps) {
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const termRef = React.useRef<import("@xterm/xterm").Terminal | null>(null);
	const writtenRef = React.useRef<string>("");
	const onInputRef = React.useRef(onInput);
	onInputRef.current = onInput;
	// Latest-output mirror so the dynamic-import callback can read the value
	// at the moment the engine actually mounts (not the value at first render
	// — those can differ when the parent's `output` prop is set lazily).
	const outputRef = React.useRef(output);
	outputRef.current = output;

	// Initialize xterm once on mount. Dynamic import keeps the engine out
	// of consumers' bundles unless they actually mount the component.
	React.useEffect(() => {
		if (!containerRef.current) return;

		let disposed = false;
		let inputDispose: { dispose: () => void } | null = null;

		void (async () => {
			const xtermModule = await import("@xterm/xterm");
			if (disposed || !containerRef.current) return;

			const term = new xtermModule.Terminal({
				cols,
				rows,
				cursorBlink,
				disableStdin: disableInput,
				theme: theme === "dark" ? DARK_THEME : LIGHT_THEME,
				fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
				fontSize: 13,
			});
			term.open(containerRef.current);
			termRef.current = term;

			// Read the LATEST output via the ref — between mount and
			// import-resolve, the parent may have updated the prop. Without
			// this, fast prop changes get clobbered.
			const latest = normalizeOutput(outputRef.current);
			if (latest) {
				term.write(latest);
				writtenRef.current = latest;
			}

			inputDispose = term.onData((data) => {
				onInputRef.current?.(data);
			});
		})();

		return () => {
			disposed = true;
			inputDispose?.dispose();
			termRef.current?.dispose();
			termRef.current = null;
			writtenRef.current = "";
		};
		// cols/rows/theme/cursorBlink/disableInput are mount-time options.
		// Changing them mid-session would force a full re-init that'd lose
		// scrollback — out of scope for v1.
	}, []);

	// Diff `output` against what's already on screen and write only the new tail.
	React.useEffect(() => {
		const term = termRef.current;
		if (!term) return;
		const next = normalizeOutput(output);
		if (next === writtenRef.current) return;
		if (next.startsWith(writtenRef.current)) {
			const delta = next.slice(writtenRef.current.length);
			if (delta) term.write(delta);
		} else {
			// Non-suffix change (e.g. consumer cleared the buffer or replaced it
			// with unrelated content) — reset the screen and write fresh.
			term.reset();
			if (next) term.write(next);
		}
		writtenRef.current = next;
	}, [output]);

	return (
		<div
			{...rest}
			ref={containerRef}
			data-hex-terminal
			data-theme={theme}
			className={cn(
				"overflow-hidden rounded-md border p-2",
				// Theme-locked surface: xterm's foreground (e5e5e5 / 171717)
				// must contrast against the OUTER container, not the page.
				// `bg-background` (the previous default) inherits page light/dark
				// and produces 1.2:1 contrast in the wrong combo.
				theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#fafafa]",
				"font-mono text-sm leading-tight",
				// xterm.js mounts hidden helper elements (`<textarea>` for
				// keyboard / IME input, `.xterm-char-measure-element` for
				// sizing). Both inherit the page's foreground token, which
				// axe flags as sub-AA against the locked-dark surface even
				// though they're visually offscreen. Force their visible
				// color transparent so axe stops complaining; AT can still
				// read the textarea (xterm's intended IME path), but the
				// rendered output appears in xterm's canvas — not the
				// textarea — so AT won't see meaningful content there.
				"[&_textarea]:!text-transparent [&_textarea]:!caret-transparent",
				"[&_.xterm-char-measure-element]:!text-transparent",
				className,
			)}
		/>
	);
}

function normalizeOutput(value: string | string[] | undefined): string {
	if (value == null) return "";
	return Array.isArray(value) ? value.join("") : value;
}

export { Terminal };
