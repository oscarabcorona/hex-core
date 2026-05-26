import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One content card in {@link MarketingContent}. */
export interface MarketingContentPost {
	/** Post / article title. */
	title: React.ReactNode;
	/** Short excerpt / summary. */
	excerpt?: React.ReactNode;
	/** Optional link to the full post. Makes the card a single linked surface. */
	href?: string;
	/** Optional preview image — a `ReactNode` (`<img>`); none is bundled. */
	image?: React.ReactNode;
	/** Optional meta line (date, author, category, read-time). */
	meta?: React.ReactNode;
}

/** Props for {@link MarketingContent}. */
export interface MarketingContentProps {
	/** Posts to render. */
	posts: ReadonlyArray<MarketingContentPost>;
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** Cards per row on ≥lg: `two` or `three` (default). */
	columns?: "two" | "three";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

const COLUMN_CLASS: Record<NonNullable<MarketingContentProps["columns"]>, string> = {
	two: "sm:grid-cols-2",
	three: "sm:grid-cols-2 lg:grid-cols-3",
};

/** Card body shared by the linked and unlinked variants. */
function ContentCardBody({ post }: { post: MarketingContentPost }) {
	return (
		<>
			{post.image ? (
				<div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted [&_img]:size-full [&_img]:object-cover [&_img]:transition-transform [&_img]:duration-200 [&_img]:ease-out group-hover:[&_img]:scale-105">
					{post.image}
				</div>
			) : null}
			{post.meta ? <p className="text-xs font-medium text-muted-foreground">{post.meta}</p> : null}
			<h3 className="text-base font-semibold text-foreground group-hover:text-primary">
				{post.title}
			</h3>
			{post.excerpt ? (
				<p className="text-pretty text-sm text-muted-foreground">{post.excerpt}</p>
			) : null}
		</>
	);
}

/**
 * A blog / content grid: an optional heading block above a responsive grid of
 * content cards (preview image, meta, title, excerpt). Cards become a single
 * linked surface when `href` is set. Presentational and theme-driven.
 */
export function MarketingContent({
	posts,
	eyebrow,
	title,
	description,
	columns = "three",
	className,
}: MarketingContentProps) {
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
						"grid grid-cols-1 gap-x-8 gap-y-12",
						COLUMN_CLASS[columns],
						hasHeading && "mt-16",
					)}
				>
					{posts.map((post, index) =>
						post.href ? (
							<a key={index} href={post.href} className="group flex flex-col gap-3">
								<ContentCardBody post={post} />
							</a>
						) : (
							<article key={index} className="group flex flex-col gap-3">
								<ContentCardBody post={post} />
							</article>
						),
					)}
				</div>
			</div>
		</section>
	);
}
