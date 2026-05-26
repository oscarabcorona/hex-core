import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One team member in {@link MarketingTeam}. */
export interface MarketingTeamMember {
	/** Member name. */
	name: React.ReactNode;
	/** Role / title under the name. */
	role: React.ReactNode;
	/** Optional avatar — pass an `<Avatar>` or `<img>`. None is bundled. */
	avatar?: React.ReactNode;
	/** Optional short bio under the role. */
	bio?: React.ReactNode;
	/** Optional social-link icons (a `<div>` of anchors with accessible labels). */
	social?: React.ReactNode;
}

/** Props for {@link MarketingTeam}. */
export interface MarketingTeamProps {
	/** Team members to render. */
	members: ReadonlyArray<MarketingTeamMember>;
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** Cards per row on ≥lg: `three` (default) or `four`. */
	columns?: "three" | "four";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

const COLUMN_CLASS: Record<NonNullable<MarketingTeamProps["columns"]>, string> = {
	three: "sm:grid-cols-2 lg:grid-cols-3",
	four: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * A team section: an optional heading block above a grid of member cards
 * (avatar, name, role, optional bio + social links). Presentational and
 * theme-driven.
 */
export function MarketingTeam({
	members,
	eyebrow,
	title,
	description,
	columns = "three",
	className,
}: MarketingTeamProps) {
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
				<ul
					className={cn(
						"grid grid-cols-1 gap-x-8 gap-y-12",
						COLUMN_CLASS[columns],
						hasHeading && "mt-16",
					)}
				>
					{members.map((member, index) => (
						<li key={index} className="flex flex-col items-start gap-3">
							{member.avatar ? <div className="flex-none">{member.avatar}</div> : null}
							<div className="flex flex-col gap-1">
								<h3 className="text-base font-semibold text-foreground">{member.name}</h3>
								<p className="text-sm font-medium text-primary">{member.role}</p>
							</div>
							{member.bio ? (
								<p className="text-pretty text-sm text-muted-foreground">{member.bio}</p>
							) : null}
							{member.social ? (
								<div className="mt-auto flex items-center gap-3 pt-1">{member.social}</div>
							) : null}
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
