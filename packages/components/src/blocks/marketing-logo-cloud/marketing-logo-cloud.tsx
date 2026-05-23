import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Props for {@link MarketingLogoCloud}. */
export interface MarketingLogoCloudProps {
	/** Optional caption above the grid, e.g. "Trusted by teams everywhere". */
	title?: React.ReactNode;
	/** The logos to render — each a `ReactNode` (an `<img>`, inline SVG, or wordmark). */
	logos: ReadonlyArray<React.ReactNode>;
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * A row of customer / partner logos. Each logo is a caller-supplied
 * `ReactNode`, so no image source or icon set is bundled. Presentational and
 * theme-driven. See the schema's `examples` for usage.
 */
export function MarketingLogoCloud({ title, logos, className }: MarketingLogoCloudProps) {
	return (
		<section className={cn("bg-background py-16 sm:py-24", className)}>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{title ? (
					<p className="text-center text-sm font-medium text-muted-foreground">{title}</p>
				) : null}
				<div
					className={cn(
						"grid grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5",
						title && "mt-10",
					)}
				>
					{logos.map((logo, index) => (
						<div
							key={index}
							className="flex items-center justify-center text-muted-foreground [&_img]:max-h-10 [&_img]:w-auto [&_img]:object-contain"
						>
							{logo}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
