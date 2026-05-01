"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Headless node-graph canvas backed by reactflow. Renders an interactive
 * graph of agent steps, workflow nodes, RAG document refs — anywhere your
 * AI app needs to visualize relationships.
 *
 * Controlled: pass `nodes` and `edges`; receive change events. Reactflow's
 * default Background + Controls are rendered automatically; pass `children`
 * to add Panels, MiniMap, or custom overlays.
 *
 * Heavy peer: requires `reactflow` (~80 KB gzip). The hex-core CLI's `add`
 * flow prompts before installing.
 *
 * @example
 * import "reactflow/dist/style.css"; // once in your app entry
 * <Canvas
 *   nodes={[{ id: "1", position: { x: 0, y: 0 }, data: { label: "Agent" } }]}
 *   edges={[]}
 *   onNodesChange={onNodesChange}
 *   onEdgesChange={onEdgesChange}
 * />
 */
export interface CanvasProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onError"> {
	/** Node objects passed to ReactFlow. See reactflow docs for shape. */
	nodes: import("reactflow").Node[];
	/** Edge objects passed to ReactFlow. */
	edges: import("reactflow").Edge[];
	/** Forwarded to ReactFlow.onNodesChange. */
	onNodesChange?: import("reactflow").OnNodesChange;
	/** Forwarded to ReactFlow.onEdgesChange. */
	onEdgesChange?: import("reactflow").OnEdgesChange;
	/** Forwarded to ReactFlow.onConnect (fires when user wires two nodes). */
	onConnect?: import("reactflow").OnConnect;
	/** Hide the bottom-left zoom/pan/fit controls. Default false (visible). */
	hideControls?: boolean;
	/** Hide the dotted background. Default false (visible). */
	hideBackground?: boolean;
	/** Auto-fit the view to all nodes on first render. Default true. */
	fitView?: boolean;
	/** Slot for MiniMap, Panel, or custom overlays rendered inside ReactFlow. */
	children?: React.ReactNode;
}

/**
 * Renders a ReactFlow graph with sensible defaults.
 * @param props - Controlled nodes/edges + interaction handlers
 * @returns A div containing the ReactFlow canvas
 */
function Canvas({
	nodes,
	edges,
	onNodesChange,
	onEdgesChange,
	onConnect,
	hideControls = false,
	hideBackground = false,
	fitView = true,
	children,
	className,
	...rest
}: CanvasProps) {
	// Lazy-loaded reactflow modules. Held in state so a re-render kicks in
	// once the dynamic import resolves; until then we render a placeholder.
	const [rf, setRf] = React.useState<typeof import("reactflow") | null>(null);

	React.useEffect(() => {
		let cancelled = false;
		void import("reactflow").then((mod) => {
			if (!cancelled) setRf(mod);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	if (!rf) {
		return (
			<div
				{...rest}
				data-hex-canvas-loading
				className={cn("h-full w-full bg-muted/20", className)}
				aria-busy="true"
			/>
		);
	}

	const { ReactFlow, Background, Controls } = rf;

	return (
		<div
			{...rest}
			data-hex-canvas
			className={cn("h-full w-full", className)}
		>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView={fitView}
			>
				{!hideBackground && <Background />}
				{!hideControls && <Controls />}
				{children}
			</ReactFlow>
		</div>
	);
}

export { Canvas };
