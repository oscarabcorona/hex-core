"use client";

import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** A file-shaped attachment metadata object accepted by `<Attachment>`. */
export interface AttachmentFile {
	/** Display name. */
	name: string;
	/** Bytes. Used to render a human-readable size. */
	size: number;
	/** MIME type. Drives the auto-detected `variant`. */
	type: string;
	/**
	 * Optional preview URL for images. When `type` starts with `image/`
	 * AND `preview` is set, the attachment renders a thumbnail; otherwise
	 * it falls back to a typed file icon + name + size.
	 */
	preview?: string;
}

const attachmentVariants = cva(
	[
		"group/attachment relative inline-flex items-center gap-[var(--gap-sm,0.5rem)] rounded-md border border-border bg-card",
		"transition-all duration-[var(--duration-normal,200ms)] ease-out",
	].join(" "),
	{
		variants: {
			variant: {
				file: "px-[var(--space-3,0.75rem)] py-[var(--space-2,0.5rem)] max-w-xs",
				image: "p-0 overflow-hidden",
			},
		},
		defaultVariants: { variant: "file" },
	},
);

export interface AttachmentProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onProgress">,
		VariantProps<typeof attachmentVariants> {
	/** Forwarded ref onto the root element. */
	ref?: React.Ref<HTMLDivElement>;
	/** Native `File` OR a metadata object. */
	file: File | AttachmentFile;
	/** Click handler for the remove button. When provided, a × button overlays the attachment. */
	onRemove?: () => void;
	/**
	 * Upload progress in `[0, 1)`. Values `>= 1` (or `undefined`) hide the
	 * progressbar — pass `undefined` once the upload completes. Internally
	 * scaled to `aria-valuenow` on a 0–100 progressbar so AT engines
	 * announce "42 percent" rather than "0.42 of 1."
	 */
	progress?: number;
}

/**
 * Format a byte count as a human-readable size (`"24.3 KB"`, `"1.2 MB"`).
 *
 * @param bytes - Raw byte count.
 * @returns A short human-readable string.
 */
function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Decide whether to render the image variant (thumbnail) vs the file
 * variant (icon + name + size). Images need both an image MIME type AND
 * a `preview` URL — without preview we can't actually show the image, so
 * we fall back to the file variant.
 *
 * @param file - The attachment input.
 * @returns `"image"` when both conditions hold, else `"file"`.
 */
function detectVariant(file: File | AttachmentFile): "image" | "file" {
	const preview = "preview" in file ? file.preview : undefined;
	const isImage = file.type.startsWith("image/");
	return isImage && preview ? "image" : "file";
}

/**
 * Resolve the preview URL for an attachment input. Native `File`s don't
 * carry a preview; consumers create one via `URL.createObjectURL(file)`
 * before handing the file in.
 *
 * @param file - The attachment input.
 * @returns The preview URL, or undefined.
 */
function resolvePreview(file: File | AttachmentFile): string | undefined {
	return "preview" in file ? file.preview : undefined;
}

/**
 * A file / image attachment thumbnail with an optional remove affordance
 * and optional upload-progress overlay. Composes with the existing
 * `Composer` AI primitive (drop into Composer's children slot to render
 * as part of the message draft).
 *
 * Auto-detects the visual variant: image MIME + `preview` URL → image
 * thumbnail; everything else → typed file icon with name + size.
 *
 * Distinct from {@link Dropzone} (the upload-input affordance) and
 * static {@link Card} previews (no remove/progress UI).
 *
 * @example
 * ```tsx
 * <Attachment
 *   file={{ name: "screenshot.png", size: 124000, type: "image/png", preview: objectUrl }}
 *   onRemove={() => removeFromDraft("screenshot.png")}
 * />
 * ```
 */
function Attachment({
	className,
	variant,
	file,
	onRemove,
	progress,
	ref,
	...props
}: AttachmentProps) {
	const preview = resolvePreview(file);
	// M3: when caller forces variant="image" but no preview is available,
	// fall back to "file" so the wrapper padding matches the rendered
	// content (file icon + name + size needs px/py; image uses zero-pad).
	const detected = detectVariant(file);
	const resolvedVariant: "image" | "file" =
		variant === "image" && !preview ? "file" : (variant ?? detected);
	const showProgress = typeof progress === "number" && progress >= 0 && progress < 1;
	// M5: scale to 0–100 so AT announces "42 percent" not "0.42 of 1."
	const progressPercent = showProgress ? Math.round(progress * 100) : 0;

	return (
		<div
			ref={ref}
			className={cn(attachmentVariants({ variant: resolvedVariant }), className)}
			{...props}
		>
			{resolvedVariant === "image" && preview ? (
				// Intentional plain <img> (not next/image) — Attachment is
				// framework-agnostic. Consumers can swap in next/image at the
				// callsite when they want optimization.
				<img
					src={preview}
					alt={file.name}
					className="block h-20 w-20 object-cover"
				/>
			) : (
				<>
					<FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
					<div className="flex min-w-0 flex-col">
						<span className="truncate text-sm font-medium text-foreground">{file.name}</span>
						<span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
					</div>
				</>
			)}

			{showProgress ? (
				<div
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={progressPercent}
					aria-label={`Uploading ${file.name}`}
					className="absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-md bg-muted"
				>
					<div
						className="h-full bg-primary transition-[width] duration-[var(--duration-normal,200ms)] ease-out"
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
			) : null}

			{onRemove ? (
				<button
					type="button"
					onClick={onRemove}
					aria-label={`Remove ${file.name}`}
					className={cn(
						"absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full",
						"bg-card border border-border text-foreground shadow-sm",
						"transition-all duration-[var(--duration-normal,200ms)] ease-out",
						"hover:bg-accent hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
						"active:scale-90",
					)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="size-3"
						aria-hidden="true"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			) : null}
		</div>
	);
}

/** Generic file icon (page-with-fold). */
function FileIcon(props: React.SVGAttributes<SVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
		</svg>
	);
}

export { Attachment, attachmentVariants };
