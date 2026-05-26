import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One feature in {@link CommerceProductFeatures}. */
export interface CommerceProductFeature {
	/** Feature title. */
	title: React.ReactNode;
	/** Short body under the title. */
	description?: React.ReactNode;
	/** Optional media region (illustration / detail photo). Used by the `alternating` variant. */
	media?: React.ReactNode;
	/** Optional leading icon. Used by the `grid` variant. */
	icon?: React.ReactNode;
}

/** Props for {@link CommerceProductFeatures}. */
export interface CommerceProductFeaturesProps {
	/** Features to render. */
	features: ReadonlyArray<CommerceProductFeature>;
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** `alternating` (default) renders one feature per row, media alternating sides; `grid` renders 3-col icon-grid. */
	variant?: "alternating" | "grid";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Product features spotlight on a PDP — either an alternating row layout
 * (image + copy, sides flip each row) or a compact icon-grid for spec lists.
 * Presentational and theme-driven. Sits between `commerce-product-detail` and
 * `commerce-reviews` on a product page.
 */
export function CommerceProductFeatures({
	features,
	eyebrow,
	title,
	description,
	variant = "alternating",
	className,
}: CommerceProductFeaturesProps) {
	const hasHeading = Boolean(eyebrow || title || description);
	const heading = hasHeading ? (
		<div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
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
	) : null;

	if (variant === "grid") {
		return (
			<section className={cn("bg-background py-24 sm:py-32", className)}>
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					{heading}
					<div className={cn("grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3", hasHeading && "mt-16")}>
						{features.map((feature, index) => (
							<div key={index} className="flex flex-col items-start gap-3">
								{feature.icon ? (
									<div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground [&_svg]:size-5">
										{feature.icon}
									</div>
								) : null}
								<h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
								{feature.description ? (
									<p className="text-pretty text-sm text-muted-foreground">{feature.description}</p>
								) : null}
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className={cn("bg-background py-24 sm:py-32", className)}>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{heading}
				<div className={cn("flex flex-col gap-16", hasHeading && "mt-16")}>
					{features.map((feature, index) => {
						const flip = index % 2 === 1;
						return (
							<div
								key={index}
								className={cn(
									"grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
								)}
							>
								<div
									className={cn(
										"flex flex-col gap-4",
										flip && "lg:order-2",
									)}
								>
									<h3 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
										{feature.title}
									</h3>
									{feature.description ? (
										<p className="text-pretty text-base text-muted-foreground">{feature.description}</p>
									) : null}
								</div>
								{feature.media ? (
									<div
										className={cn(
											"overflow-hidden rounded-2xl bg-muted [&_img]:size-full [&_img]:object-cover",
											flip && "lg:order-1",
										)}
									>
										{feature.media}
									</div>
								) : null}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
