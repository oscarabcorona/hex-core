import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One settings group in {@link AppSettings}. */
export interface AppSettingsGroup {
	/** Group heading, e.g. "Profile". */
	title: React.ReactNode;
	/** Optional explanatory copy shown under the heading. */
	description?: React.ReactNode;
	/** The form controls for this group — typically Label + Input pairs. */
	children: React.ReactNode;
}

/** Props for {@link AppSettings}. */
export interface AppSettingsProps {
	/** The settings groups, stacked top to bottom. */
	groups: ReadonlyArray<AppSettingsGroup>;
	/** Additional classes applied to the root wrapper. */
	className?: string;
}

/**
 * Settings page layout: a stack of groups, each pairing a title + description
 * column with a card of form controls (two columns on ≥lg, stacked below).
 * Presentational and theme-driven — pass your own fields and submit handling.
 */
export function AppSettings({ groups, className }: AppSettingsProps) {
	return (
		<div className={cn("space-y-10 lg:space-y-12", className)}>
			{groups.map((group, index) => (
				<section key={index} className="grid gap-x-8 gap-y-6 lg:grid-cols-3">
					<div className="lg:col-span-1">
						<h3 className="text-base font-semibold text-foreground">{group.title}</h3>
						{group.description ? (
							<p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
						) : null}
					</div>
					<div className="lg:col-span-2">
						<div className="rounded-xl border border-border bg-card p-6 text-card-foreground">
							{group.children}
						</div>
					</div>
				</section>
			))}
		</div>
	);
}
