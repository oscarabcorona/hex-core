"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

interface DropzoneProps
	extends Omit<
		React.HTMLAttributes<HTMLDivElement>,
		"onChange" | "onDrop" | "children"
	> {
	/** Fired with the accepted file list every time the user picks or drops files. */
	onFilesSelected?: (files: File[]) => void;
	/**
	 * Fired when files are dropped/picked but ALL of them are filtered out by
	 * `accept` / `maxSize` / `maxFiles`. Useful for surfacing "file too large"
	 * or "wrong type" toasts to the user. Receives the rejected File[].
	 */
	onFilesRejected?: (files: File[]) => void;
	/** `accept` attribute forwarded to the hidden file input (e.g. "image/*", ".csv"). */
	accept?: string;
	/** Allow multiple files. Default true. */
	multiple?: boolean;
	/** Maximum total file count (after dedupe). Excess files are dropped silently — surface in your handler. */
	maxFiles?: number;
	/** Maximum size per file in bytes. Files over the cap are filtered before onFilesSelected fires. */
	maxSize?: number;
	/** Disable interaction. */
	disabled?: boolean;
	/** Optional render override for the dropzone body. Receives drag state. */
	children?: React.ReactNode | ((state: DropzoneRenderState) => React.ReactNode);
	/** Required accessible name for the drop area. */
	"aria-label": string;
}

interface DropzoneRenderState {
	isDragOver: boolean;
	isDisabled: boolean;
	openFileDialog: () => void;
}

/** Apply `accept` / `maxSize` / `maxFiles` filters before emitting to onFilesSelected. */
function filterFiles(
	files: FileList | File[],
	{ accept, maxSize, maxFiles }: { accept?: string; maxSize?: number; maxFiles?: number },
): File[] {
	const list = Array.from(files);
	const acceptList = accept
		? accept
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean)
		: undefined;

	const matchAccept = (file: File): boolean => {
		if (!acceptList) return true;
		return acceptList.some((entry) => {
			if (entry.startsWith(".")) {
				return file.name.toLowerCase().endsWith(entry.toLowerCase());
			}
			if (entry.endsWith("/*")) {
				const prefix = entry.slice(0, -1); // "image/"
				return file.type.startsWith(prefix);
			}
			return file.type === entry;
		});
	};

	const sized =
		typeof maxSize === "number" ? list.filter((f) => f.size <= maxSize) : list;
	const accepted = sized.filter(matchAccept);
	if (typeof maxFiles === "number") return accepted.slice(0, maxFiles);
	return accepted;
}

/**
 * Drag-and-drop file input built on the native HTML5 drag-drop API plus a
 * visually-hidden (sr-only) `<input type="file">` for screen-reader and
 * keyboard access.
 *
 * Two interaction surfaces:
 * - The visible drop area is a `role="button"` div with `tabIndex=0` and the
 *   required `aria-label`. Click, Enter, or Space proxies through to click the
 *   hidden input, opening the system file dialog.
 * - The hidden input itself remains in the accessibility tree (sr-only, NOT
 *   `aria-hidden`) so AT-driven file pickers can find it directly.
 *
 * Pass `children` as a node (default placeholder) or a function receiving
 * `{ isDragOver, isDisabled, openFileDialog }` for full layout control.
 * @returns A drop area + hidden file input pair that yields a File[].
 */
function Dropzone({
	onFilesSelected,
	onFilesRejected,
	accept,
	multiple = true,
	maxFiles,
	maxSize,
	disabled = false,
	children,
	className,
	"aria-label": ariaLabel,
	...rest
}: DropzoneProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = React.useState(false);
	const dragCounter = React.useRef(0);

	const emit = React.useCallback(
		(files: FileList | File[] | null | undefined) => {
			if (!files || disabled) return;
			const all = Array.from(files);
			if (all.length === 0) return;
			const accepted = filterFiles(all, { accept, maxSize, maxFiles });
			if (accepted.length === 0) {
				onFilesRejected?.(all);
				return;
			}
			const finalAccepted = !multiple ? accepted.slice(0, 1) : accepted;
			const rejected = all.filter((f) => !finalAccepted.includes(f));
			onFilesSelected?.(finalAccepted);
			if (rejected.length > 0) onFilesRejected?.(rejected);
		},
		[
			accept,
			disabled,
			maxFiles,
			maxSize,
			multiple,
			onFilesSelected,
			onFilesRejected,
		],
	);

	/*
	 * Reset the drag counter + isDragOver when the user cancels a drag outside
	 * the dropzone (Esc, drag off the page, switch tab). Without this, the
	 * counter can stay >0 and the dropzone gets stuck in its hover style.
	 */
	React.useEffect(() => {
		const reset = () => {
			dragCounter.current = 0;
			setIsDragOver(false);
		};
		window.addEventListener("dragend", reset);
		window.addEventListener("drop", reset);
		return () => {
			window.removeEventListener("dragend", reset);
			window.removeEventListener("drop", reset);
		};
	}, []);

	const openFileDialog = React.useCallback(() => {
		if (disabled) return;
		inputRef.current?.click();
	}, [disabled]);

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		if (disabled) return;
		e.preventDefault();
		dragCounter.current += 1;
		if (e.dataTransfer.types.includes("Files")) setIsDragOver(true);
	};
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		if (disabled) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = "copy";
	};
	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		if (disabled) return;
		e.preventDefault();
		dragCounter.current = Math.max(0, dragCounter.current - 1);
		if (dragCounter.current === 0) setIsDragOver(false);
	};
	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		if (disabled) return;
		e.preventDefault();
		dragCounter.current = 0;
		setIsDragOver(false);
		emit(e.dataTransfer.files);
	};
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (disabled) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			openFileDialog();
		}
	};

	const renderState: DropzoneRenderState = {
		isDragOver,
		isDisabled: disabled,
		openFileDialog,
	};

	return (
		<div
			role="button"
			tabIndex={disabled ? -1 : 0}
			aria-label={ariaLabel}
			aria-disabled={disabled || undefined}
			data-drag-over={isDragOver || undefined}
			onClick={openFileDialog}
			onKeyDown={handleKeyDown}
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={cn(
				"flex w-full cursor-pointer select-none flex-col items-center justify-center gap-[var(--space-2,0.5rem)] rounded-md border-2 border-dashed border-input bg-background px-[var(--space-6,1.5rem)] py-[var(--space-8,2rem)] text-center text-sm transition-all duration-[var(--duration-normal,200ms)] ease-out",
				"hover:bg-accent hover:text-accent-foreground",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				isDragOver && "border-primary bg-accent text-accent-foreground",
				disabled && "pointer-events-none opacity-50",
				className,
			)}
			{...rest}
		>
			{typeof children === "function"
				? children(renderState)
				: (children ?? (
						<>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-6 w-6 text-muted-foreground"
								aria-hidden="true"
							>
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="17 8 12 3 7 8" />
								<line x1="12" y1="3" x2="12" y2="15" />
							</svg>
							<span className="font-medium">
								{isDragOver ? "Drop files to upload" : "Drag files here or click to browse"}
							</span>
							{accept ? (
								<span className="text-xs text-muted-foreground">{accept}</span>
							) : null}
						</>
					))}
			<input
				ref={inputRef}
				type="file"
				accept={accept}
				multiple={multiple}
				disabled={disabled}
				aria-label={ariaLabel}
				tabIndex={-1}
				className="sr-only"
				/*
				 * aria-label mirrors the outer region so AT forms-mode can
				 * find the labeled input. tabIndex={-1} removes it from the
				 * tab sequence (outer role="button" is the keyboard surface)
				 * which also resolves the nested-interactive axe rule.
				 */
				onChange={(e) => {
					emit(e.target.files);
					// Reset so picking the same file twice still fires onChange
					e.target.value = "";
				}}
			/>
		</div>
	);
}
Dropzone.displayName = "Dropzone";

export { Dropzone };
export type { DropzoneProps, DropzoneRenderState };
