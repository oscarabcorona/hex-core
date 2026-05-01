/**
 * Streaming-safe markdown pre-processor. Detects unterminated tokens at
 * end-of-input and appends synthetic closers so `react-markdown`'s
 * parser doesn't render half-tokens as raw text or throw.
 *
 * Used by the `Markdown` component when consumers stream LLM output
 * one chunk at a time. Pure function — no I/O, no React, no plugins —
 * so it's trivially unit-testable as a truth table.
 *
 * Order matters. We close in this priority:
 *   1. Fenced code blocks (` ``` `) — most disruptive if open.
 *   2. HTML tags (`<tag` without `>`) — would consume rest of stream as attribute.
 *   3. Link parentheses (`[text](url`) — `react-markdown` falls back to text on these.
 *   4. Link brackets (`[text` no `]`) — consumes potentially huge bodies.
 *   5. Inline backticks (`` ` ``) — small but visible.
 *   6. Strikethrough (`~~`) — GFM extension.
 *   7. Bold (`**`) — must close before single `*` so we don't double-count.
 *   8. Italic (`*`, `_`) — last (most ambiguous).
 *
 * For tokens 5–8 we operate over a mask-view that replaces fenced
 * regions with whitespace of the same length, so an unclosed `**`
 * inside ` ``` ` doesn't trigger a closer.
 */

/**
 * Pre-process raw markdown for the streaming-safe renderer.
 * @param input - Raw markdown string, possibly mid-stream.
 * @returns Input with synthetic closers appended for each open-at-EOF token.
 */
export function closeUnterminated(input: string): string {
	let working = input;
	const suffixes: string[] = [];

	// 1. Fenced code: count lines that are exactly ``` (allowing optional language tag on opener).
	if (hasUnclosedFence(working)) {
		suffixes.push("\n```\n");
		// Mask the open fence's content so steps 5–8 ignore it.
		working = maskOpenFence(working);
	}

	// Mask all CLOSED fenced regions for step 5–8 — the content inside
	// closed fences is not subject to inline-token rules either.
	const masked = maskClosedFences(working);

	// 2a. HTML comment at any position with no `-->` close — the comment
	//     would otherwise consume the rest of the stream as comment body.
	if (/<!--(?![\s\S]*-->)/.test(working)) {
		suffixes.push("-->");
	}
	// 2b. HTML tag at tail: `<tag` (with optional attrs) with no closing `>`.
	//     Skipped if a `<!--` already triggered the comment closer above
	//     (otherwise we'd add both `-->` and `>` for the same opener).
	else if (/<[a-zA-Z][^<>]*$/.test(working)) {
		suffixes.push(">");
	}

	// 3 + 4. Link parens / brackets at tail.
	if (/\[[^\]]*\]\([^)]*$/.test(working)) {
		suffixes.push(")");
	} else if (/\[[^\]]*$/.test(working)) {
		suffixes.push("]");
	}

	// 5. Inline backticks per line (in masked view, so fences excluded).
	let backtickOdd = 0;
	for (const line of masked.split("\n")) {
		// Only count single backticks — fenced code is masked out, but
		// a line like `` `foo` `bar` `` is two pairs (count 4 = even).
		const count = (line.match(/`/g) ?? []).length;
		if (count % 2 === 1) backtickOdd++;
	}
	if (backtickOdd % 2 === 1) {
		suffixes.push("`");
	}

	// 6. Strikethrough — count `~~` markers (each pair brackets one
	//    strikethrough span; an odd count means an opener with no closer).
	const strikeMarkers = countOutsideMaskedFences(masked, /~~/g);
	if (strikeMarkers % 2 === 1) {
		suffixes.push("~~");
	}

	// 7. Bold. Walk the string and count `**` runs without consuming `***`
	// (which is bold + italic). A `**bold**` is two markers; `***both***`
	// is one `**` then one `*` then content then `*` then `**`.
	const { boldOdd, italicAsteriskOdd } = countBoldItalic(masked);
	if (boldOdd) suffixes.push("**");
	// 8. Italic. Asterisk first, then underscore.
	if (italicAsteriskOdd) suffixes.push("*");
	if (countUnderscoreItalic(masked) % 2 === 1) suffixes.push("_");

	if (suffixes.length === 0) return input;
	return input + suffixes.join("");
}

/**
 * A fence opener / closer is a line whose trim is exactly ``` or ```lang.
 * @param input - Raw markdown.
 * @returns True when there's an odd number of fence delimiter lines.
 */
function hasUnclosedFence(input: string): boolean {
	const fenceRe = /^[ \t]*```/gm;
	const matches = input.match(fenceRe);
	return matches !== null && matches.length % 2 === 1;
}

/**
 * Replace the open fence (its opener line + everything after) with
 * whitespace of equal length. The opener line itself is included so its
 * fence delimiter doesn't show up in the inline-backtick / bold counts.
 * Inline tokens inside an open fence don't apply.
 * @param input - Raw markdown with a possibly-unclosed trailing fence.
 * @returns The same string with the open fence + content masked to spaces.
 */
function maskOpenFence(input: string): string {
	const fenceRe = /^[ \t]*```/gm;
	const matches: RegExpExecArray[] = [];
	let m: RegExpExecArray | null;
	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex iteration
	while ((m = fenceRe.exec(input)) !== null) {
		matches.push(m);
	}
	if (matches.length % 2 !== 1) return input;
	const lastOpener = matches[matches.length - 1];
	if (!lastOpener) return input;
	// Mask from the start of the fence line (lastOpener.index points at
	// the first ``` char) through end-of-input, preserving newlines.
	const start = lastOpener.index;
	return input.slice(0, start) + input.slice(start).replace(/[^\n]/g, " ");
}

/**
 * Replace whole closed fence pairs (opener line + content + closer line)
 * with whitespace, keeping newlines. Both delimiter lines are masked so
 * the inline-token counters don't see their backtick characters.
 * @param input - Raw markdown.
 * @returns The same string with paired fences masked to whitespace.
 */
function maskClosedFences(input: string): string {
	const fenceRe = /^[ \t]*```/gm;
	const indices: number[] = [];
	let m: RegExpExecArray | null;
	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex iteration
	while ((m = fenceRe.exec(input)) !== null) {
		indices.push(m.index);
	}
	let out = input;
	const pairCount = Math.floor(indices.length / 2);
	for (let i = 0; i < pairCount; i++) {
		const openIdx = indices[i * 2];
		const closeIdx = indices[i * 2 + 1];
		if (openIdx === undefined || closeIdx === undefined) continue;
		// Mask from the opener-line start through the closer-line end so
		// no `` ``` `` survives in the masked view.
		const closeEnd = out.indexOf("\n", closeIdx);
		const regionEnd = closeEnd < 0 ? out.length : closeEnd;
		const before = out.slice(0, openIdx);
		const region = out.slice(openIdx, regionEnd).replace(/[^\n]/g, " ");
		const after = out.slice(regionEnd);
		out = before + region + after;
	}
	return out;
}

/**
 * Count regex matches over the masked view.
 * @param masked - Markdown with closed/open fences masked to whitespace.
 * @param re - Pattern to count occurrences of.
 * @returns The number of matches.
 */
function countOutsideMaskedFences(masked: string, re: RegExp): number {
	const matches = masked.match(re);
	return matches?.length ?? 0;
}

/**
 * Count bold (double-asterisk) and asterisk-italic (single-asterisk)
 * markers, accounting for triple-asterisk which counts as one bold plus
 * one italic. Returns parity flags so callers can decide closers.
 * @param masked - Markdown with fences masked to whitespace.
 * @returns Parity flags for bold and asterisk-italic markers.
 */
function countBoldItalic(masked: string): { boldOdd: boolean; italicAsteriskOdd: boolean } {
	// Strip word-internal asterisks first (markdown ignores them) — be conservative.
	let bold = 0;
	let italic = 0;
	let i = 0;
	while (i < masked.length) {
		const ch = masked[i];
		if (ch !== "*") {
			i++;
			continue;
		}
		// Count run length of consecutive `*`.
		let run = 0;
		while (i + run < masked.length && masked[i + run] === "*") run++;
		// Decompose: every pair is one `**`, leftover single is `*`.
		bold += Math.floor(run / 2);
		italic += run % 2;
		i += run;
	}
	return { boldOdd: bold % 2 === 1, italicAsteriskOdd: italic % 2 === 1 };
}

/**
 * Count underscore italic markers. Markdown only treats `_foo_` as italic
 * when the underscores are at word boundaries — `foo_bar_baz` is plain
 * text. We approximate by only counting underscores where one side is
 * whitespace, line-start, or line-end.
 * @param masked - Markdown with fences masked to whitespace.
 * @returns The number of underscore markers eligible to act as italic.
 */
function countUnderscoreItalic(masked: string): number {
	let count = 0;
	for (let i = 0; i < masked.length; i++) {
		if (masked[i] !== "_") continue;
		const prev = i === 0 ? " " : masked[i - 1];
		const next = i === masked.length - 1 ? " " : masked[i + 1];
		const prevWs = prev === undefined || /[\s]/.test(prev);
		const nextWs = next === undefined || /[\s]/.test(next);
		if (prevWs || nextWs) count++;
	}
	return count;
}
