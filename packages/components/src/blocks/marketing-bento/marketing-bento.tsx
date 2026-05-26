import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One tile in {@link MarketingBento}. */
export interface MarketingBentoTile {
	/** Tile heading. */
	title: React.ReactNode;
	/** Short body under the title. */
	description?: React.ReactNode;
	/** Optional media region (illustration / screenshot / inline SVG). */
	media?: React.ReactNode;
	/** Tile size on ≥lg: `lg` spans two columns + two rows; `md` (default) spans one. */
	span?: "lg" | "md";
}

/** Props for {@link MarketingBento}. */
export interface MarketingBentoProps {
	/** Tiles to render. */
	tiles: ReadonlyArray<MarketingBentoTile>;
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Asymmetric bento feature grid: one or two `lg` hero tiles plus several `md`
 * tiles. Distinct from `marketing-feature-grid` (symmetric, icon-led) — bento
 * is designed for landing pages that want a richer, gallery-feel feature
 * showcase. Presentational and theme-driven.
 */
export function MarketingBento({
	tiles,
	eyebrow,
	title,
	description,
	className,
}: MarketingBentoProps) {
	const hasHeading = Boolean(eyebrow || title || description);
	return (
		<section className={cn("bg-background py-24 sm:py-32", className)}>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{hasHeading ? (
					<div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
						{eyebrow ? (
							<p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
						) : null}
						{title ? (
							<h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
								{title}
							</h2>
						) : null}
						{description ? (
							<p className="text-pretty text-lg text-muted-foreground">{description}</p>
						) : null}
					</div>
				) : null}
				<div
					className={cn(
						"grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2",
						hasHeading && "mt-16",
					)}
				>
					{tiles.map((tile, index) => (
						<div
							key={index}
							className={cn(
								"flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm",
								tile.span === "lg" && "sm:col-span-2 lg:row-span-2",
							)}
						>
							{tile.media ? <div className="flex-1">{tile.media}</div> : null}
							<div className="flex flex-col gap-2">
								<h3 className="text-base font-semibold text-foreground">{tile.title}</h3>
								{tile.description ? (
									<p className="text-pretty text-sm text-muted-foreground">{tile.description}</p>
								) : null}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
