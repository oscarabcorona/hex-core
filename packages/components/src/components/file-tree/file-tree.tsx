"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

interface FileTreeNode {
	/** Stable unique id used as React key + ARIA target. */
	id: string;
	/** Display name (file or folder). */
	name: string;
	/** Nested children. Presence (even if empty array) marks the node as a folder. */
	children?: FileTreeNode[];
	/** Optional icon override. Default chooses folder/file based on `children`. */
	icon?: React.ReactNode;
	/** Disable selection + expand toggle. */
	disabled?: boolean;
}

interface FileTreeProps {
	/** Root nodes. */
	nodes: FileTreeNode[];
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
	/** Required accessible name for the tree container. */
	"aria-label": string;
	/** Extra class names on the root tree element. */
	className?: string;
}

interface FlatNode {
	id: string;
	name: string;
	level: number;
	hasChildren: boolean;
	disabled: boolean;
	parentId: string | null;
	icon: React.ReactNode | undefined;
}

/** Walk the tree once, emitting every visible node in document order. */
function flatten(
	nodes: FileTreeNode[],
	expandedSet: Set<string>,
	level = 1,
	parentId: string | null = null,
): FlatNode[] {
	const out: FlatNode[] = [];
	for (const node of nodes) {
		const hasChildren = Array.isArray(node.children);
		out.push({
			id: node.id,
			name: node.name,
			level,
			hasChildren,
			disabled: !!node.disabled,
			parentId,
			icon: node.icon,
		});
		if (hasChildren && expandedSet.has(node.id) && node.children) {
			out.push(...flatten(node.children, expandedSet, level + 1, node.id));
		}
	}
	return out;
}

/** Default folder glyph; flips between open and closed shapes via `open`. */
function FolderIcon({ open }: { open: boolean }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4 shrink-0"
			aria-hidden="true"
		>
			{open ? (
				<path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7l-2-2H5a2 2 0 0 0-2 2z" />
			) : (
				<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
			)}
		</svg>
	);
}

/** Default leaf-node glyph (generic file icon). */
function FileIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4 shrink-0"
			aria-hidden="true"
		>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
		</svg>
	);
}

/** Disclosure chevron — rotates 90° when the folder is expanded. */
function Chevron({ expanded }: { expanded: boolean }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={cn(
				"h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-[var(--duration-normal,200ms)] ease-out",
				expanded ? "rotate-90" : "",
			)}
			aria-hidden="true"
		>
			<polyline points="9 18 15 12 9 6" />
		</svg>
	);
}

interface TreeItemProps {
	node: FileTreeNode;
	level: number;
	expandedSet: Set<string>;
	selected?: string;
	onToggle: (id: string) => void;
	onSelect: (id: string) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, id: string) => void;
	registerRef: (id: string, el: HTMLDivElement | null) => void;
	tabbableId: string | null;
}

/** Recursive single-node renderer; chevron toggles, row body selects. */
function TreeItem({
	node,
	level,
	expandedSet,
	selected,
	onToggle,
	onSelect,
	onKeyDown,
	registerRef,
	tabbableId,
}: TreeItemProps) {
	const hasChildren = Array.isArray(node.children);
	const isExpanded = hasChildren && expandedSet.has(node.id);
	const isSelected = selected === node.id;

	return (
		<li role="none">
			<div
				role="treeitem"
				aria-level={level}
				aria-expanded={hasChildren ? isExpanded : undefined}
				aria-selected={isSelected}
				aria-disabled={node.disabled || undefined}
				tabIndex={tabbableId === node.id ? 0 : -1}
				ref={(el) => registerRef(node.id, el)}
				onClick={(e) => {
					if (node.disabled) return;
					e.stopPropagation();
					/*
					 * WAI-ARIA tree pattern: row click selects only. Toggling
					 * a folder is the chevron's job (or ArrowRight/Left, or
					 * Enter/Space when the row is focused).
					 */
					onSelect(node.id);
				}}
				onKeyDown={(e) => onKeyDown(e, node.id)}
				className={cn(
					"flex items-center gap-[var(--space-2,0.5rem)] rounded-md px-[var(--space-2,0.5rem)] py-[var(--space-1,0.25rem)] text-sm cursor-pointer select-none transition-all duration-[var(--duration-normal,200ms)] ease-out",
					"hover:bg-accent hover:text-accent-foreground",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					isSelected && "bg-accent text-accent-foreground",
					node.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
				)}
				style={{ paddingInlineStart: `calc(${level - 1} * 1rem + var(--space-2, 0.5rem))` }}
			>
				{hasChildren ? (
					<button
						type="button"
						tabIndex={-1}
						aria-hidden="true"
						/*
						 * Decorative button — toggling is also reachable via
						 * Enter/Space on the treeitem and ArrowRight/Left, so
						 * we don't add this to the keyboard tour.
						 */
						onClick={(e) => {
							e.stopPropagation();
							if (node.disabled) return;
							onToggle(node.id);
						}}
						className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm hover:bg-accent-foreground/10"
					>
						<Chevron expanded={isExpanded} />
					</button>
				) : (
					<span className="w-3 shrink-0" aria-hidden="true" />
				)}
				{node.icon ?? (hasChildren ? <FolderIcon open={isExpanded} /> : <FileIcon />)}
				<span className="truncate">{node.name}</span>
			</div>
			{hasChildren && isExpanded && node.children ? (
				<ul role="group" className="m-0 list-none p-0">
					{node.children.map((child) => (
						<TreeItem
							key={child.id}
							node={child}
							level={level + 1}
							expandedSet={expandedSet}
							selected={selected}
							onToggle={onToggle}
							onSelect={onSelect}
							onKeyDown={onKeyDown}
							registerRef={registerRef}
							tabbableId={tabbableId}
						/>
					))}
				</ul>
			) : null}
		</li>
	);
}

/**
 * Hierarchical tree view for files, folders, settings sections, or any nested
 * navigation. Built on the WAI-ARIA tree pattern: `role="tree"` root,
 * `role="treeitem"` per node, `role="group"` per child group, with
 * `aria-level` / `aria-expanded` / `aria-selected` reflecting state.
 *
 * Keyboard: Up/Down move between visible items; Right expands a folder or
 * moves to the first child; Left collapses or moves to the parent;
 * Enter/Space activate the focused node; Home/End jump to the first/last.
 *
 * Expanded state is uncontrolled by default (`defaultExpanded`). Pass
 * `expanded` + `onExpandedChange` for controlled mode.
 * @returns A keyboard-accessible nested tree.
 */
function FileTree({
	nodes,
	defaultExpanded,
	expanded: expandedProp,
	onExpandedChange,
	selected,
	onSelect,
	"aria-label": ariaLabel,
	className,
}: FileTreeProps) {
	const isControlled = expandedProp !== undefined;
	const [internalExpanded, setInternalExpanded] = React.useState<string[]>(
		defaultExpanded ?? [],
	);
	const expanded = isControlled ? expandedProp : internalExpanded;
	const expandedSet = React.useMemo(() => new Set(expanded), [expanded]);

	const itemRefs = React.useRef(new Map<string, HTMLDivElement>());
	const registerRef = React.useCallback(
		(id: string, el: HTMLDivElement | null) => {
			if (el) itemRefs.current.set(id, el);
			else itemRefs.current.delete(id);
		},
		[],
	);

	const flat = React.useMemo(
		() => flatten(nodes, expandedSet),
		[nodes, expandedSet],
	);

	const firstId = flat[0]?.id ?? null;
	const [focusedId, setFocusedId] = React.useState<string | null>(null);
	/*
	 * Resolve the roving-tabindex target against the *visible* (flattened)
	 * node set. If `selected` lives inside a collapsed branch its <treeitem>
	 * doesn't render, and pointing tabIndex=0 at it would silently skip the
	 * whole tree from Tab navigation.
	 */
	const visibleIds = React.useMemo(
		() => new Set(flat.map((n) => n.id)),
		[flat],
	);
	const candidate = focusedId ?? selected ?? firstId;
	const tabbableId =
		candidate && visibleIds.has(candidate) ? candidate : firstId;

	const setExpanded = React.useCallback(
		(next: string[]) => {
			if (!isControlled) setInternalExpanded(next);
			onExpandedChange?.(next);
		},
		[isControlled, onExpandedChange],
	);

	const toggle = React.useCallback(
		(id: string) => {
			const set = new Set(expanded);
			if (set.has(id)) set.delete(id);
			else set.add(id);
			setExpanded(Array.from(set));
		},
		[expanded, setExpanded],
	);

	const handleSelect = React.useCallback(
		(id: string) => {
			onSelect?.(id);
			setFocusedId(id);
		},
		[onSelect],
	);

	const focusNode = (id: string) => {
		setFocusedId(id);
		// Defer to next paint so the new tabbable element is in the DOM.
		requestAnimationFrame(() => itemRefs.current.get(id)?.focus());
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, id: string) => {
		const flatNodes = flat;
		const idx = flatNodes.findIndex((n) => n.id === id);
		const node = flatNodes[idx];
		if (!node) return;

		// Walk past disabled neighbours so arrow keys never park focus on a
		// non-actionable node — matches the convention used elsewhere in the
		// repo (see <Select> / <Combobox> disabled item handling in cmdk).
		const findEnabled = (start: number, dir: 1 | -1) => {
			let i = start;
			while (i >= 0 && i < flatNodes.length) {
				if (!flatNodes[i].disabled) return flatNodes[i];
				i += dir;
			}
			return null;
		};

		switch (e.key) {
			case "ArrowDown": {
				e.preventDefault();
				const next = findEnabled(idx + 1, 1);
				if (next) focusNode(next.id);
				break;
			}
			case "ArrowUp": {
				e.preventDefault();
				const prev = findEnabled(idx - 1, -1);
				if (prev) focusNode(prev.id);
				break;
			}
			case "ArrowRight": {
				e.preventDefault();
				if (node.hasChildren && !expandedSet.has(node.id)) {
					toggle(node.id);
				} else if (node.hasChildren) {
					const firstChild = flatNodes[idx + 1];
					if (firstChild && firstChild.parentId === node.id)
						focusNode(firstChild.id);
				}
				break;
			}
			case "ArrowLeft": {
				e.preventDefault();
				if (node.hasChildren && expandedSet.has(node.id)) {
					toggle(node.id);
				} else if (node.parentId) {
					focusNode(node.parentId);
				}
				break;
			}
			case "Home": {
				e.preventDefault();
				if (flatNodes[0]) focusNode(flatNodes[0].id);
				break;
			}
			case "End": {
				e.preventDefault();
				const last = flatNodes[flatNodes.length - 1];
				if (last) focusNode(last.id);
				break;
			}
			case "Enter":
			case " ": {
				e.preventDefault();
				if (!node.disabled) {
					if (node.hasChildren) toggle(node.id);
					handleSelect(node.id);
				}
				break;
			}
		}
	};

	return (
		<ul
			role="tree"
			aria-label={ariaLabel}
			className={cn("list-none p-0 m-0", className)}
		>
			{nodes.map((node) => (
				<TreeItem
					key={node.id}
					node={node}
					level={1}
					expandedSet={expandedSet}
					selected={selected}
					onToggle={toggle}
					onSelect={handleSelect}
					onKeyDown={handleKeyDown}
					registerRef={registerRef}
					tabbableId={tabbableId}
				/>
			))}
		</ul>
	);
}
FileTree.displayName = "FileTree";

export { FileTree };
export type { FileTreeNode, FileTreeProps };
