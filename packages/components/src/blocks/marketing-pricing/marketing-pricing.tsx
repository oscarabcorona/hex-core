import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One pricing tier in {@link MarketingPricing}. */
export interface MarketingPricingTier {
	/** Plan name, e.g. "Pro". */
	name: React.ReactNode;
	/** Headline price, e.g. "$29". */
	price: React.ReactNode;
	/** Billing period suffix, e.g. "/mo". */
	period?: React.ReactNode;
	/** One-line plan summary. */
	description?: React.ReactNode;
	/** Included features — each renders as a checked list item. */
	features: ReadonlyArray<React.ReactNode>;
	/** The plan's CTA — pass a `<Button>` (use `asChild` to make it a link). */
	cta: React.ReactNode;
	/** Visually emphasize this tier (ring + raised) as the recommended plan. */
	highlighted?: boolean;
	/** Flag shown on the highlighted tier, e.g. a `<Badge>Most popular</Badge>`. */
	badge?: React.ReactNode;
}

/** Props for {@link MarketingPricing}. */
export interface MarketingPricingProps {
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** The pricing tiers, rendered left-to-right. */
	tiers: ReadonlyArray<MarketingPricingTier>;
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Decorative check glyph for feature rows. `aria-hidden` — the feature text
 * carries the meaning.
 */
function CheckIcon() {
	return (
		<svg
			viewBox="0 0 20 20"
			fill="currentColor"
			aria-hidden="true"
			className="size-5 flex-none text-primary"
		>
			<path
				fillRule="evenodd"
				d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.1 3.1 6.8-6.8a1 1 0 0 1 1.4 0Z"
				clipRule="evenodd"
			/>
		</svg>
	);
}

/**
 * A pricing section: an optional heading block above a row of plan cards.
 * Highlight one tier as recommended. Presentational and theme-driven — supply
 * the CTA buttons so navigation and analytics stay with the consumer.
 */
export function MarketingPricing({
	eyebrow,
	title,
	description,
	tiers,
	className,
}: MarketingPricingProps) {
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
						"grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3",
						hasHeading && "mt-16",
					)}
				>
					{tiers.map((tier, index) => (
						<div
							key={index}
							className={cn(
								"flex flex-col rounded-2xl border bg-card p-8 text-card-foreground transition-all duration-200 ease-out",
								tier.highlighted
									? "border-primary shadow-lg ring-1 ring-primary"
									: "border-border shadow-sm",
							)}
						>
							<div className="flex items-center justify-between gap-3">
								<h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
								{tier.badge ? <div>{tier.badge}</div> : null}
							</div>
							{tier.description ? (
								<p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
							) : null}
							<p className="mt-6 flex items-baseline gap-1">
								<span className="text-4xl font-semibold tracking-tight text-foreground">
									{tier.price}
								</span>
								{tier.period ? (
									<span className="text-sm text-muted-foreground">{tier.period}</span>
								) : null}
							</p>
							<ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
								{tier.features.map((feature, featureIndex) => (
									<li key={featureIndex} className="flex items-start gap-3">
										<CheckIcon />
										<span>{feature}</span>
									</li>
								))}
							</ul>
							<div className="mt-8 [&_button]:w-full [&>*]:w-full">{tier.cta}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
