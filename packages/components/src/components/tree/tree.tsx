"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * One node in a Tree. Generic — the shape is content-agnostic so consumers
 * can render org charts, taxonomy pickers, navigation trees, etc.
 *
 * For filesystem-shaped data (with file-extension icon logic baked in),
 * prefer {@link FileTree} instead.
 */
export interface TreeNode {
	/** Stable unique id used as React key + ARIA target. */
	id: string;
	/** Display name. */
	label: React.ReactNode;
	/** Nested children. Presence (even empty array) marks the node as a parent. */
	children?: TreeNode[];
	/** Optional icon (default: a chevron + dot). */
	icon?: React.ReactNode;
	/** Disable selection + expand toggle. */
	disabled?: boolean;
}

export interface TreeProps {
	/** Forwarded ref onto the root `<ul role="tree">`. */
	ref?: React.Ref<HTMLUListElement>;
	/** Root nodes. */
	data: TreeNode[];
	/** Uncontrolled initial expanded ids. */
	defaultExpanded?: string[];
	/** Controlled expanded ids. */
	expanded?: string[];
	/** Fired when expanded set changes (array of ids). */
	onExpandedChange?: (ids: string[]) => void;
	/** Controlled selected node id. */
	selected?: string;
	/** Fired when the user activates a node (click, Enter, or Space). */
	onSelect?: (id: string) => void;
	/** Required accessible name. */
	"aria-label": string;
	/** Optional additional class names. */
	className?: string;
}

/** Recursively flatten a tree into the visible-row order (respecting collapsed parents). */
function flattenVisible(nodes: TreeNode[], expanded: Set<string>): Array<{ node: TreeNode; depth: number; parentId: string | null }> {
	const out: Array<{ node: TreeNode; depth: number; parentId: string | null }> = [];
	function walk(items: TreeNode[], depth: number, parentId: string | null) {
		for (const node of items) {
			out.push({ node, depth, parentId });
			if (node.children && expanded.has(node.id)) {
				walk(node.children, depth + 1, node.id);
			}
		}
	}
	walk(nodes, 0, null);
	return out;
}

/**
 * Generic hierarchical list with roving-tabindex keyboard navigation —
 * arrow keys move focus, → expands, ← collapses, Home / End jump to
 * first / last visible row, Enter / Space activates the focused node.
 *
 * Distinct from {@link FileTree} (which adds folder/file icon-by-extension
 * logic baked in) and {@link Accordion} (two-level groupings without
 * item-selection semantics).
 *
 * @example
 * ```tsx
 * <Tree
 *   aria-label="Org chart"
 *   data={[
 *     { id: "ceo", label: "CEO", children: [
 *       { id: "cto", label: "CTO", children: [
 *         { id: "eng-lead", label: "Eng Lead" },
 *       ]},
 *       { id: "cmo", label: "CMO" },
 *     ]},
 *   ]}
 *   defaultExpanded={["ceo"]}
 *   onSelect={(id) => console.log(id)}
 * />
 * ```
 */
function Tree({
	data,
	defaultExpanded,
	expanded: expandedProp,
	onExpandedChange,
	selected: selectedProp,
	onSelect,
	"aria-label": ariaLabel,
	className,
	ref,
}: TreeProps) {
	const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(
		() => new Set(defaultExpanded ?? []),
	);
	const expanded = React.useMemo(
		() => (expandedProp ? new Set(expandedProp) : internalExpanded),
		[expandedProp, internalExpanded],
	);

		const [internalSelected, setInternalSelected] = React.useState<string | null>(null);
		const selected = selectedProp ?? internalSelected;

		const visible = React.useMemo(() => flattenVisible(data, expanded), [data, expanded]);

		const [focusedId, setFocusedId] = React.useState<string | null>(
			() => visible[0]?.node.id ?? null,
		);

		// If the focused node disappeared (parent collapsed), retarget to the parent.
		React.useEffect(() => {
			if (focusedId && !visible.some((row) => row.node.id === focusedId)) {
				setFocusedId(visible[0]?.node.id ?? null);
			}
		}, [visible, focusedId]);

		const setExpandedSet = React.useCallback(
			(next: Set<string>) => {
				if (expandedProp) {
					onExpandedChange?.([...next]);
				} else {
					setInternalExpanded(next);
					onExpandedChange?.([...next]);
				}
			},
			[expandedProp, onExpandedChange],
		);

		const toggleExpand = React.useCallback(
			(id: string) => {
				const next = new Set(expanded);
				if (next.has(id)) next.delete(id);
				else next.add(id);
				setExpandedSet(next);
			},
			[expanded, setExpandedSet],
		);

		const activate = React.useCallback(
			(id: string) => {
				if (selectedProp === undefined) setInternalSelected(id);
				onSelect?.(id);
			},
			[selectedProp, onSelect],
		);

		const handleKeyDown = React.useCallback(
			(e: React.KeyboardEvent<HTMLUListElement>) => {
				if (!focusedId) return;
				const idx = visible.findIndex((row) => row.node.id === focusedId);
				if (idx < 0) return;
				const row = visible[idx];
				if (!row) return;
				const node = row.node;
				const isParent = !!node.children;
				const isExpanded = expanded.has(node.id);

				switch (e.key) {
					case "ArrowDown": {
						e.preventDefault();
						const next = visible[idx + 1];
						if (next) setFocusedId(next.node.id);
						break;
					}
					case "ArrowUp": {
						e.preventDefault();
						const prev = visible[idx - 1];
						if (prev) setFocusedId(prev.node.id);
						break;
					}
					case "ArrowRight": {
						e.preventDefault();
						if (isParent && !isExpanded) toggleExpand(node.id);
						else if (isParent && isExpanded) {
							const next = visible[idx + 1];
							if (next) setFocusedId(next.node.id);
						}
						break;
					}
					case "ArrowLeft": {
						e.preventDefault();
						if (isParent && isExpanded) toggleExpand(node.id);
						else if (row.parentId) {
							setFocusedId(row.parentId);
						}
						break;
					}
					case "Home": {
						e.preventDefault();
						if (visible[0]) setFocusedId(visible[0].node.id);
						break;
					}
					case "End": {
						e.preventDefault();
						const last = visible[visible.length - 1];
						if (last) setFocusedId(last.node.id);
						break;
					}
					case "Enter":
					case " ": {
						e.preventDefault();
						if (node.disabled) return;
						if (isParent) toggleExpand(node.id);
						activate(node.id);
						break;
					}
					default:
						return;
				}
			},
			[focusedId, visible, expanded, toggleExpand, activate],
		);

	// H3: emit boolean aria-selected when selection is wired (so AT can
	// announce "1 of N, not selected" on non-selected items); leave it
	// undefined entirely when nothing on the tree is selectable.
	const isSelectable = onSelect !== undefined || selectedProp !== undefined;

	return (
		<ul
			ref={ref}
			role="tree"
			aria-label={ariaLabel}
			className={cn("flex flex-col text-sm text-foreground", className)}
			onKeyDown={handleKeyDown}
		>
			{data.map((node) => (
				<TreeItem
					key={node.id}
					node={node}
					depth={0}
					expanded={expanded}
					selected={selected}
					isSelectable={isSelectable}
					focusedId={focusedId}
					onFocus={setFocusedId}
					onToggleExpand={toggleExpand}
					onActivate={activate}
				/>
			))}
		</ul>
	);
}

interface TreeItemProps {
	node: TreeNode;
	depth: number;
	expanded: Set<string>;
	selected: string | null;
	isSelectable: boolean;
	focusedId: string | null;
	onFocus: (id: string) => void;
	onToggleExpand: (id: string) => void;
	onActivate: (id: string) => void;
}

/** One row inside a Tree. Recurses through children when expanded. */
function TreeItem({
	node,
	depth,
	expanded,
	selected,
	isSelectable,
	focusedId,
	onFocus,
	onToggleExpand,
	onActivate,
}: TreeItemProps) {
	const children = node.children;
	const isParent = children !== undefined;
	const isExpanded = expanded.has(node.id);
	const isSelected = selected === node.id;
	const isFocused = focusedId === node.id;

	const handleClick = () => {
		if (node.disabled) return;
		onFocus(node.id);
		if (isParent) onToggleExpand(node.id);
		onActivate(node.id);
	};

	const labelId = React.useId();
	return (
		<li
			role="treeitem"
			aria-labelledby={labelId}
			aria-level={depth + 1}
			aria-expanded={isParent ? isExpanded : undefined}
			// H3: when the tree is selectable (caller wired onSelect or
			// selected), emit boolean aria-selected on every item — AT
			// announces "1 of N, not selected" instead of dropping the
			// attribute entirely. When nothing is selectable, leave it off.
			aria-selected={isSelectable ? isSelected : undefined}
			aria-disabled={node.disabled || undefined}
			tabIndex={isFocused ? 0 : -1}
			onClick={(e) => {
				// Stop bubbling so a parent treeitem doesn't refire on a
				// nested-child click — each li carries its own click handler.
				e.stopPropagation();
				handleClick();
			}}
			onFocus={(e) => {
				// stopPropagation prevents the parent treeitem's onFocus from
				// also firing when a deeper child gains focus, racing the
				// focusedId state. Side effect: focus-trap libraries listening
				// at a wrapping container don't see nested-tree focus events.
				// In practice tree-inside-Drawer / Dialog still works because
				// those focus traps activate on outer focusin, not inner.
				e.stopPropagation();
				if (!node.disabled) onFocus(node.id);
			}}
			className={cn(
				"outline-none rounded-sm",
				// H1: focus-visible-driven ring (NOT state-driven) — the ring
				// only shows on keyboard focus, not on mouse clicks.
				"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			)}
		>
			{/*
			  Row element — visible surface. Style only; the li carries the
			  interactivity + focus + ARIA. aria-hidden on chevron + icon
			  spans keeps the accessible name pinned to the labelled
			  <span id={labelId}>.
			*/}
			<div
				className={cn(
					"flex cursor-pointer select-none items-center gap-[var(--gap-xs,0.25rem)] rounded-sm px-[var(--space-2,0.5rem)] py-[var(--space-1,0.25rem)]",
					"transition-all duration-[var(--duration-normal,200ms)] ease-out",
					"hover:bg-accent hover:text-accent-foreground",
					isSelected && "bg-accent text-accent-foreground font-medium",
					node.disabled && "cursor-not-allowed opacity-50",
				)}
				style={{ paddingLeft: `calc(${depth} * var(--space-4, 1rem) + var(--space-2, 0.5rem))` }}
			>
				{isParent ? (
					<span aria-hidden="true" className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className={cn(
								"h-3 w-3 transition-transform duration-[var(--duration-normal,200ms)] ease-out",
								isExpanded ? "rotate-90" : "rotate-0",
							)}
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</span>
				) : (
					<span aria-hidden="true" className="inline-block h-4 w-4 shrink-0" />
				)}
				{node.icon ? (
					<span aria-hidden="true" className="inline-flex h-4 w-4 shrink-0 items-center justify-center [&_svg]:size-4">
						{node.icon}
					</span>
				) : null}
				<span id={labelId} className="truncate">
					{node.label}
				</span>
			</div>
			{isParent && isExpanded && children ? (
				<ul role="group" aria-labelledby={labelId} className="flex flex-col">
					{children.map((child) => (
						<TreeItem
							key={child.id}
							node={child}
							depth={depth + 1}
							expanded={expanded}
							selected={selected}
							isSelectable={isSelectable}
							focusedId={focusedId}
							onFocus={onFocus}
							onToggleExpand={onToggleExpand}
							onActivate={onActivate}
						/>
					))}
				</ul>
			) : null}
		</li>
	);
}

export { Tree };
