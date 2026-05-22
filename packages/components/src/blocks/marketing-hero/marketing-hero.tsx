import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Props for {@link MarketingHero}. Every text region is a `ReactNode` slot so
 * the caller (or an LLM assembling a page) composes content and CTAs from Hex
 * primitives rather than passing strings the block has to style blindly.
 */
export interface MarketingHeroProps {
	/** Small announcement / eyebrow above the title — e.g. a `<Badge>` pill. */
	eyebrow?: React.ReactNode;
	/** The headline. Required — a hero with no title is a layout, not a hero. */
	title: React.ReactNode;
	/** Supporting subcopy below the title. */
	description?: React.ReactNode;
	/** Call-to-action buttons. Pass one or more `<Button>` elements. */
	actions?: React.ReactNode;
	/** Visual (screenshot / illustration). Beside the copy when `layout="split"`, below it otherwise. */
	media?: React.ReactNode;
	/** `centered` (default) for a single-column hero, `split` for copy + media side-by-side on ≥lg. */
	layout?: "centered" | "split";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Top-of-page marketing hero. Presentational and theme-driven — all colors
 * come from semantic tokens so it adapts to any Hex theme. Server Component
 * by default; interactivity lives in the `actions` you pass in. See the
 * schema's `examples` for usage.
 */
export function MarketingHero({
	eyebrow,
	title,
	description,
	actions,
	media,
	layout = "centered",
	className,
}: MarketingHeroProps) {
	if (layout === "split") {
		return (
			<section className={cn("bg-background py-24 sm:py-32", className)}>
				<div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
					<div className="flex flex-col items-start gap-6">
						{eyebrow ? <div>{eyebrow}</div> : null}
						<h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
							{title}
						</h1>
						{description ? (
							<p className="max-w-xl text-pretty text-lg text-muted-foreground">{description}</p>
						) : null}
						{actions ? <div className="flex flex-wrap items-center gap-4">{actions}</div> : null}
					</div>
					{media ? <div className="lg:justify-self-end">{media}</div> : null}
				</div>
			</section>
		);
	}

	return (
		<section className={cn("bg-background py-24 sm:py-32", className)}>
			<div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center lg:px-8">
				{eyebrow ? <div>{eyebrow}</div> : null}
				<h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
					{title}
				</h1>
				{description ? (
					<p className="max-w-2xl text-pretty text-lg text-muted-foreground">{description}</p>
				) : null}
				{actions ? (
					<div className="flex flex-wrap items-center justify-center gap-4">{actions}</div>
				) : null}
				{media ? <div className="mt-8 w-full">{media}</div> : null}
			</div>
		</section>
	);
}
