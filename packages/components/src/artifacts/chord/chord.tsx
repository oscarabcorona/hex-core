"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Chord diagram. Nodes sit on a ring; ribbons inside the ring encode
 * weighted bidirectional relationships between them. Common for
 * trade flows, migration, hyperlink graphs, citation networks —
 * anywhere "A relates to B with weight w" matters at scale.
 *
 * Heavy peers: requires `d3-chord` (~3 KB gzip) and `d3-shape` (~6 KB
 * gzip, already in the artifacts/ family). The hex-core CLI's `add`
 * flow prompts before installing.
 *
 * @example
 * <Chord
 *   nodes={["A", "B", "C", "D"].map((id) => ({ id, label: id }))}
 *   matrix={[
 *     [0, 5, 8, 1],
 *     [3, 0, 2, 4],
 *     [6, 0, 0, 7],
 *     [2, 1, 9, 0],
 *   ]}
 * />
 */
export type ChordNode = {
	id: string;
	label: string;
};

/**
 * Payload fired to `onChordHover`. `sourceValue` is the i→j flow;
 * `targetValue` is the j→i flow. They differ for asymmetric matrices and
 * are equal for symmetric ones.
 */
export type ChordHoverPayload = {
	source: ChordNode;
	target: ChordNode;
	sourceValue: number;
	targetValue: number;
};

export interface ChordProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Nodes (as ring segments). Order matches matrix rows/columns. */
	nodes: ChordNode[];
	/** Square N×N matrix of weights. matrix[i][j] = flow from node i to node j. */
	matrix: number[][];
	/** Pixel size of the rendered SVG (it's square). Default 480. */
	size?: number;
	/** Pixel padding between adjacent ring segments. Default 0.04 (radians, d3 convention). */
	padAngle?: number;
	/** Fired when a ribbon is hovered (or hover ends, with `null`). */
	onChordHover?: (chord: ChordHoverPayload | null) => void;
	/** Fired when a node arc is clicked. */
	onNodeClick?: (node: ChordNode) => void;
}

interface LaidOutArc {
	node: ChordNode;
	depth: number;
	d: string;
	labelX: number;
	labelY: number;
	labelAngle: number;
}

interface LaidOutChord {
	source: ChordNode;
	target: ChordNode;
	sourceValue: number;
	targetValue: number;
	d: string;
}

type D3ChordMod = typeof import("d3-chord");
type D3ShapeMod = typeof import("d3-shape");

const NODE_PALETTE = [
	"hsl(var(--primary))",
	"hsl(var(--accent))",
	"hsl(var(--secondary))",
	"hsl(var(--muted))",
];

function Chord({
	nodes,
	matrix,
	size = 480,
	padAngle = 0.04,
	onChordHover,
	onNodeClick,
	className,
	...rest
}: ChordProps) {
	const [d3c, setD3c] = React.useState<D3ChordMod | null>(null);
	const [d3s, setD3s] = React.useState<D3ShapeMod | null>(null);
	const [importError, setImportError] = React.useState(false);

	React.useEffect(() => {
		let cancelled = false;
		void Promise.all([import("d3-chord"), import("d3-shape")]).then(
			([c, s]) => {
				if (cancelled) return;
				setD3c(c);
				setD3s(s);
			},
			() => {
				if (!cancelled) setImportError(true);
			},
		);
		return () => {
			cancelled = true;
		};
	}, []);

	const laidOut = React.useMemo(() => {
		if (!d3c || !d3s) return null;
		return layout(d3c, d3s, nodes, matrix, size, padAngle);
	}, [d3c, d3s, nodes, matrix, size, padAngle]);

	if (importError) {
		return (
			<div
				data-hex-chord-error
				role="alert"
				className={cn(
					"inline-flex items-center justify-center rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive",
					className,
				)}
				style={{ width: size, height: size }}
			>
				Install <code className="mx-1">d3-chord</code> to view this chord diagram.
			</div>
		);
	}

	if (!laidOut) {
		return (
			<div
				data-hex-chord-loading
				aria-busy="true"
				aria-label="Loading chord diagram"
				className={cn("inline-block bg-muted/20", className)}
				style={{ width: size, height: size }}
			/>
		);
	}

	const { arcs, chords } = laidOut;
	const desc = `Chord diagram with ${nodes.length} node${nodes.length === 1 ? "" : "s"} and ${chords.length} ribbon${chords.length === 1 ? "" : "s"}`;
	const radius = size / 2;

	return (
		<svg
			{...rest}
			data-hex-chord
			role="img"
			width={size}
			height={size}
			viewBox={`${-radius} ${-radius} ${size} ${size}`}
			className={cn("block", className)}
		>
			<title>Chord diagram</title>
			<desc>{desc}</desc>
			<g data-hex-chord-ribbons>
				{chords.map((c, i) => {
					const interactive = Boolean(onChordHover);
					const payload: ChordHoverPayload = {
						source: c.source,
						target: c.target,
						sourceValue: c.sourceValue,
						targetValue: c.targetValue,
					};
					const fireHover = (chord: ChordHoverPayload | null) => onChordHover?.(chord);
					return (
						<path
							key={`${c.source.id}-${c.target.id}-${i}`}
							data-hex-chord-ribbon
							d={c.d}
							fill="hsl(var(--primary))"
							fillOpacity={0.4}
							stroke="hsl(var(--background))"
							strokeWidth={0.5}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={
								interactive
									? `Flow from ${c.source.label} to ${c.target.label}, value ${c.sourceValue}; reverse value ${c.targetValue}`
									: undefined
							}
							style={{
								cursor: interactive ? "pointer" : undefined,
								transition: "fill-opacity 120ms ease",
							}}
							onMouseEnter={interactive ? () => fireHover(payload) : undefined}
							onMouseLeave={interactive ? () => fireHover(null) : undefined}
							onFocus={interactive ? () => fireHover(payload) : undefined}
							onBlur={interactive ? () => fireHover(null) : undefined}
						/>
					);
				})}
			</g>
			<g data-hex-chord-arcs>
				{arcs.map((a) => {
					const interactive = Boolean(onNodeClick);
					const handleActivate = () => onNodeClick?.(a.node);
					const flip = a.labelAngle > Math.PI / 2 && a.labelAngle < (3 * Math.PI) / 2;
					return (
						<g
							key={a.node.id}
							data-hex-chord-arc
							data-depth={a.depth}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={interactive ? a.node.label : undefined}
							style={interactive ? { cursor: "pointer" } : undefined}
							onClick={interactive ? handleActivate : undefined}
							onKeyDown={interactive ? (e) => activateOnKey(e, handleActivate) : undefined}
						>
							<path
								d={a.d}
								fill={NODE_PALETTE[a.depth % NODE_PALETTE.length]}
								stroke="hsl(var(--background))"
								strokeWidth={1}
							/>
							<text
								x={a.labelX}
								y={a.labelY}
								textAnchor={flip ? "end" : "start"}
								dy="0.35em"
								transform={
									flip
										? `rotate(${(a.labelAngle * 180) / Math.PI - 270} ${a.labelX} ${a.labelY})`
										: `rotate(${(a.labelAngle * 180) / Math.PI - 90} ${a.labelX} ${a.labelY})`
								}
								fontSize={11}
								fill="hsl(var(--foreground))"
								style={{ pointerEvents: "none" }}
							>
								{a.node.label}
							</text>
						</g>
					);
				})}
			</g>
		</svg>
	);
}

function layout(
	d3c: D3ChordMod,
	d3s: D3ShapeMod,
	nodes: ChordNode[],
	matrix: number[][],
	size: number,
	padAngle: number,
): { arcs: LaidOutArc[]; chords: LaidOutChord[] } {
	const radius = size / 2 - 24; // leave room for labels
	const innerRadius = radius - 12;
	const outerRadius = radius;

	// d3.descending lives in d3-array — inline the comparator to avoid pulling
	// another peer dep just for one helper.
	const chordGen = d3c
		.chord()
		.padAngle(padAngle)
		.sortSubgroups((a, b) => (a < b ? 1 : a > b ? -1 : 0));
	const result = chordGen(matrix);

	const arc = d3s.arc().innerRadius(innerRadius).outerRadius(outerRadius);
	// `ribbon()` is exported from d3-chord, not d3-shape.
	const ribbon = d3c.ribbon().radius(innerRadius);

	const arcs: LaidOutArc[] = result.groups.map((g) => {
		const node = nodes[g.index] ?? { id: `_${g.index}`, label: `Set ${g.index}` };
		const midAngle = (g.startAngle + g.endAngle) / 2;
		const labelRadius = outerRadius + 6;
		return {
			node,
			depth: g.index,
			d: arc({ startAngle: g.startAngle, endAngle: g.endAngle, innerRadius, outerRadius }) ?? "",
			labelX: labelRadius * Math.sin(midAngle),
			labelY: -labelRadius * Math.cos(midAngle),
			labelAngle: midAngle,
		};
	});

	// Satisfies @types/d3-chord@3.0.6's `RibbonSubgroup.radius` requirement;
	// runtime ignores per-subgroup radius when the generator's `.radius()`
	// is set, so this spread is purely a typing accommodation.
	const buildRibbonInput = (c: typeof result[number]) => ({
		source: { ...c.source, radius: innerRadius },
		target: { ...c.target, radius: innerRadius },
	});

	const chords: LaidOutChord[] = result
		// Drop chord pairs where both directions have zero flow — d3-chord
		// emits placeholder pairs for them which would otherwise render as
		// invisible-but-event-firing ribbons.
		.filter((c) => c.source.value > 0 || c.target.value > 0)
		.map((c) => ({
			source: nodes[c.source.index] ?? { id: `_${c.source.index}`, label: `Set ${c.source.index}` },
			target: nodes[c.target.index] ?? { id: `_${c.target.index}`, label: `Set ${c.target.index}` },
			sourceValue: c.source.value,
			targetValue: c.target.value,
			d: ribbon(buildRibbonInput(c)) ?? "",
		}));

	return { arcs, chords };
}

function activateOnKey(e: React.KeyboardEvent, fn: () => void): void {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

export { Chord };
