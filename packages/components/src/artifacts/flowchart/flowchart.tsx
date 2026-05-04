"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Typed React flowchart. Pass `nodes` (with optional `shape`/`type`) and
 * `edges`; the component runs a topological-rank auto-layout and renders
 * top-to-bottom or left-to-right with directional arrows. Pure SVG; no
 * heavy peer dependency, no DAG-layout library.
 *
 * Distinct from `<Diagram>` (Mermaid string DSL) and `<Canvas>` (free-form
 * ReactFlow). Use Flowchart when you have STRUCTURED data and want a
 * polished SVG without the bundle cost or DSL of those alternatives.
 *
 * @example
 * <Flowchart
 *   nodes={[
 *     { id: "start", label: "Start", shape: "round" },
 *     { id: "check", label: "Authorized?", shape: "diamond" },
 *     { id: "ok", label: "Continue" },
 *     { id: "denied", label: "Reject", shape: "round" },
 *   ]}
 *   edges={[
 *     { source: "start", target: "check" },
 *     { source: "check", target: "ok", label: "yes" },
 *     { source: "check", target: "denied", label: "no" },
 *   ]}
 * />
 */
export type FlowchartNode = {
	id: string;
	label: string;
	/** Visual shape — "rect" (default), "round" (rounded rect, terminal markers), or "diamond" (decision). */
	shape?: "rect" | "round" | "diamond";
	/** Optional explicit rank/depth override; otherwise computed via topological sort. */
	rank?: number;
};

export type FlowchartEdge = {
	source: string;
	target: string;
	label?: string;
};

export interface FlowchartProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Node definitions. Every edge's `source`/`target` MUST match an `id` here. */
	nodes: FlowchartNode[];
	/** Directional edges. The graph MUST be a DAG (no cycles). */
	edges: FlowchartEdge[];
	/** Layout direction. Default "vertical" (top-to-bottom). */
	direction?: "vertical" | "horizontal";
	/** Pixel width of the rendered SVG. Default 720. */
	width?: number;
	/** Pixel height of the rendered SVG. Default 480. */
	height?: number;
	/** Pixel width of each node. Default 140. */
	nodeWidth?: number;
	/** Pixel height of each node. Default 48. */
	nodeHeight?: number;
	/** Fired when a node is clicked. */
	onNodeClick?: (node: FlowchartNode) => void;
}

interface LaidOutNode {
	node: FlowchartNode;
	x: number;
	y: number;
	rank: number;
}

interface LaidOutEdge {
	edge: FlowchartEdge;
	from: { x: number; y: number };
	to: { x: number; y: number };
}

function Flowchart({
	nodes,
	edges,
	direction = "vertical",
	width = 720,
	height = 480,
	nodeWidth = 140,
	nodeHeight = 48,
	onNodeClick,
	className,
	...rest
}: FlowchartProps) {
	const { nodes: laidOutNodes, edges: laidOutEdges } = React.useMemo(
		() => layout(nodes, edges, direction, width, height, nodeWidth, nodeHeight),
		[nodes, edges, direction, width, height, nodeWidth, nodeHeight],
	);
	const desc = `Flowchart with ${nodes.length} node${nodes.length === 1 ? "" : "s"} and ${edges.length} edge${edges.length === 1 ? "" : "s"}, laid out ${direction}`;
	const arrowId = React.useId().replace(/:/g, "-");

	return (
		<svg
			{...rest}
			data-hex-flowchart
			data-direction={direction}
			role="img"
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={cn("block", className)}
		>
			<title>Flowchart</title>
			<desc>{desc}</desc>
			<defs>
				<marker
					id={`hex-flowchart-arrow-${arrowId}`}
					viewBox="0 0 10 10"
					refX="10"
					refY="5"
					markerWidth="6"
					markerHeight="6"
					orient="auto-start-reverse"
				>
					<path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" />
				</marker>
			</defs>
			<g data-hex-flowchart-edges>
				{laidOutEdges.map((e, i) => (
					<g key={`${e.edge.source}-${e.edge.target}-${i}`} data-hex-flowchart-edge>
						<path
							d={edgePath(e.from, e.to, direction)}
							fill="none"
							stroke="hsl(var(--muted-foreground))"
							strokeOpacity={0.7}
							strokeWidth={1.25}
							markerEnd={`url(#hex-flowchart-arrow-${arrowId})`}
						/>
						{e.edge.label ? (
							<text
								x={(e.from.x + e.to.x) / 2}
								y={(e.from.y + e.to.y) / 2 - 4}
								textAnchor="middle"
								fontSize={10}
								fill="hsl(var(--muted-foreground))"
								style={{
									paintOrder: "stroke",
								}}
								stroke="hsl(var(--background))"
								strokeWidth={3}
								strokeLinejoin="round"
							>
								{e.edge.label}
							</text>
						) : null}
					</g>
				))}
			</g>
			<g data-hex-flowchart-nodes>
				{laidOutNodes.map((n) => {
					const shape = n.node.shape ?? "rect";
					const interactive = Boolean(onNodeClick);
					const handleActivate = () => onNodeClick?.(n.node);
					const truncated = truncate(n.node.label, Math.floor((nodeWidth - 16) / 7));
					const isTruncated = truncated !== n.node.label;
					return (
						<g
							key={n.node.id}
							data-hex-flowchart-node
							data-shape={shape}
							data-rank={n.rank}
							transform={`translate(${n.x - nodeWidth / 2},${n.y - nodeHeight / 2})`}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={interactive ? n.node.label : undefined}
							style={interactive ? { cursor: "pointer" } : undefined}
							onClick={interactive ? handleActivate : undefined}
							onKeyDown={interactive ? (e) => activateOnKey(e, handleActivate) : undefined}
						>
							{/* Native SVG tooltip for the full label — recovers any text
							    truncated by the heuristic without relying on font metrics. */}
							{isTruncated ? <title>{n.node.label}</title> : null}
							{shape === "diamond" ? (
								<polygon
									points={`${nodeWidth / 2},0 ${nodeWidth},${nodeHeight / 2} ${nodeWidth / 2},${nodeHeight} 0,${nodeHeight / 2}`}
									fill="hsl(var(--card))"
									stroke="hsl(var(--border))"
									strokeWidth={1}
								/>
							) : (
								<rect
									width={nodeWidth}
									height={nodeHeight}
									rx={shape === "round" ? nodeHeight / 2 : 6}
									ry={shape === "round" ? nodeHeight / 2 : 6}
									fill="hsl(var(--card))"
									stroke="hsl(var(--border))"
									strokeWidth={1}
								/>
							)}
							<text
								x={nodeWidth / 2}
								y={nodeHeight / 2}
								dy="0.35em"
								textAnchor="middle"
								fontSize={12}
								fontWeight={500}
								fill="hsl(var(--foreground))"
								style={{ pointerEvents: "none" }}
							>
								{truncated}
							</text>
						</g>
					);
				})}
			</g>
		</svg>
	);
}

function layout(
	nodes: FlowchartNode[],
	edges: FlowchartEdge[],
	direction: "vertical" | "horizontal",
	width: number,
	height: number,
	nodeWidth: number,
	nodeHeight: number,
): { nodes: LaidOutNode[]; edges: LaidOutEdge[] } {
	if (nodes.length === 0) return { nodes: [], edges: [] };

	const byId = new Map(nodes.map((n) => [n.id, n]));
	const ranks = computeRanks(nodes, edges, byId);
	const maxRank = Math.max(...ranks.values(), 0);

	// Group node ids by rank.
	const rankGroups = new Map<number, string[]>();
	for (const n of nodes) {
		const r = ranks.get(n.id) ?? 0;
		const arr = rankGroups.get(r) ?? [];
		arr.push(n.id);
		rankGroups.set(r, arr);
	}

	// Single-pass barycenter sweep: at each rank > 0, sort the rank's nodes
	// by the mean cross-axis index of their parents at the previous rank. Cuts
	// most edge crossings without pulling in dagre / elkjs. The first rank
	// keeps insertion order — that anchors the rest of the sweep.
	const parentsOf = new Map<string, string[]>();
	for (const n of nodes) parentsOf.set(n.id, []);
	for (const e of edges) {
		const arr = parentsOf.get(e.target);
		if (arr && byId.has(e.source)) arr.push(e.source);
	}
	const orderInRank = new Map<string, number>();
	for (let r = 0; r <= maxRank; r++) {
		const group = rankGroups.get(r) ?? [];
		if (r > 0) {
			group.sort((a, b) => meanParentIndex(a, parentsOf, orderInRank) - meanParentIndex(b, parentsOf, orderInRank));
		}
		group.forEach((id, i) => orderInRank.set(id, i));
	}

	const positions = new Map<string, { x: number; y: number; rank: number }>();
	const margin = 32;
	const usableMain = (direction === "vertical" ? height : width) - margin * 2;
	const usableCross = (direction === "vertical" ? width : height) - margin * 2;
	const rankCount = maxRank + 1;
	const mainStep = rankCount > 1 ? usableMain / (rankCount - 1) : 0;

	for (let r = 0; r <= maxRank; r++) {
		const group = rankGroups.get(r) ?? [];
		const crossStep = group.length > 0 ? usableCross / (group.length + 1) : 0;
		group.forEach((id, i) => {
			const cross = margin + crossStep * (i + 1);
			const main = margin + mainStep * r;
			if (direction === "vertical") {
				positions.set(id, { x: cross, y: main, rank: r });
			} else {
				positions.set(id, { x: main, y: cross, rank: r });
			}
		});
	}

	const laidOutNodes: LaidOutNode[] = nodes.map((n) => {
		const p = positions.get(n.id) ?? { x: 0, y: 0, rank: 0 };
		return { node: n, x: p.x, y: p.y, rank: p.rank };
	});

	const laidOutEdges: LaidOutEdge[] = edges
		.map((edge) => {
			const sp = positions.get(edge.source);
			const tp = positions.get(edge.target);
			if (!sp || !tp) return null;
			// Connect from the appropriate edge of the source to the appropriate edge of the target
			const from =
				direction === "vertical"
					? { x: sp.x, y: sp.y + nodeHeight / 2 }
					: { x: sp.x + nodeWidth / 2, y: sp.y };
			const to =
				direction === "vertical"
					? { x: tp.x, y: tp.y - nodeHeight / 2 }
					: { x: tp.x - nodeWidth / 2, y: tp.y };
			return { edge, from, to };
		})
		.filter((e): e is LaidOutEdge => e !== null);

	return { nodes: laidOutNodes, edges: laidOutEdges };
}

function meanParentIndex(
	id: string,
	parentsOf: Map<string, string[]>,
	orderInRank: Map<string, number>,
): number {
	const parents = parentsOf.get(id) ?? [];
	if (parents.length === 0) return Number.POSITIVE_INFINITY; // sort orphans last
	let sum = 0;
	let count = 0;
	for (const p of parents) {
		const idx = orderInRank.get(p);
		if (idx != null) {
			sum += idx;
			count++;
		}
	}
	return count === 0 ? Number.POSITIVE_INFINITY : sum / count;
}

/**
 * Compute the rank (0-indexed depth) of each node via topological longest-path.
 * Honors any explicit `rank` overrides on the input nodes.
 *
 * Cycles: nodes inside a cycle resolve to 0. Crucially the cycle-touched
 * value is NOT memoized — the previous version cached the placeholder under
 * the first node along the cycle and poisoned every later descendant of that
 * node, even paths that didn't touch the cycle. The schema's `commonMistakes`
 * still warns DAG-only, but the failure mode is now contained to the
 * actually-cyclic nodes rather than spreading downstream.
 */
function computeRanks(
	nodes: FlowchartNode[],
	edges: FlowchartEdge[],
	byId: Map<string, FlowchartNode>,
): Map<string, number> {
	const ranks = new Map<string, number>();
	const incoming = new Map<string, string[]>();
	for (const n of nodes) incoming.set(n.id, []);
	for (const e of edges) {
		const arr = incoming.get(e.target);
		if (arr && byId.has(e.source)) arr.push(e.source);
	}
	const memo = new Map<string, number>();
	const visiting = new Set<string>();

	const rankOf = (id: string): number => {
		const cached = memo.get(id);
		if (cached !== undefined) return cached;
		if (visiting.has(id)) return 0; // cycle short-circuit (NOT memoized)
		visiting.add(id);
		try {
			const node = byId.get(id);
			if (node?.rank != null) {
				memo.set(id, node.rank);
				return node.rank;
			}
			const parents = incoming.get(id) ?? [];
			const r = parents.length === 0 ? 0 : 1 + Math.max(...parents.map((p) => rankOf(p)));
			memo.set(id, r);
			return r;
		} finally {
			visiting.delete(id);
		}
	};

	for (const n of nodes) ranks.set(n.id, rankOf(n.id));
	return ranks;
}

function edgePath(
	from: { x: number; y: number },
	to: { x: number; y: number },
	direction: "vertical" | "horizontal",
): string {
	if (direction === "vertical") {
		const my = (from.y + to.y) / 2;
		return `M${from.x},${from.y} C${from.x},${my} ${to.x},${my} ${to.x},${to.y}`;
	}
	const mx = (from.x + to.x) / 2;
	return `M${from.x},${from.y} C${mx},${from.y} ${mx},${to.y} ${to.x},${to.y}`;
}

function truncate(s: string, max: number): string {
	if (s.length <= max) return s;
	return `${s.slice(0, Math.max(1, max - 1))}…`;
}

function activateOnKey(e: React.KeyboardEvent, fn: () => void): void {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

export { Flowchart };
