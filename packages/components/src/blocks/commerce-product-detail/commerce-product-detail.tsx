import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Props for {@link CommerceProductDetail}. */
export interface CommerceProductDetailProps {
	/** Product name (renders as the page `<h1>`). */
	name: React.ReactNode;
	/** Display price, e.g. "$48". */
	price: React.ReactNode;
	/** Product imagery (gallery / hero image) shown in the left column on ≥lg. */
	media: React.ReactNode;
	/** Optional eyebrow above the name (brand, category). */
	eyebrow?: React.ReactNode;
	/** Product description / marketing copy. */
	description?: React.ReactNode;
	/** Option selectors (size, color, quantity) — pass your own controls. */
	options?: React.ReactNode;
	/** Primary actions (add to cart / buy now) — pass `<Button>`s. */
	actions?: React.ReactNode;
	/** Extra details (shipping, materials, an accordion) shown below the actions. */
	details?: React.ReactNode;
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Product detail layout: imagery on the left, product info on the right
 * (name, price, description, your option controls, and add-to-cart actions),
 * stacked on mobile. Presentational and theme-driven — wire selection and
 * cart logic through the controls you pass in.
 */
export function CommerceProductDetail({
	name,
	price,
	media,
	eyebrow,
	description,
	options,
	actions,
	details,
	className,
}: CommerceProductDetailProps) {
	return (
		<section className={cn("bg-background py-12 sm:py-16", className)}>
			<div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
				<div className="overflow-hidden rounded-2xl bg-muted [&_img]:size-full [&_img]:object-cover">
					{media}
				</div>

				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						{eyebrow ? (
							<p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
						) : null}
						<h1 className="text-3xl font-semibold tracking-tight text-foreground">{name}</h1>
						<p className="text-2xl font-semibold tracking-tight text-foreground">{price}</p>
					</div>

					{description ? (
						<p className="text-pretty text-base text-muted-foreground">{description}</p>
					) : null}

					{options ? <div className="flex flex-col gap-4">{options}</div> : null}
					{actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
					{details ? <div className="border-t border-border pt-6">{details}</div> : null}
				</div>
			</div>
		</section>
	);
}
