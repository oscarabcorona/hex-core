"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Cloze deletion — text with hidden segments the learner reveals one at
 * a time (or all at once). Each `{ hidden }` token in the `parts` array
 * renders as a redacted span; click / Enter / Space reveals just that
 * blank.
 *
 * Pure HTML; no heavy peer. Pair with Deck (artifacts/deck) to flow
 * through a sequence of cloze cards, or with SpacedRepetition for
 * confidence rating.
 *
 * @example
 * <Cloze parts={[
 *   "The mitochondria is the ",
 *   { hidden: "powerhouse" },
 *   " of the cell.",
 * ]} />
 */
export type ClozePart = string | { hidden: string; id?: string };

export interface ClozeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onReveal"> {
	/** Mixed array: string fragments + { hidden } cloze tokens. */
	parts: ClozePart[];
	/** "click" reveals one blank at a time; "all" additionally surfaces a "Reveal all" toggle. Default "click". */
	revealMode?: "click" | "all";
	/** Fired with the cumulative set of revealed blank ids on every reveal change. */
	onReveal?: (revealedIds: string[]) => void;
}

interface NormalizedBlank {
	hidden: string;
	id: string;
	blankIndex: number;
}

// Namespace auto-ids with a prefix that's vanishingly unlikely to collide
// with consumer-supplied explicit ids. Without this, `[{hidden:'a'},
// {hidden:'b'}]` (auto-numbered "blank-0", "blank-1") would silently
// alias with a future `{hidden:'c', id:'blank-1'}`.
const AUTO_ID_PREFIX = "__hex_cloze_auto_";

function normalize(parts: ClozePart[]): { fragments: Array<string | NormalizedBlank>; total: number } {
	let blankIndex = 0;
	const fragments = parts.map((p) => {
		if (typeof p === "string") return p;
		const id = p.id ?? `${AUTO_ID_PREFIX}${blankIndex}`;
		const out: NormalizedBlank = { hidden: p.hidden, id, blankIndex };
		blankIndex++;
		return out;
	});
	return { fragments, total: blankIndex };
}

function Cloze({ parts, revealMode = "click", onReveal, className, ...rest }: ClozeProps) {
	const { fragments, total } = React.useMemo(() => normalize(parts), [parts]);
	const [revealed, setRevealed] = React.useState<Set<string>>(() => new Set());
	const onRevealRef = React.useRef(onReveal);
	onRevealRef.current = onReveal;

	const update = React.useCallback((next: Set<string>) => {
		setRevealed(next);
		onRevealRef.current?.(Array.from(next));
	}, []);

	const toggleBlank = React.useCallback(
		(id: string) => {
			const next = new Set(revealed);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			update(next);
		},
		[revealed, update],
	);

	const allRevealed = total > 0 && revealed.size === total;

	const toggleAll = React.useCallback(() => {
		if (allRevealed) {
			update(new Set());
		} else {
			const next = new Set<string>();
			for (const f of fragments) if (typeof f !== "string") next.add(f.id);
			update(next);
		}
	}, [allRevealed, fragments, update]);

	return (
		<div
			{...rest}
			data-hex-cloze
			data-all-revealed={allRevealed}
			className={cn("text-base leading-relaxed", className)}
		>
			<p data-hex-cloze-text>
				{fragments.map((f, i) => {
					if (typeof f === "string") return <React.Fragment key={`s-${i}`}>{f}</React.Fragment>;
					const isRevealed = revealed.has(f.id);
					return (
						<button
							key={f.id}
							type="button"
							data-hex-cloze-blank
							data-blank-id={f.id}
							data-revealed={isRevealed}
							aria-pressed={isRevealed}
							aria-label={
								isRevealed
									? `Blank ${f.blankIndex + 1} revealed: ${f.hidden}. Activate to hide.`
									: `Blank ${f.blankIndex + 1} of ${total}. Activate to reveal.`
							}
							onClick={() => toggleBlank(f.id)}
							className={cn(
								"mx-0.5 inline-block rounded px-1.5 py-0 align-baseline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								isRevealed
									? "bg-primary/10 text-foreground underline decoration-primary decoration-dotted underline-offset-4"
									: "select-none bg-muted text-transparent",
							)}
						>
							{/* Always render the hidden text so the visual width matches
							    once revealed; transparent text when hidden. */}
							{f.hidden}
						</button>
					);
				})}
			</p>
			{revealMode === "all" && total > 0 ? (
				<div className="mt-3">
					<button
						type="button"
						data-hex-cloze-toggle-all
						aria-label={allRevealed ? "Hide all blanks" : "Reveal all blanks"}
						onClick={toggleAll}
						className="rounded-md border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						{allRevealed ? "Hide all" : "Reveal all"}
					</button>
				</div>
			) : null}
		</div>
	);
}

export { Cloze };
