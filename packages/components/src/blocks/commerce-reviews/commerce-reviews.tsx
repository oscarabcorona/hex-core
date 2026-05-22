import * as React from "react";
import { cn } from "../../lib/utils.js";

/** A single customer review in {@link CommerceReviews}. */
export interface CommerceReview {
	/** Reviewer name. */
	author: React.ReactNode;
	/** Rating from 0–5 (clamped, rounded for the star display). */
	rating: number;
	/** Optional review headline. */
	title?: React.ReactNode;
	/** The review body. */
	body: React.ReactNode;
	/** Optional date string. */
	date?: React.ReactNode;
}

/** Props for {@link CommerceReviews}. */
export interface CommerceReviewsProps {
	/** The reviews to list. */
	reviews: ReadonlyArray<CommerceReview>;
	/** Optional average rating (0–5) shown in the summary header. */
	averageRating?: number;
	/** Optional total review count shown in the summary header. */
	totalCount?: number;
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/** Clamp + round a raw rating into the 0–5 integer the star row renders. */
function toStars(rating: number): number {
	return Math.max(0, Math.min(5, Math.round(rating)));
}

/** Five-star row. The accessible label comes from the parent; stars are decorative. */
function Stars({ rating }: { rating: number }) {
	const filled = toStars(rating);
	return (
		<span className="inline-flex" aria-hidden="true">
			{[0, 1, 2, 3, 4].map((index) => (
				<svg
					key={index}
					viewBox="0 0 20 20"
					fill="currentColor"
					className={cn("size-4", index < filled ? "text-primary" : "text-muted")}
				>
					<path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
				</svg>
			))}
		</span>
	);
}

/**
 * A product reviews section: a summary header (average rating + count) above a
 * list of individual reviews, each with a star rating, author, optional date,
 * and body. Presentational and theme-driven.
 */
export function CommerceReviews({
	reviews,
	averageRating,
	totalCount,
	className,
}: CommerceReviewsProps) {
	return (
		<section className={cn("bg-background py-16 sm:py-20", className)}>
			<div className="mx-auto max-w-3xl px-6 lg:px-8">
				<div className="flex flex-col gap-2">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground">Customer reviews</h2>
					{averageRating !== undefined ? (
						<div className="flex items-center gap-3">
							<Stars rating={averageRating} />
							<span className="text-sm text-muted-foreground">
								{averageRating.toFixed(1)} out of 5
								{totalCount !== undefined ? ` · ${totalCount} reviews` : null}
							</span>
						</div>
					) : null}
				</div>

				<ul className="mt-10 flex flex-col divide-y divide-border">
					{reviews.map((review, index) => (
						<li key={index} className="flex flex-col gap-2 py-8 first:pt-0">
							<div className="flex items-center justify-between gap-3">
								<Stars rating={review.rating} />
								{review.date ? (
									<span className="text-sm text-muted-foreground">{review.date}</span>
								) : null}
							</div>
							{review.title ? (
								<h3 className="text-sm font-semibold text-foreground">{review.title}</h3>
							) : null}
							<p className="text-pretty text-sm text-muted-foreground">{review.body}</p>
							<p className="text-sm font-medium text-foreground">{review.author}</p>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
