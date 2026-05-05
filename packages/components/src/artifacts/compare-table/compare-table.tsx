"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Side-by-side comparison table. Subjects are columns; attributes are
 * rows; cells render the per-subject value for that attribute. With
 * `highlightDifferences`, cells whose value differs from the row's
 * first non-empty cell get a subtle accent — handy for vocab pairs
 * (term ↔ translation), feature matrices (Linux vs Mac vs Windows),
 * before/after comparisons. Pure HTML; no heavy peer.
 *
 * @example
 * <CompareTable
 *   subjects={[
 *     { id: "linux", label: "Linux" },
 *     { id: "mac", label: "Mac" },
 *     { id: "win", label: "Windows" },
 *   ]}
 *   attributes={[
 *     { id: "kernel", label: "Kernel", values: { linux: "Linux", mac: "Darwin", win: "NT" } },
 *     { id: "fs", label: "Default FS", values: { linux: "ext4", mac: "APFS", win: "NTFS" } },
 *   ]}
 * />
 */
export type CompareSubject = {
	id: string;
	label: React.ReactNode;
};

export type CompareAttribute = {
	id: string;
	label: React.ReactNode;
	/** Map of subjectId → cell content. Missing keys render as "—". */
	values: Record<string, React.ReactNode>;
};

export interface CompareTableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	/** Columns. */
	subjects: CompareSubject[];
	/** Rows. */
	attributes: CompareAttribute[];
	/** When true, cells whose value differs from the row's first non-empty cell get a subtle accent. */
	highlightDifferences?: boolean;
	/** Fired when a body cell is clicked. */
	onCellClick?: (subjectId: string, attributeId: string) => void;
}

const EMPTY_PLACEHOLDER = "—";

function CompareTable({
	subjects,
	attributes,
	highlightDifferences = false,
	onCellClick,
	className,
	...rest
}: CompareTableProps) {
	// Surface a developer-facing console.warn when an attribute references a
	// subjectId that isn't actually in `subjects` — easy mistake when the
	// consumer rebuilds rows from a different source than columns.
	const warnedRef = React.useRef(false);
	const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
	if (nodeEnv !== "production" && !warnedRef.current) {
		const subjectIds = new Set(subjects.map((s) => s.id));
		for (const attr of attributes) {
			for (const valueId of Object.keys(attr.values)) {
				if (!subjectIds.has(valueId)) {
					warnedRef.current = true;
					// eslint-disable-next-line no-console
					console.warn(
						`[hex-core/CompareTable] Attribute "${attr.id}" has a value for subjectId "${valueId}" that isn't in the subjects array. The cell will not render.`,
					);
					break;
				}
			}
			if (warnedRef.current) break;
		}
	}

	return (
		<div
			{...rest}
			data-hex-compare-table
			className={cn("overflow-x-auto rounded-lg border", className)}
		>
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr data-hex-compare-table-header>
						<th
							scope="col"
							className="sticky left-0 z-10 border-b bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground"
						>
							{/* Empty corner — attribute labels live here per row */}
						</th>
						{subjects.map((subject) => (
							<th
								key={subject.id}
								scope="col"
								data-hex-compare-table-subject
								data-subject-id={subject.id}
								className="border-b bg-card px-3 py-2 text-left font-semibold"
							>
								{subject.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{attributes.map((attr) => {
						// Find the row's reference value (first non-empty cell among the
						// subjects we're rendering, preserving display order).
						const reference = highlightDifferences
							? subjects.map((s) => attr.values[s.id]).find((v) => v != null && v !== "")
							: undefined;
						return (
							<tr key={attr.id} data-hex-compare-table-row data-attribute-id={attr.id}>
								<th
									scope="row"
									className="sticky left-0 z-10 border-b bg-card px-3 py-2 text-left font-medium"
								>
									{attr.label}
								</th>
								{subjects.map((subject) => {
									const raw = attr.values[subject.id];
									const isEmpty = raw == null || raw === "";
									const displayValue = isEmpty ? EMPTY_PLACEHOLDER : raw;
									// Skip diff for non-primitive values: ReactElements stringify
									// to "[object Object]" and would all flag as different. Only
									// run the comparison when both raw + reference are scalar.
									const isComparable =
										(typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") &&
										(typeof reference === "string" ||
											typeof reference === "number" ||
											typeof reference === "boolean");
									const differs =
										highlightDifferences &&
										!isEmpty &&
										reference !== undefined &&
										isComparable &&
										String(raw) !== String(reference);
									const interactive = Boolean(onCellClick);
									return (
										<td
											key={subject.id}
											data-hex-compare-table-cell
											data-subject-id={subject.id}
											data-attribute-id={attr.id}
											data-differs={differs}
											className={cn(
												"border-b px-3 py-2 align-top",
												differs && "bg-accent/30 text-accent-foreground",
												isEmpty && "text-muted-foreground",
												interactive && "cursor-pointer hover:bg-muted/40",
											)}
											onClick={interactive ? () => onCellClick?.(subject.id, attr.id) : undefined}
										>
											{displayValue}
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

export { CompareTable };
