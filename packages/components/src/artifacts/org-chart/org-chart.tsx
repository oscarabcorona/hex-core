"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Top-down organizational chart. Pass a hierarchy of people / teams / units
 * and the component lays them out vertically using d3-hierarchy's tree
 * layout. Nodes can be collapsed by clicking; collapsed branches contribute
 * a "+N" badge but no further layout.
 *
 * Heavy peer: requires `d3-hierarchy` (~3 KB gzip).
 *
 * @example
 * <OrgChart
 *   root={{
 *     id: "ceo",
 *     label: "Jane Doe",
 *     subtitle: "CEO",
 *     children: [
 *       { id: "cto", label: "Bob Smith", subtitle: "CTO" },
 *     ],
 *   }}
 * />
 */
export type OrgNode = {
	id: string;
	label: string;
	subtitle?: string;
	avatarUrl?: string;
	children?: OrgNode[];
};

export interface OrgChartProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Root of the org hierarchy. */
	root: OrgNode;
	/** Allow nodes to be clicked to collapse their subtree. Default true. */
	collapsible?: boolean;
	/** All nodes deeper than this depth render collapsed by default. Default Infinity (all expanded). */
	defaultExpandedDepth?: number;
	/** Pixel width of each node card. Default 180. */
	nodeWidth?: number;
	/** Pixel height of each node card. Default 64. */
	nodeHeight?: number;
	/** Pixel width of the rendered SVG. Default 800. */
	width?: number;
	/** Pixel height of the rendered SVG. Default 480. */
	height?: number;
	/** Fired when a node is clicked. Fires before any internal collapse toggle. */
	onNodeClick?: (node: OrgNode) => void;
}

interface LaidOut {
	node: OrgNode;
	x: number;
	y: number;
	depth: number;
	collapsedCount: number;
}

interface LaidOutLink {
	source: { x: number; y: number };
	target: { x: number; y: number };
	id: string;
}

type D3HierarchyMod = typeof import("d3-hierarchy");

function OrgChart({
	root,
	collapsible = true,
	defaultExpandedDepth = Number.POSITIVE_INFINITY,
	nodeWidth = 180,
	nodeHeight = 64,
	width = 800,
	height = 480,
	onNodeClick,
	className,
	...rest
}: OrgChartProps) {
	const [d3h, setD3h] = React.useState<D3HierarchyMod | null>(null);
	const [collapsed, setCollapsed] = React.useState<Set<string>>(() => seedCollapsed(root, defaultExpandedDepth));

	React.useEffect(() => {
		let cancelled = false;
		void import("d3-hierarchy").then((mod) => {
			if (!cancelled) setD3h(mod);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	// Reset collapsed state when the root reference changes — otherwise stale
	// ids accumulate across data swaps (memory leak + phantom collapses if ids
	// happen to be reused). Mirrors Sunburst's focusId reset.
	React.useEffect(() => {
		setCollapsed(seedCollapsed(root, defaultExpandedDepth));
	}, [root, defaultExpandedDepth]);

	if (!d3h) {
		return (
			<div
				data-hex-org-chart-loading
				aria-busy="true"
				className={cn("inline-block bg-muted/20", className)}
				style={{ width, height }}
			/>
		);
	}

	const { nodes, links } = layout(d3h, root, collapsed, width, height, nodeHeight);
	const desc = `Organizational chart with ${nodes.length} visible node${nodes.length === 1 ? "" : "s"}, rooted at "${root.label}"`;

	const handleClick = (node: OrgNode) => {
		onNodeClick?.(node);
		if (!collapsible) return;
		const hasChildren = node.children && node.children.length > 0;
		if (!hasChildren) return;
		setCollapsed((prev) => {
			const next = new Set(prev);
			if (next.has(node.id)) next.delete(node.id);
			else next.add(node.id);
			return next;
		});
	};

	return (
		<svg
			{...rest}
			data-hex-org-chart
			role="img"
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={cn("block", className)}
		>
			<title>Org chart</title>
			<desc>{desc}</desc>
			<g data-hex-org-chart-links>
				{links.map((l) => (
					<path
						key={l.id}
						d={`M${l.source.x},${l.source.y} C${l.source.x},${(l.source.y + l.target.y) / 2} ${l.target.x},${(l.source.y + l.target.y) / 2} ${l.target.x},${l.target.y}`}
						fill="none"
						stroke="hsl(var(--muted-foreground))"
						strokeOpacity={0.5}
						strokeWidth={1}
					/>
				))}
			</g>
			<g data-hex-org-chart-nodes>
				{nodes.map((n) => (
					<g
						key={n.node.id}
						data-hex-org-chart-node
						data-depth={n.depth}
						transform={`translate(${n.x - nodeWidth / 2},${n.y - nodeHeight / 2})`}
						style={collapsible || onNodeClick ? { cursor: "pointer" } : undefined}
						onClick={collapsible || onNodeClick ? () => handleClick(n.node) : undefined}
					>
						<rect
							width={nodeWidth}
							height={nodeHeight}
							rx={8}
							ry={8}
							fill="hsl(var(--card))"
							stroke="hsl(var(--border))"
							strokeWidth={1}
						/>
						<text
							x={12}
							y={24}
							fontSize={13}
							fontWeight={600}
							fill="hsl(var(--foreground))"
						>
							{truncate(n.node.label, Math.floor((nodeWidth - 24) / 7))}
						</text>
						{n.node.subtitle ? (
							<text
								x={12}
								y={42}
								fontSize={11}
								fill="hsl(var(--muted-foreground))"
							>
								{truncate(n.node.subtitle, Math.floor((nodeWidth - 24) / 6))}
							</text>
						) : null}
						{n.collapsedCount > 0 ? (
							<g transform={`translate(${nodeWidth - 28},${nodeHeight - 18})`}>
								<rect
									width={20}
									height={14}
									rx={7}
									ry={7}
									fill="hsl(var(--primary))"
									opacity={0.85}
								/>
								<text
									x={10}
									y={10}
									fontSize={9}
									fontWeight={600}
									fill="hsl(var(--primary-foreground))"
									textAnchor="middle"
								>
									{`+${n.collapsedCount}`}
								</text>
							</g>
						) : null}
					</g>
				))}
			</g>
		</svg>
	);
}

function seedCollapsed(root: OrgNode, maxDepth: number): Set<string> {
	if (!Number.isFinite(maxDepth)) return new Set();
	const collapsed = new Set<string>();
	const walk = (n: OrgNode, depth: number) => {
		if (depth >= maxDepth && n.children && n.children.length > 0) {
			collapsed.add(n.id);
			return;
		}
		n.children?.forEach((c) => walk(c, depth + 1));
	};
	walk(root, 0);
	return collapsed;
}

function layout(
	d3h: D3HierarchyMod,
	root: OrgNode,
	collapsed: Set<string>,
	width: number,
	height: number,
	nodeHeight: number,
): { nodes: LaidOut[]; links: LaidOutLink[] } {
	// Pre-build an id → original-node map so collapsed-count lookup is O(1) per
	// node (vs O(N) DFS), keeping the whole layout pass O(N) for trees up to a
	// few thousand nodes.
	const indexById = new Map<string, OrgNode>();
	indexNodes(root, indexById);

	const visible = pruneCollapsed(root, collapsed);
	const hierarchy = d3h.hierarchy<OrgNode>(visible);
	const layoutRoot = d3h.tree<OrgNode>().size([width - 32, height - nodeHeight])(hierarchy);
	const nodes: LaidOut[] = [];
	layoutRoot.each((d) => {
		const original = indexById.get(d.data.id);
		const collapsedCount = collapsed.has(d.data.id) && original ? countDescendants(original) : 0;
		nodes.push({ node: d.data, x: d.x + 16, y: d.y + nodeHeight / 2, depth: d.depth, collapsedCount });
	});
	const links: LaidOutLink[] = layoutRoot.links().map((link, i) => ({
		source: { x: link.source.x + 16, y: link.source.y + nodeHeight / 2 },
		target: { x: link.target.x + 16, y: link.target.y + nodeHeight / 2 },
		id: `l-${i}`,
	}));
	return { nodes, links };
}

function pruneCollapsed(node: OrgNode, collapsed: Set<string>): OrgNode {
	if (collapsed.has(node.id)) {
		return { ...node, children: undefined };
	}
	if (!node.children || node.children.length === 0) return node;
	return { ...node, children: node.children.map((c) => pruneCollapsed(c, collapsed)) };
}

function indexNodes(node: OrgNode, out: Map<string, OrgNode>): void {
	out.set(node.id, node);
	if (!node.children) return;
	for (const c of node.children) indexNodes(c, out);
}

function countDescendants(node: OrgNode): number {
	if (!node.children || node.children.length === 0) return 0;
	return node.children.reduce((sum, c) => sum + 1 + countDescendants(c), 0);
}

function truncate(s: string, max: number): string {
	if (s.length <= max) return s;
	return `${s.slice(0, Math.max(1, max - 1))}…`;
}

export { OrgChart };
