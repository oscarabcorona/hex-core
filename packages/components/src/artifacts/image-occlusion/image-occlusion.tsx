"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Image occlusion — image with rectangular regions hidden behind opaque
 * overlays. Click / Enter / Space on a region reveals what's underneath.
 * Coordinates are 0–1 fractions of the rendered image so the layout
 * stays correct at any size. Pure HTML; no heavy peer.
 *
 * Common for anatomy diagrams, geographic maps, code snippets — any
 * visual where labels or sub-regions are the recall target.
 *
 * @example
 * <ImageOcclusion
 *   src="/anatomy/heart.png"
 *   alt="Cross-section of a human heart"
 *   regions={[
 *     { id: "lv", x: 0.42, y: 0.55, width: 0.18, height: 0.22, label: "Left ventricle" },
 *     { id: "ra", x: 0.58, y: 0.20, width: 0.16, height: 0.18, label: "Right atrium" },
 *   ]}
 * />
 */
export type OcclusionRegion = {
	id: string;
	/** All coords are 0–1 fractions of the rendered image. */
	x: number;
	y: number;
	width: number;
	height: number;
	label?: string;
};

export interface ImageOcclusionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	/** Image source URL. */
	src: string;
	/** Alt text for the underlying image. */
	alt: string;
	/** Rectangular regions to hide on top of the image. */
	regions: OcclusionRegion[];
	/** Fired with the region id when a region is revealed (not when hidden again). */
	onRegionReveal?: (id: string) => void;
}

function ImageOcclusion({
	src,
	alt,
	regions,
	onRegionReveal,
	className,
	...rest
}: ImageOcclusionProps) {
	const [revealed, setRevealed] = React.useState<Set<string>>(() => new Set());
	const onRevealRef = React.useRef(onRegionReveal);
	onRevealRef.current = onRegionReveal;

	// Surface mistakes early in dev when fractional coords escape [0, 1].
	const warnedRef = React.useRef(false);
	const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
	if (nodeEnv !== "production" && !warnedRef.current) {
		const offender = regions.find(
			(r) => r.x < 0 || r.y < 0 || r.x + r.width > 1.0001 || r.y + r.height > 1.0001,
		);
		if (offender) {
			warnedRef.current = true;
			// eslint-disable-next-line no-console
			console.warn(
				`[hex-core/ImageOcclusion] Region "${offender.id}" coords escape [0, 1]. Pass fractions, not pixels — e.g. x: 0.42 (not 168).`,
			);
		}
	}

	const toggle = React.useCallback((id: string) => {
		setRevealed((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
				onRevealRef.current?.(id);
			}
			return next;
		});
	}, []);

	return (
		<div
			{...rest}
			data-hex-image-occlusion
			className={cn("relative inline-block", className)}
		>
			<img
				src={src}
				alt={alt}
				data-hex-image-occlusion-img
				className="block h-auto w-full select-none"
				draggable={false}
			/>
			<div
				data-hex-image-occlusion-overlay
				className="pointer-events-none absolute inset-0"
			>
				{regions.map((r, i) => {
					const isRevealed = revealed.has(r.id);
					return (
						<button
							key={r.id}
							type="button"
							data-hex-image-occlusion-region
							data-region-id={r.id}
							data-revealed={isRevealed}
							aria-pressed={isRevealed}
							aria-label={
								r.label
									? isRevealed
										? `Region ${i + 1} revealed: ${r.label}. Activate to hide.`
										: `Region ${i + 1} of ${regions.length}, hidden. Activate to reveal: ${r.label}.`
									: isRevealed
										? `Region ${i + 1} revealed. Activate to hide.`
										: `Region ${i + 1} of ${regions.length}, hidden. Activate to reveal.`
							}
							onClick={() => toggle(r.id)}
							className={cn(
								"pointer-events-auto absolute rounded-sm border-2 border-primary/60 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								isRevealed
									? "bg-transparent opacity-30 hover:opacity-60"
									: "bg-primary opacity-95 hover:bg-primary/90",
							)}
							style={{
								left: `${r.x * 100}%`,
								top: `${r.y * 100}%`,
								width: `${r.width * 100}%`,
								height: `${r.height * 100}%`,
								// Explicit z-index = array index makes stacking deterministic:
								// later array entries always render (and click-catch) on top.
								zIndex: i,
							}}
						/>
					);
				})}
			</div>
		</div>
	);
}

export { ImageOcclusion };
