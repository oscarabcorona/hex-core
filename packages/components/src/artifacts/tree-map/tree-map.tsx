"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Typed React TreeMap. Each leaf is rendered as a rectangle whose area is
 * proportional to its `value`. Internal node values are summed automatically;
 * d3-hierarchy's squarified treemap layout keeps rectangles close to square
 * for legibility.
 *
 * Heavy peer: requires `d3-hierarchy` (~3 KB gzip).
 *
 * @example
 * <TreeMap
 *   root={{
 *     id: "root",
 *     label: "Files",
 *     children: [
 *       { id: "src", label: "src", value: 240 },
 *       { id: "node_modules", label: "node_modules", value: 980 },
 *     ],
 *   }}
 * />
 */
export type TreeMapNode = {
	id: string;
	label: string;
	value?: number;
	children?: TreeMapNode[];
};

export interface TreeMapProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Root of the hierarchy. Leaves require a positive `value`. */
	root: TreeMapNode;
	/** Pixel width of the rendered SVG. Default 600. */
	width?: number;
	/** Pixel height of the rendered SVG. Default 400. */
	height?: number;
	/** Inner padding between sibling rectangles, in pixels. Default 2. */
	padding?: number;
	/** Tiling algorithm. "squarify" (default) keeps rectangles close to square. */
	tile?: "squarify" | "binary" | "slice-dice";
	/** Choose a fill color per leaf. "depth" cycles through theme tokens; "value" interpolates by value; or pass a function. */
	colorBy?: "depth" | "value" | ((node: TreeMapNode, depth: number) => string);
	/** Fired when a leaf is clicked. */
	onLeafClick?: (node: TreeMapNode) => void;
}

interface LaidOutLeaf {
	node: TreeMapNode;
	depth: number;
	x0: number;
	y0: number;
	x1: number;
	y1: number;
	value: number;
}

type D3HierarchyMod = typeof import("d3-hierarchy");

const DEPTH_PALETTE = [
	"hsl(var(--primary))",
	"hsl(var(--accent))",
	"hsl(var(--secondary))",
	"hsl(var(--muted))",
];

function TreeMap({
	root,
	width = 600,
	height = 400,
	padding = 2,
	tile = "squarify",
	colorBy = "depth",
	onLeafClick,
	className,
	...rest
}: TreeMapProps) {
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
				data-hex-tree-map-loading
				aria-busy="true"
				className={cn("inline-block bg-muted/20", className)}
				style={{ width, height }}
			/>
		);
	}

	const leaves = layout(d3h, root, width, height, padding, tile);
	const maxValue = leaves.reduce((m, l) => (l.value > m ? l.value : m), 0) || 1;
	const desc = `Tree map of ${leaves.length} leaf${leaves.length === 1 ? "" : "s"}, rooted at "${root.label}"`;

	return (
		<svg
			{...rest}
			data-hex-tree-map
			data-tile={tile}
			role="img"
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={cn("block", className)}
		>
			<title>Tree map</title>
			<desc>{desc}</desc>
			{leaves.map((l) => {
				const w = l.x1 - l.x0;
				const h = l.y1 - l.y0;
				const fill = resolveFill(l, maxValue, colorBy);
				return (
					<g
						key={l.node.id}
						data-hex-tree-map-leaf
						data-depth={l.depth}
						transform={`translate(${l.x0},${l.y0})`}
						style={onLeafClick ? { cursor: "pointer" } : undefined}
						onClick={onLeafClick ? () => onLeafClick(l.node) : undefined}
					>
						<rect
							width={w}
							height={h}
							fill={fill}
							stroke="hsl(var(--background))"
							strokeWidth={1}
						/>
						{w > 40 && h > 16 ? (
							<text
								x={4}
								y={14}
								fontSize={11}
								fill="hsl(var(--foreground))"
								style={{ pointerEvents: "none" }}
							>
								{l.node.label}
							</text>
						) : null}
					</g>
				);
			})}
		</svg>
	);
}

function layout(
	d3h: D3HierarchyMod,
	root: TreeMapNode,
	width: number,
	height: number,
	padding: number,
	tile: "squarify" | "binary" | "slice-dice",
): LaidOutLeaf[] {
	const tileFn = tile === "binary" ? d3h.treemapBinary : tile === "slice-dice" ? d3h.treemapSliceDice : d3h.treemapSquarify;
	const hierarchy = d3h
		.hierarchy<TreeMapNode>(root)
		.sum((d) => (d.children && d.children.length > 0 ? 0 : d.value ?? 0))
		.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
	// treemap(hierarchy) returns HierarchyRectangularNode<T> with typed
	// x0/x1/y0/y1 (pixel coords).
	const layoutRoot = d3h
		.treemap<TreeMapNode>()
		.tile(tileFn)
		.size([width, height])
		.padding(padding)(hierarchy);
	return layoutRoot.leaves().map((leaf) => ({
		node: leaf.data,
		depth: leaf.depth,
		x0: leaf.x0,
		y0: leaf.y0,
		x1: leaf.x1,
		y1: leaf.y1,
		value: leaf.value ?? 0,
	}));
}

function resolveFill(
	leaf: LaidOutLeaf,
	maxValue: number,
	colorBy: TreeMapProps["colorBy"],
): string {
	if (typeof colorBy === "function") return colorBy(leaf.node, leaf.depth);
	if (colorBy === "value") {
		const t = Math.max(0.15, Math.min(1, leaf.value / maxValue));
		return `hsl(var(--primary) / ${t.toFixed(2)})`;
	}
	return DEPTH_PALETTE[leaf.depth % DEPTH_PALETTE.length] ?? "hsl(var(--primary))";
}

export { TreeMap };
