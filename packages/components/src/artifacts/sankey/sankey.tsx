"use client";

import * as React from "react";
import { pickChartHue } from "../../lib/chart-palette.js";
import { cn } from "../../lib/utils.js";

/**
 * Weighted-flow diagram. Nodes are arranged in horizontal columns by
 * topological depth; links between them are drawn as smooth curves whose
 * thickness encodes the flow value. Common for funnels, energy/material
 * flows, money flows, or any bipartite/multipartite "value moving from A
 * to B" visualization.
 *
 * Heavy peer: requires `d3-sankey` (~6 KB gzip; pulls in a small slice of
 * d3-shape too). The hex-core CLI's `add` flow prompts before installing.
 *
 * @example
 * <Sankey
 *   nodes={[
 *     { id: "src-a", label: "Source A" },
 *     { id: "src-b", label: "Source B" },
 *     { id: "sink", label: "Sink" },
 *   ]}
 *   links={[
 *     { source: "src-a", target: "sink", value: 30 },
 *     { source: "src-b", target: "sink", value: 10 },
 *   ]}
 * />
 */
export type SankeyNode = {
	id: string;
	label: string;
};

export type SankeyLink = {
	source: string;
	target: string;
	value: number;
};

export interface SankeyProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Node definitions. Every link's `source` and `target` MUST match an `id` in this array. */
	nodes: SankeyNode[];
	/** Weighted links between nodes. Values must be positive. */
	links: SankeyLink[];
	/** Pixel width of the rendered SVG. Default 720. */
	width?: number;
	/** Pixel height of the rendered SVG. Default 420. */
	height?: number;
	/** How nodes within a column are aligned. Default "justify". */
	nodeAlign?: "left" | "right" | "center" | "justify";
	/** Pixel width of each node rectangle. Default 12. */
	nodeWidth?: number;
	/** Vertical pixel gap between nodes in the same column. Default 8. */
	nodePadding?: number;
	/** Fired when a user hovers a link (or hover ends, with `null`). */
	onLinkHover?: (link: SankeyLink | null) => void;
	/** Fired when a node is clicked. */
	onNodeClick?: (node: SankeyNode) => void;
}

interface LaidOutNode {
	original: SankeyNode;
	x0: number;
	x1: number;
	y0: number;
	y1: number;
	/** Index in the consumer-supplied `nodes` array — used to pick a hue
	 * from CHART_PALETTE so adjacent columns read as distinct categories. */
	idx: number;
}

interface LaidOutLink {
	original: SankeyLink;
	d: string;
	width: number;
	/** Index of the source node — links inherit their source's hue so the
	 * eye can trace "where did this volume come from". */
	sourceIdx: number;
}

type D3SankeyMod = typeof import("d3-sankey");

function Sankey({
	nodes,
	links,
	width = 720,
	height = 420,
	nodeAlign = "justify",
	nodeWidth = 12,
	nodePadding = 8,
	onLinkHover,
	onNodeClick,
	className,
	...rest
}: SankeyProps) {
	const [d3s, setD3s] = React.useState<D3SankeyMod | null>(null);

	React.useEffect(() => {
		let cancelled = false;
		void import("d3-sankey").then((mod) => {
			if (!cancelled) setD3s(mod);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	// Memoize the d3-sankey layout pass: it mutates clones every call (heavy
	// for large flows) and parents often re-render with stable nodes/links
	// identity. Hook order is stable since `d3s` only ever transitions
	// null → resolved once.
	const laidOut = React.useMemo(() => {
		if (!d3s) return null;
		return layout(d3s, nodes, links, width, height, nodeAlign, nodeWidth, nodePadding);
	}, [d3s, nodes, links, width, height, nodeAlign, nodeWidth, nodePadding]);

	if (!d3s || !laidOut) {
		return (
			<div
				data-hex-sankey-loading
				aria-busy="true"
				aria-label="Loading Sankey diagram"
				className={cn("inline-block bg-muted/20", className)}
				style={{ width, height }}
			/>
		);
	}

	const { nodes: laidOutNodes, links: laidOutLinks } = laidOut;
	const desc = `Sankey diagram with ${nodes.length} node${nodes.length === 1 ? "" : "s"} and ${links.length} link${links.length === 1 ? "" : "s"}`;

	return (
		<svg
			{...rest}
			data-hex-sankey
			data-node-align={nodeAlign}
			role="img"
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={cn("block", className)}
		>
			<title>Sankey diagram</title>
			<desc>{desc}</desc>
			<g data-hex-sankey-links fill="none">
				{laidOutLinks.map((l, i) => {
					const interactive = Boolean(onLinkHover);
					const fireHover = (link: SankeyLink | null) => onLinkHover?.(link);
					const stroke = pickChartHue(l.sourceIdx);
					return (
						<path
							key={`${l.original.source}-${l.original.target}-${i}`}
							data-hex-sankey-link
							d={l.d}
							stroke={stroke}
							strokeOpacity={0.45}
							strokeWidth={Math.max(1, l.width)}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={interactive ? `Flow: ${l.original.source} → ${l.original.target} (${l.original.value})` : undefined}
							style={{
								cursor: interactive ? "pointer" : undefined,
								transition: "stroke-opacity 120ms ease",
							}}
							onMouseEnter={interactive ? () => fireHover(l.original) : undefined}
							onMouseLeave={interactive ? () => fireHover(null) : undefined}
							onFocus={interactive ? () => fireHover(l.original) : undefined}
							onBlur={interactive ? () => fireHover(null) : undefined}
						/>
					);
				})}
			</g>
			<g data-hex-sankey-nodes>
				{laidOutNodes.map((n) => {
					const w = n.x1 - n.x0;
					const h = n.y1 - n.y0;
					const isRightSide = n.x0 > width / 2;
					const interactive = Boolean(onNodeClick);
					const handleActivate = () => onNodeClick?.(n.original);
					const fill = pickChartHue(n.idx);
					return (
						<g
							key={n.original.id}
							data-hex-sankey-node
							transform={`translate(${n.x0},${n.y0})`}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={interactive ? n.original.label : undefined}
							style={interactive ? { cursor: "pointer" } : undefined}
							onClick={interactive ? handleActivate : undefined}
							onKeyDown={interactive ? (e) => activateOnKey(e, handleActivate) : undefined}
						>
							<rect width={w} height={h} fill={fill} stroke="hsl(var(--background))" />
							<text
								x={isRightSide ? -6 : w + 6}
								y={h / 2}
								dy="0.35em"
								fontSize={12}
								fontWeight={500}
								fill="hsl(var(--foreground))"
								textAnchor={isRightSide ? "end" : "start"}
								style={{ pointerEvents: "none" }}
							>
								{n.original.label}
							</text>
						</g>
					);
				})}
			</g>
		</svg>
	);
}

function layout(
	d3s: D3SankeyMod,
	nodes: SankeyNode[],
	links: SankeyLink[],
	width: number,
	height: number,
	align: "left" | "right" | "center" | "justify",
	nodeWidth: number,
	nodePadding: number,
): { nodes: LaidOutNode[]; links: LaidOutLink[] } {
	const alignFn =
		align === "left"
			? d3s.sankeyLeft
			: align === "right"
			? d3s.sankeyRight
			: align === "center"
			? d3s.sankeyCenter
			: d3s.sankeyJustify;

	// d3-sankey mutates its input — clone so consumer arrays stay pristine.
	const nodesClone = nodes.map((n) => ({ ...n }));
	const linksClone = links.map((l) => ({ ...l }));

	type WorkingNode = SankeyNode & {
		index?: number;
		x0?: number;
		x1?: number;
		y0?: number;
		y1?: number;
	};
	type WorkingLink = SankeyLink & { width?: number };

	const sankeyGen = d3s
		.sankey<WorkingNode, WorkingLink>()
		.nodeId((d) => d.id)
		.nodeAlign(alignFn)
		.nodeWidth(nodeWidth)
		.nodePadding(nodePadding)
		.extent([
			[1, 1],
			[width - 1, height - 1],
		]);

	const result = sankeyGen({ nodes: nodesClone, links: linksClone });
	const linkPath = d3s.sankeyLinkHorizontal<WorkingNode, WorkingLink>();

	// Carry the consumer-supplied node/link by index so future widenings of
	// SankeyNode / SankeyLink (color, group, metadata) round-trip into
	// callbacks without us having to re-cherry-pick fields here.
	const idByIndex = new Map<string, number>();
	nodes.forEach((n, i) => idByIndex.set(n.id, i));

	return {
		nodes: result.nodes.map((n, i) => ({
			original: { ...nodes[i] },
			x0: n.x0 ?? 0,
			x1: n.x1 ?? 0,
			y0: n.y0 ?? 0,
			y1: n.y1 ?? 0,
			idx: i,
		})),
		links: result.links.map((l, i) => {
			// Re-pin source/target to ids — d3-sankey replaced them with the
			// resolved node objects in place, but the consumer-facing shape
			// is `{ source: string, target: string, value: number }`.
			const sourceId = typeof l.source === "string" ? l.source : (l.source as WorkingNode).id;
			const targetId = typeof l.target === "string" ? l.target : (l.target as WorkingNode).id;
			return {
				original: { ...links[i], source: sourceId, target: targetId, value: l.value },
				d: linkPath(l) ?? "",
				width: l.width ?? 1,
				sourceIdx: idByIndex.get(sourceId) ?? 0,
			};
		}),
	};
}

function activateOnKey(e: React.KeyboardEvent, fn: () => void): void {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

export { Sankey };
