import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One event in {@link AppFeed}. */
export interface AppFeedEvent {
	/** The event message (one line). */
	message: React.ReactNode;
	/** Optional actor name (rendered emphasized inline). */
	actor?: React.ReactNode;
	/** Optional time-of-day label (e.g. "9:42 AM"). */
	time?: React.ReactNode;
	/** Optional extra detail block under the message. */
	details?: React.ReactNode;
	/** Optional leading icon / status dot for the timeline rail. */
	icon?: React.ReactNode;
}

/** A group of events, typically a day. */
export interface AppFeedGroup {
	/** Date label for the group (e.g. "Today", "May 22, 2026"). */
	date: React.ReactNode;
	/** Events in this group, newest first by convention. */
	events: ReadonlyArray<AppFeedEvent>;
}

/** Props for {@link AppFeed}. */
export interface AppFeedProps {
	/** Grouped events (typically by day). */
	groups: ReadonlyArray<AppFeedGroup>;
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** Additional classes applied to the root wrapper. */
	className?: string;
}

/**
 * Chronological activity feed, grouped by day. Each event shows a small
 * leading icon on a vertical rail, an actor + message line, optional time,
 * and optional details. Presentational and theme-driven — sort the events
 * yourself before passing them in.
 */
export function AppFeed({
	groups,
	eyebrow,
	title,
	description,
	className,
}: AppFeedProps) {
	const hasHeading = Boolean(eyebrow || title || description);
	return (
		<section className={cn("flex flex-col gap-6", className)}>
			{hasHeading ? (
				<div className="flex flex-col gap-1">
					{eyebrow ? (
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
					) : null}
					{title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
					{description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
				</div>
			) : null}
			<div className="flex flex-col gap-8">
				{groups.map((group, groupIndex) => (
					<div key={groupIndex} className="flex flex-col gap-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{group.date}
						</p>
						<ol className="relative ml-2 flex flex-col gap-5 border-l border-border pl-6">
							{group.events.map((event, eventIndex) => (
								<li key={eventIndex} className="relative flex flex-col gap-1">
									<span
										className="absolute -left-[27px] top-1 flex size-4 items-center justify-center rounded-full border border-border bg-card text-card-foreground [&_svg]:size-3"
										aria-hidden="true"
									>
										{event.icon}
									</span>
									<div className="flex flex-wrap items-baseline gap-2 text-sm text-foreground">
										{event.actor ? <span className="font-medium">{event.actor}</span> : null}
										<span className="text-muted-foreground">{event.message}</span>
										{event.time ? (
											<span className="ml-auto text-xs text-muted-foreground">{event.time}</span>
										) : null}
									</div>
									{event.details ? (
										<div className="mt-1 rounded-md border border-border bg-card p-3 text-sm text-card-foreground">
											{event.details}
										</div>
									) : null}
								</li>
							))}
						</ol>
					</div>
				))}
			</div>
		</section>
	);
}
