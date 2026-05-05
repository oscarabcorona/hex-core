"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Clustering tree where every leaf sits at the same depth, regardless of
 * branch length — the visual signature of taxonomies, phylogenetic trees,
 * and hierarchical-clustering output. Backed by d3-hierarchy's `cluster`
 * layout (distinct from `tree`, which packs leaves variably).
 *
 * Heavy peer: requires `d3-hierarchy` (~3 KB gzip).
 *
 * @example
 * <Dendrogram
 *   root={{
 *     id: "root", label: "Animals",
 *     children: [
 *       { id: "mammals", label: "Mammals", children: [
 *         { id: "cat", label: "Cat" },
 *         { id: "dog", label: "Dog" },
 *       ]},
 *       { id: "birds", label: "Birds", children: [{ id: "robin", label: "Robin" }] },
 *     ],
 *   }}
 * />
 */
export type DendrogramNode = {
	id: string;
	label: string;
	children?: DendrogramNode[];
};

export interface DendrogramProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Root of the hierarchy. */
	root: DendrogramNode;
	/** "horizontal" runs root-to-leaves left→right; "vertical" runs top→bottom. Default "horizontal". */
	orientation?: "horizontal" | "vertical";
	/** "step" draws right-angle elbow links (taxonomy aesthetic); "diagonal" uses smooth Bezier. Default "step". */
	linkShape?: "step" | "diagonal";
	/** Pixel width of the rendered SVG. Default 600. */
	width?: number;
	/** Pixel height of the rendered SVG. Default 400. */
	height?: number;
	/** Fired when a leaf is clicked. */
	onLeafClick?: (node: DendrogramNode) => void;
}

interface LaidOutNode {
	node: DendrogramNode;
	x: number;
	y: number;
	depth: number;
	isLeaf: boolean;
}

interface LaidOutLink {
	source: { x: number; y: number };
	target: { x: number; y: number };
	id: string;
}

type D3HierarchyMod = typeof import("d3-hierarchy");

function Dendrogram({
	root,
	orientation = "horizontal",
	linkShape = "step",
	width = 600,
	height = 400,
	onLeafClick,
	className,
	...rest
}: DendrogramProps) {
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
				data-hex-dendrogram-loading
				aria-busy="true"
				className={cn("inline-block bg-muted/20", className)}
				style={{ width, height }}
			/>
		);
	}

	const { nodes, links } = layout(d3h, root, orientation, width, height);
	const leafCount = nodes.filter((n) => n.isLeaf).length;
	const desc = `Dendrogram with ${leafCount} leaves, rooted at "${root.label}"`;

	return (
		<svg
			{...rest}
			data-hex-dendrogram
			data-orientation={orientation}
			data-link-shape={linkShape}
			role="img"
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={cn("block", className)}
		>
			<title>Dendrogram</title>
			<desc>{desc}</desc>
			<g data-hex-dendrogram-links>
				{links.map((l) => (
					<path
						key={l.id}
						d={linkPath(l, orientation, linkShape)}
						fill="none"
						stroke="hsl(var(--muted-foreground))"
						strokeOpacity={0.8}
						strokeWidth={1}
					/>
				))}
			</g>
			<g data-hex-dendrogram-nodes>
				{nodes.map((n) => (
					<g
						key={n.node.id}
						data-hex-dendrogram-node
						data-leaf={n.isLeaf ? "true" : "false"}
						data-depth={n.depth}
						transform={`translate(${n.x},${n.y})`}
						style={n.isLeaf && onLeafClick ? { cursor: "pointer" } : undefined}
						onClick={n.isLeaf && onLeafClick ? () => onLeafClick(n.node) : undefined}
					>
						<circle
							r={n.isLeaf ? 3 : 2}
							fill={n.isLeaf ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
						/>
						{n.isLeaf ? (
							<text
								x={orientation === "horizontal" ? 6 : 0}
								y={orientation === "horizontal" ? 4 : 14}
								textAnchor={orientation === "horizontal" ? "start" : "middle"}
								fontSize={11}
								fill="hsl(var(--foreground))"
								style={{ paintOrder: "stroke" }}
								stroke="hsl(var(--background))"
								strokeWidth={3}
								strokeLinejoin="round"
							>
								{n.node.label}
							</text>
						) : null}
					</g>
				))}
			</g>
		</svg>
	);
}

function layout(
	d3h: D3HierarchyMod,
	root: DendrogramNode,
	orientation: "horizontal" | "vertical",
	width: number,
	height: number,
): { nodes: LaidOutNode[]; links: LaidOutLink[] } {
	const hierarchy = d3h.hierarchy<DendrogramNode>(root);
	const clusterFn = d3h.cluster<DendrogramNode>();
	if (orientation === "horizontal") {
		clusterFn.size([height - 32, width - 120]);
	} else {
		clusterFn.size([width - 32, height - 64]);
	}
	// cluster(hierarchy) returns HierarchyPointNode<T> with typed x/y.
	const layoutRoot = clusterFn(hierarchy);

	const nodes: LaidOutNode[] = [];
	layoutRoot.each((d) => {
		const isLeaf = !d.children || d.children.length === 0;
		if (orientation === "horizontal") {
			nodes.push({ node: d.data, x: d.y + 16, y: d.x + 16, depth: d.depth, isLeaf });
		} else {
			nodes.push({ node: d.data, x: d.x + 16, y: d.y + 16, depth: d.depth, isLeaf });
		}
	});

	const links: LaidOutLink[] = layoutRoot.links().map((link, i) => {
		if (orientation === "horizontal") {
			return {
				source: { x: link.source.y + 16, y: link.source.x + 16 },
				target: { x: link.target.y + 16, y: link.target.x + 16 },
				id: `l-${i}`,
			};
		}
		return {
			source: { x: link.source.x + 16, y: link.source.y + 16 },
			target: { x: link.target.x + 16, y: link.target.y + 16 },
			id: `l-${i}`,
		};
	});

	return { nodes, links };
}

function linkPath(
	link: LaidOutLink,
	orientation: "horizontal" | "vertical",
	linkShape: "step" | "diagonal",
): string {
	const { source: s, target: t } = link;
	if (linkShape === "step") {
		if (orientation === "horizontal") {
			return `M${s.x},${s.y} H${t.x} V${t.y}`;
		}
		return `M${s.x},${s.y} V${t.y} H${t.x}`;
	}
	if (orientation === "horizontal") {
		const mx = (s.x + t.x) / 2;
		return `M${s.x},${s.y} C${mx},${s.y} ${mx},${t.y} ${t.x},${t.y}`;
	}
	const my = (s.y + t.y) / 2;
	return `M${s.x},${s.y} C${s.x},${my} ${t.x},${my} ${t.x},${t.y}`;
}

export { Dendrogram };
