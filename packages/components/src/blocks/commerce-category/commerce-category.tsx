import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One category in {@link CommerceCategory}. */
export interface CommerceCategoryItem {
	/** Category name. */
	name: React.ReactNode;
	/** Optional category image (a `ReactNode` — `<img>` or inline SVG). */
	image?: React.ReactNode;
	/** Optional product count (or any meta line). */
	productCount?: React.ReactNode;
	/** Optional link to the category page. Makes the whole card a link. */
	href?: string;
}

/** Props for {@link CommerceCategory}. */
export interface CommerceCategoryProps {
	/** Categories to render. */
	categories: ReadonlyArray<CommerceCategoryItem>;
	/** Optional section heading above the grid. */
	title?: React.ReactNode;
	/** Cards per row on ≥lg: `three` (default) or `four`. */
	columns?: "three" | "four";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

const COLUMN_CLASS: Record<NonNullable<CommerceCategoryProps["columns"]>, string> = {
	three: "sm:grid-cols-2 lg:grid-cols-3",
	four: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Inner card body shared by linked and unlinked variants. */
function CategoryCardBody({ category }: { category: CommerceCategoryItem }) {
	return (
		<>
			<div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted [&_img]:size-full [&_img]:object-cover [&_img]:transition-transform [&_img]:duration-200 [&_img]:ease-out group-hover:[&_img]:scale-105">
				{category.image}
			</div>
			<div className="flex items-center justify-between gap-2">
				<h3 className="text-base font-semibold text-foreground">{category.name}</h3>
				{category.productCount !== undefined ? (
					<span className="text-sm text-muted-foreground">{category.productCount}</span>
				) : null}
			</div>
		</>
	);
}

/**
 * Category preview cards ("shop by category"): a responsive grid of category
 * cards (image + name + optional product count). Cards link to the category
 * page when `href` is set. Presentational and theme-driven.
 */
export function CommerceCategory({
	categories,
	title,
	columns = "three",
	className,
}: CommerceCategoryProps) {
	return (
		<section className={cn("bg-background py-16 sm:py-20", className)}>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{title ? (
					<h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
				) : null}
				<div
					className={cn(
						"grid grid-cols-1 gap-x-6 gap-y-10",
						COLUMN_CLASS[columns],
						title && "mt-8",
					)}
				>
					{categories.map((category, index) =>
						category.href ? (
							<a key={index} href={category.href} className="group flex flex-col gap-3">
								<CategoryCardBody category={category} />
							</a>
						) : (
							<div key={index} className="group flex flex-col gap-3">
								<CategoryCardBody category={category} />
							</div>
						),
					)}
				</div>
			</div>
		</section>
	);
}
