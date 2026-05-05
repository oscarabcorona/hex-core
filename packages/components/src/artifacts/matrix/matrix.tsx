"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Adjacency-matrix diagram. Square grid where cell (row i, col j)
 * encodes the relationship from node i to node j by color intensity.
 * Pure SVG; no heavy peer dependency. Best for dense graphs where
 * node-link diagrams turn into "hairballs" — Matrix scales gracefully
 * to hundreds of nodes if the SVG is sized to match.
 *
 * @example
 * <Matrix
 *   nodes={["A", "B", "C", "D"].map((id) => ({ id, label: id }))}
 *   matrix={[
 *     [0, 5, 8, 1],
 *     [3, 0, 2, 4],
 *     [6, 0, 0, 7],
 *     [2, 1, 9, 0],
 *   ]}
 * />
 */
export type MatrixNode = {
	id: string;
	label: string;
};

export interface MatrixProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Nodes — rows AND columns. Order matches `matrix` rows/columns. */
	nodes: MatrixNode[];
	/** Square N×N matrix of values. matrix[i][j] = relationship from node i to node j. */
	matrix: number[][];
	/** Pixel size of the rendered SVG (it's square). Default 480. */
	size?: number;
	/** Pixel reserved for row/column labels along the edges. Default 80. */
	labelMargin?: number;
	/** Show numeric values inside cells when the cell is large enough. Default true. */
	showValues?: boolean;
	/** Fired when a cell is hovered (or hover ends, with `null`). */
	onCellHover?: (cell: { row: MatrixNode; col: MatrixNode; value: number } | null) => void;
	/** Fired when a cell is clicked. */
	onCellClick?: (cell: { row: MatrixNode; col: MatrixNode; value: number }) => void;
}

interface LaidOutCell {
	row: MatrixNode;
	col: MatrixNode;
	rowIndex: number;
	colIndex: number;
	value: number;
	x: number;
	y: number;
	intensity: number;
}

/** Below this px size, in-cell numeric labels become unreadable and are hidden. */
const MIN_CELL_SIZE_FOR_VALUE = 28;

function Matrix({
	nodes,
	matrix,
	size = 480,
	labelMargin = 80,
	showValues = true,
	onCellHover,
	onCellClick,
	className,
	...rest
}: MatrixProps) {
	const cells = React.useMemo(() => layout(nodes, matrix, size, labelMargin), [nodes, matrix, size, labelMargin]);
	const desc = `Matrix with ${nodes.length} node${nodes.length === 1 ? "" : "s"} (${nodes.length}×${nodes.length} cells)`;
	const cellSize = nodes.length > 0 ? (size - labelMargin) / nodes.length : 0;

	return (
		<svg
			{...rest}
			data-hex-matrix
			role="img"
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			className={cn("block", className)}
		>
			<title>Adjacency matrix</title>
			<desc>{desc}</desc>
			<g data-hex-matrix-rows>
				{nodes.map((n, i) => (
					<text
						key={`row-${n.id}`}
						x={labelMargin - 4}
						y={labelMargin + cellSize * i + cellSize / 2}
						dy="0.35em"
						textAnchor="end"
						fontSize={10}
						fill="hsl(var(--foreground))"
					>
						{n.label}
					</text>
				))}
			</g>
			<g data-hex-matrix-cols>
				{nodes.map((n, i) => (
					<text
						key={`col-${n.id}`}
						x={labelMargin + cellSize * i + cellSize / 2}
						y={labelMargin - 4}
						textAnchor="end"
						fontSize={10}
						fill="hsl(var(--foreground))"
						transform={`rotate(-45 ${labelMargin + cellSize * i + cellSize / 2} ${labelMargin - 4})`}
					>
						{n.label}
					</text>
				))}
			</g>
			<g data-hex-matrix-cells>
				{cells.map((c) => {
					const interactive = Boolean(onCellHover || onCellClick);
					const cellPayload = { row: c.row, col: c.col, value: c.value };
					const fireHover = (cell: typeof cellPayload | null) => onCellHover?.(cell);
					const handleActivate = () => onCellClick?.(cellPayload);
					return (
						<g
							key={`${c.rowIndex}-${c.colIndex}`}
							data-hex-matrix-cell
							data-row={c.rowIndex}
							data-col={c.colIndex}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={interactive ? `${c.row.label} → ${c.col.label}: ${c.value}` : undefined}
							style={interactive ? { cursor: "pointer" } : undefined}
							onMouseEnter={onCellHover ? () => fireHover(cellPayload) : undefined}
							onMouseLeave={onCellHover ? () => fireHover(null) : undefined}
							onFocus={onCellHover ? () => fireHover(cellPayload) : undefined}
							onBlur={onCellHover ? () => fireHover(null) : undefined}
							onClick={onCellClick ? handleActivate : undefined}
							onKeyDown={onCellClick ? (e) => activateOnKey(e, handleActivate) : undefined}
						>
							<rect
								x={c.x}
								y={c.y}
								width={cellSize}
								height={cellSize}
								// Floor at 0.08 so empty cells are visible as grid lines;
								// ramp up to 0.95 for max-value cells. `--chart-1` carries
								// the hue, opacity carries the magnitude. Falls back to
								// `--primary` for consumers whose theme presets predate
								// the chart token family.
								fill="hsl(var(--chart-1, var(--primary)))"
								fillOpacity={0.08 + 0.87 * c.intensity}
								stroke="hsl(var(--background))"
								strokeWidth={0.5}
							/>
							{showValues && cellSize > MIN_CELL_SIZE_FOR_VALUE && c.value !== 0 ? (
								<text
									x={c.x + cellSize / 2}
									y={c.y + cellSize / 2}
									dy="0.35em"
									textAnchor="middle"
									fontSize={9}
									// Above ~0.55 intensity the cell is dark enough that
									// background-tone foreground reads better.
									fill={c.intensity > 0.55 ? "hsl(var(--background))" : "hsl(var(--foreground))"}
									style={{ pointerEvents: "none" }}
								>
									{c.value}
								</text>
							) : null}
						</g>
					);
				})}
			</g>
		</svg>
	);
}

function layout(
	nodes: MatrixNode[],
	matrix: number[][],
	size: number,
	labelMargin: number,
): LaidOutCell[] {
	if (nodes.length === 0) return [];
	const cellSize = (size - labelMargin) / nodes.length;
	let maxValue = 0;
	for (const row of matrix) {
		for (const v of row) if (v > maxValue) maxValue = v;
	}
	const cells: LaidOutCell[] = [];
	for (let i = 0; i < nodes.length; i++) {
		for (let j = 0; j < nodes.length; j++) {
			const value = matrix[i]?.[j] ?? 0;
			cells.push({
				row: nodes[i],
				col: nodes[j],
				rowIndex: i,
				colIndex: j,
				value,
				x: labelMargin + cellSize * j,
				y: labelMargin + cellSize * i,
				intensity: maxValue > 0 ? value / maxValue : 0,
			});
		}
	}
	return cells;
}

function activateOnKey(e: React.KeyboardEvent, fn: () => void): void {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

export { Matrix };
