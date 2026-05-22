import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One testimonial in {@link MarketingTestimonial}. */
export interface MarketingTestimonialItem {
	/** The quote text. */
	quote: React.ReactNode;
	/** Name of the person quoted. */
	authorName: React.ReactNode;
	/** Role / company line below the name. */
	authorTitle?: React.ReactNode;
	/** Author avatar — pass an `<Avatar>` or `<img>`. None is bundled. */
	avatar?: React.ReactNode;
}

/** Props for {@link MarketingTestimonial}. */
export interface MarketingTestimonialProps {
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** The testimonials. In `single` layout only the first is shown. */
	testimonials: ReadonlyArray<MarketingTestimonialItem>;
	/** `single` for one large featured quote, `grid` for a card grid. */
	layout?: "single" | "grid";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/** Author block shared by both layouts. */
function Author({ item }: { item: MarketingTestimonialItem }) {
	return (
		<div className="flex items-center gap-3">
			{item.avatar ? <div className="flex-none">{item.avatar}</div> : null}
			<div className="text-sm">
				<div className="font-semibold text-foreground">{item.authorName}</div>
				{item.authorTitle ? <div className="text-muted-foreground">{item.authorTitle}</div> : null}
			</div>
		</div>
	);
}

/**
 * A testimonials section. `single` features one large centered quote; `grid`
 * lays out several quote cards. Presentational and theme-driven.
 */
export function MarketingTestimonial({
	eyebrow,
	title,
	testimonials,
	layout = "single",
	className,
}: MarketingTestimonialProps) {
	const hasHeading = Boolean(eyebrow || title);

	if (layout === "single") {
		const item = testimonials[0];
		if (!item) return null;
		return (
			<section className={cn("bg-background py-24 sm:py-32", className)}>
				<figure className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 text-center lg:px-8">
					<blockquote className="text-balance text-2xl font-medium text-foreground sm:text-3xl">
						{item.quote}
					</blockquote>
					<figcaption>
						<Author item={item} />
					</figcaption>
				</figure>
			</section>
		);
	}

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
					</div>
				) : null}
				<div
					className={cn(
						"grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3",
						hasHeading && "mt-16",
					)}
				>
					{testimonials.map((item, index) => (
						<figure
							key={index}
							className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm"
						>
							<blockquote className="flex-1 text-pretty text-base text-foreground">
								{item.quote}
							</blockquote>
							<figcaption>
								<Author item={item} />
							</figcaption>
						</figure>
					))}
				</div>
			</div>
		</section>
	);
}
