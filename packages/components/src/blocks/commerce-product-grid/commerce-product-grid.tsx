import * as React from "react";
import { cn } from "../../lib/utils.js";

/** A single product card in {@link CommerceProductGrid}. */
export interface CommerceProduct {
	/** Product name. */
	name: React.ReactNode;
	/** Display price, e.g. "$48". */
	price: React.ReactNode;
	/** Optional link to the product detail page. Makes the whole card a link. */
	href?: string;
	/** Product image — a `ReactNode` (`<img>` or inline SVG); none is bundled. */
	image?: React.ReactNode;
	/** Optional secondary line under the name (category, color, variant). */
	meta?: React.ReactNode;
}

/** Props for {@link CommerceProductGrid}. */
export interface CommerceProductGridProps {
	/** The products to render. */
	products: ReadonlyArray<CommerceProduct>;
	/** Optional section heading above the grid. */
	title?: React.ReactNode;
	/** Cards per row on ≥lg: `three` or `four` (default). */
	columns?: "three" | "four";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/** Inner card body shared by the linked and unlinked variants. */
function ProductCardBody({ product }: { product: CommerceProduct }) {
	return (
		<>
			<div className="aspect-square overflow-hidden rounded-xl bg-muted [&_img]:size-full [&_img]:object-cover [&_img]:transition-transform [&_img]:duration-200 [&_img]:ease-out group-hover:[&_img]:scale-105">
				{product.image}
			</div>
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<h3 className="truncate text-sm font-medium text-foreground">{product.name}</h3>
					{product.meta ? <p className="text-sm text-muted-foreground">{product.meta}</p> : null}
				</div>
				<span className="flex-none text-sm font-medium text-foreground">{product.price}</span>
			</div>
		</>
	);
}

/**
 * A responsive product grid: an optional heading above a grid of product cards
 * (image, name, optional meta, price). Cards link to a detail page when `href`
 * is set. Presentational and theme-driven.
 */
export function CommerceProductGrid({
	products,
	title,
	columns = "four",
	className,
}: CommerceProductGridProps) {
	return (
		<section className={cn("bg-background py-16 sm:py-20", className)}>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{title ? (
					<h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
				) : null}
				<div
					className={cn(
						"grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3",
						columns === "four" ? "lg:grid-cols-4" : "lg:grid-cols-3",
						title && "mt-8",
					)}
				>
					{products.map((product, index) =>
						product.href ? (
							<a
								key={index}
								href={product.href}
								className="group flex flex-col gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								<ProductCardBody product={product} />
							</a>
						) : (
							<div key={index} className="group flex flex-col gap-3">
								<ProductCardBody product={product} />
							</div>
						),
					)}
				</div>
			</div>
		</section>
	);
}
