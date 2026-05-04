"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Typed React MindMap. Pass a hierarchical `root` node and the component lays
 * the children out radially (or horizontally) using d3-hierarchy's tree
 * layout. No Mermaid string parsing — the data shape IS the API, so consumers
 * can build mind maps from typed application state instead of templating a
 * DSL.
 *
 * Heavy peer: requires `d3-hierarchy` (~3 KB gzip). The hex-core CLI's `add`
 * flow prompts before installing.
 *
 * @example
 * <MindMap
 *   root={{
 *     id: "root",
 *     label: "Project",
 *     children: [
 *       { id: "ui", label: "UI", children: [{ id: "btn", label: "Button" }] },
 *       { id: "api", label: "API" },
 *     ],
 *   }}
 * />
 */
export type MindMapNode = {
	id: string;
	label: string;
	children?: MindMapNode[];
	data?: unknown;
};

export interface MindMapProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Root of the hierarchy. */
	root: MindMapNode;
	/** "radial" lays children around the root; "horizontal" runs left→right. Default "radial". */
	orientation?: "radial" | "horizontal";
	/** Pixel width of the rendered SVG. Default 600. */
	width?: number;
	/** Pixel height of the rendered SVG. Default 400. */
	height?: number;
	/** Fired when a node is clicked. */
	onNodeClick?: (node: MindMapNode) => void;
}

interface LaidOutNode {
	node: MindMapNode;
	x: number;
	y: number;
	depth: number;
}

interface LaidOutLink {
	source: { x: number; y: number };
	target: { x: number; y: number };
	id: string;
}

type D3HierarchyMod = typeof import("d3-hierarchy");

function MindMap({
	root,
	orientation = "radial",
	width = 600,
	height = 400,
	onNodeClick,
	className,
	...rest
}: MindMapProps) {
	const [d3h, setD3h] = React.useState<D3HierarchyMod | null>(null);

	React.useEffect(() => {
		let cancelled = false;
		void import("d3-hierarchy").then((mod) => {
			if (!cancelled) setD3h(mod);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	if (!d3h) {
		return (
			<div
				data-hex-mind-map-loading
				aria-busy="true"
				className={cn("inline-block bg-muted/20", className)}
				style={{ width, height }}
			/>
		);
	}

	const { nodes, links, viewBox } = layout(d3h, root, orientation, width, height);
	const nodeCount = nodes.length;
	const desc = `Mind map with ${nodeCount} node${nodeCount === 1 ? "" : "s"}, rooted at "${root.label}"`;

	return (
		<svg
			{...rest}
			data-hex-mind-map
			data-orientation={orientation}
			role="img"
			viewBox={viewBox}
			width={width}
			height={height}
			className={cn("block", className)}
		>
			<title>Mind map</title>
			<desc>{desc}</desc>
			<g data-hex-mind-map-links>
				{links.map((l) => (
					<path
						key={l.id}
						d={linkPath(l, orientation)}
						fill="none"
						stroke="hsl(var(--primary))"
						strokeOpacity={0.5}
						strokeWidth={1.5}
					/>
				))}
			</g>
			<g data-hex-mind-map-nodes>
				{nodes.map((n) => (
					<g
						key={n.node.id}
						data-hex-mind-map-node
						data-depth={n.depth}
						transform={`translate(${n.x},${n.y})`}
						style={onNodeClick ? { cursor: "pointer" } : undefined}
						onClick={onNodeClick ? () => onNodeClick(n.node) : undefined}
					>
						<circle
							r={4}
							fill="hsl(var(--primary))"
							stroke="hsl(var(--background))"
							strokeWidth={2}
						/>
						<text
							x={8}
							y={4}
							fontSize={12}
							fill="hsl(var(--foreground))"
							style={{ paintOrder: "stroke" }}
							stroke="hsl(var(--background))"
							strokeWidth={3}
							strokeLinejoin="round"
						>
							{n.node.label}
						</text>
					</g>
				))}
			</g>
		</svg>
	);
}

function layout(
	d3h: D3HierarchyMod,
	root: MindMapNode,
	orientation: "radial" | "horizontal",
	width: number,
	height: number,
): { nodes: LaidOutNode[]; links: LaidOutLink[]; viewBox: string } {
	const hierarchy = d3h.hierarchy<MindMapNode>(root);

	if (orientation === "radial") {
		const radius = Math.min(width, height) / 2 - 16;
		// d3.tree(hierarchy) returns the layout-mutated root typed as
		// HierarchyPointNode<T> — its `x`/`y` are populated by the call.
		const layoutRoot = d3h.tree<MindMapNode>().size([2 * Math.PI, radius])(hierarchy);
		const nodes: LaidOutNode[] = [];
		const links: LaidOutLink[] = [];
		layoutRoot.each((d) => {
			const point = polarToCartesian(d.x, d.y);
			nodes.push({ node: d.data, x: point.x, y: point.y, depth: d.depth });
		});
		layoutRoot.links().forEach((link, i) => {
			const sPt = polarToCartesian(link.source.x, link.source.y);
			const tPt = polarToCartesian(link.target.x, link.target.y);
			links.push({ source: sPt, target: tPt, id: `l-${i}` });
		});
		const half = Math.min(width, height) / 2;
		return {
			nodes,
			links,
			viewBox: `${-half} ${-half} ${2 * half} ${2 * half}`,
		};
	}

	const layoutRoot = d3h.tree<MindMapNode>().size([height - 32, width - 200])(hierarchy);
	const nodes: LaidOutNode[] = [];
	const links: LaidOutLink[] = [];
	layoutRoot.each((d) => {
		// Horizontal: swap d3's (x, y) so depth runs along the SVG x-axis.
		nodes.push({ node: d.data, x: d.y, y: d.x, depth: d.depth });
	});
	layoutRoot.links().forEach((link, i) => {
		links.push({
			source: { x: link.source.y, y: link.source.x },
			target: { x: link.target.y, y: link.target.x },
			id: `l-${i}`,
		});
	});
	return {
		nodes,
		links,
		viewBox: `0 0 ${width} ${height}`,
	};
}

function polarToCartesian(angle: number, radius: number): { x: number; y: number } {
	return {
		x: radius * Math.cos(angle - Math.PI / 2),
		y: radius * Math.sin(angle - Math.PI / 2),
	};
}

function linkPath(link: LaidOutLink, orientation: "radial" | "horizontal"): string {
	const { source: s, target: t } = link;
	if (orientation === "horizontal") {
		const mx = (s.x + t.x) / 2;
		return `M${s.x},${s.y} C${mx},${s.y} ${mx},${t.y} ${t.x},${t.y}`;
	}
	return `M${s.x},${s.y} C${s.x},${(s.y + t.y) / 2} ${t.x},${(s.y + t.y) / 2} ${t.x},${t.y}`;
}

export { MindMap };
