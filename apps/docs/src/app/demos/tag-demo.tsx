"use client";

import { useState } from "react";
import { Tag } from "../../components/ui";

const INITIAL_FILTERS = ["urgent", "design", "shipped"];

export function TagDemo() {
	const [filters, setFilters] = useState<string[]>(INITIAL_FILTERS);

	return (
		<div className="flex w-full max-w-lg flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Variants</p>
				<div className="flex flex-wrap items-center gap-2">
					<Tag>Default</Tag>
					<Tag variant="secondary">Secondary</Tag>
					<Tag variant="outline">Outline</Tag>
					<Tag variant="destructive">Destructive</Tag>
				</div>
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Dismissable filters</p>
				<div className="flex flex-wrap items-center gap-2">
					{filters.length > 0 ? (
						filters.map((f) => (
							<Tag
								key={f}
								variant="secondary"
								onRemove={() => setFilters((prev) => prev.filter((x) => x !== f))}
							>
								{f}
							</Tag>
						))
					) : (
						<button
							type="button"
							className="text-sm text-muted-foreground underline-offset-2 hover:underline"
							onClick={() => setFilters(INITIAL_FILTERS)}
						>
							Reset filters
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
