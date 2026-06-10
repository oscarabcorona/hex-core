"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Arc diagram. Nodes lie on a horizontal baseline; relationships are
 * drawn as semicircle arcs above the line. Pure SVG; no heavy peer
 * dependency. Excellent for sequence-aware relational data:
 * co-occurrence in a story, train-stop transfer connections,
 * citation chains where node order is meaningful.
 *
 * Distinct from Chord: Chord wraps nodes around a ring (no inherent
 * order); Arc keeps them on a line (order matters).
 *
 * @example
 * <Arc
 *   nodes={[
 *     { id: "alice", label: "Alice" },
 *     { id: "bob", label: "Bob" },
 *     { id: "carol", label: "Carol" },
 *   ]}
 *   edges={[
 *     { source: "alice", target: "bob", value: 3 },
 *     { source: "alice", target: "carol", value: 1 },
 *   ]}
 * />
 */
export type ArcNode = {
	id: string;
	label: string;
	value?: number;
};

export type ArcEdge = {
	source: string;
	target: string;
	value?: number;
};

export interface ArcProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Nodes in display order along the baseline. */
	nodes: ArcNode[];
	/** Edges between nodes. Edges whose source or target id is missing are skipped. */
	edges: ArcEdge[];
	/** Pixel width of the rendered SVG. Default 720. */
	width?: number;
	/** Pixel height of the rendered SVG. Default 360. */
	height?: number;
	/** Pixel radius of each node circle. Default 5. */
	nodeRadius?: number;
	/** Fired when an edge is hovered (or hover ends, with `null`). */
	onEdgeHover?: (edge: ArcEdge | null) => void;
	/** Fired when a node is clicked. */
	onNodeClick?: (node: ArcNode) => void;
}

interface LaidOutNode {
	node: ArcNode;
	x: number;
	y: number;
	depth: number;
}

interface LaidOutEdge {
	edge: ArcEdge;
	d: string;
	width: number;
}

function Arc({
	nodes,
	edges,
	width = 720,
	height = 360,
	nodeRadius = 5,
	onEdgeHover,
	onNodeClick,
	className,
	...rest
}: ArcProps) {
	const laidOut = React.useMemo(() => layout(nodes, edges, width, height), [nodes, edges, width, height]);
	const desc = `Arc diagram with ${nodes.length} node${nodes.length === 1 ? "" : "s"} and ${edges.length} edge${edges.length === 1 ? "" : "s"}`;

	return (
		<svg
			{...rest}
			data-hex-arc
			role="img"
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={cn("block", className)}
		>
			<title>Arc diagram</title>
			<desc>{desc}</desc>
			<g data-hex-arc-edges fill="none">
				{laidOut.edges.map((e, i) => {
					const interactive = Boolean(onEdgeHover);
					const fireHover = (edge: ArcEdge | null) => onEdgeHover?.(edge);
					return (
						<path
							key={`${e.edge.source}-${e.edge.target}-${i}`}
							data-hex-arc-edge
							d={e.d}
							className={interactive ? "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-ring" : undefined}
							stroke="hsl(var(--primary))"
							strokeOpacity={0.5}
							strokeWidth={Math.max(1, e.width)}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={
								interactive
									? `Edge between ${e.edge.source} and ${e.edge.target}${e.edge.value != null ? `, value ${e.edge.value}` : ""}`
									: undefined
							}
							style={{
								cursor: interactive ? "pointer" : undefined,
								transition: "stroke-opacity 120ms ease",
							}}
							onMouseEnter={interactive ? () => fireHover(e.edge) : undefined}
							onMouseLeave={interactive ? () => fireHover(null) : undefined}
							onFocus={interactive ? () => fireHover(e.edge) : undefined}
							onBlur={interactive ? () => fireHover(null) : undefined}
						/>
					);
				})}
			</g>
			<g data-hex-arc-nodes>
				{laidOut.nodes.map((n) => {
					const interactive = Boolean(onNodeClick);
					const handleActivate = () => onNodeClick?.(n.node);
					return (
						<g
							key={n.node.id}
							data-hex-arc-node
							data-depth={n.depth}
							className={interactive ? "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-ring" : undefined}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={interactive ? n.node.label : undefined}
							style={interactive ? { cursor: "pointer" } : undefined}
							onClick={interactive ? handleActivate : undefined}
							onKeyDown={interactive ? (e) => activateOnKey(e, handleActivate) : undefined}
						>
							<circle
								cx={n.x}
								cy={n.y}
								r={nodeRadius}
								fill="hsl(var(--primary))"
								stroke="hsl(var(--background))"
								strokeWidth={2}
							/>
							<text
								x={n.x}
								y={n.y + nodeRadius + 14}
								textAnchor="middle"
								fontSize={10}
								fill="hsl(var(--foreground))"
								style={{ pointerEvents: "none" }}
							>
								{n.node.label}
							</text>
						</g>
					);
				})}
			</g>
		</svg>
	);
}

function layout(
	nodes: ArcNode[],
	edges: ArcEdge[],
	width: number,
	height: number,
): { nodes: LaidOutNode[]; edges: LaidOutEdge[] } {
	if (nodes.length === 0) return { nodes: [], edges: [] };

	const margin = 32;
	const baselineY = height - 32;
	const usable = width - margin * 2;
	const step = nodes.length > 1 ? usable / (nodes.length - 1) : 0;

	const positions = new Map<string, { x: number; y: number; index: number }>();
	const laidOutNodes: LaidOutNode[] = nodes.map((node, i) => {
		// Center the lone node when the input has only one — `step * 0` would
		// otherwise leave it pinned at the left margin.
		const x = nodes.length === 1 ? width / 2 : margin + step * i;
		positions.set(node.id, { x, y: baselineY, index: i });
		return { node, x, y: baselineY, depth: i };
	});

	const maxValue = edges.reduce((m, e) => Math.max(m, e.value ?? 1), 1);

	const laidOutEdges: LaidOutEdge[] = edges
		.map((edge) => {
			const sp = positions.get(edge.source);
			const tp = positions.get(edge.target);
			if (!sp || !tp) return null;
			const [a, b] = sp.x < tp.x ? [sp, tp] : [tp, sp];
			const span = (b.x - a.x) / 2;
			// Cubic bezier with two control points to approximate a clean
			// semicircle without trigonometry. Height scales with span.
			const ctrlY = baselineY - span;
			const d = `M${a.x},${baselineY} C${a.x},${ctrlY} ${b.x},${ctrlY} ${b.x},${baselineY}`;
			return {
				edge,
				d,
				width: 1 + ((edge.value ?? 1) / maxValue) * 3,
			};
		})
		.filter((e): e is LaidOutEdge => e !== null);

	return { nodes: laidOutNodes, edges: laidOutEdges };
}

function activateOnKey(e: React.KeyboardEvent, fn: () => void): void {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

export { Arc };
