"use client";

import { useState } from "react";
import { Cluster, Suggestion } from "../../components/ui";

const STARTERS = [
	"Summarize today's PR activity",
	"Draft a launch announcement",
	"Explain the new theming system",
	"Write release notes for 1.6.0",
];

export function SuggestionDemo() {
	const [picked, setPicked] = useState<string | null>(null);

	return (
		<div className="flex w-full max-w-lg flex-col gap-4">
			<Cluster gap="sm">
				{STARTERS.map((s) => (
					<Suggestion key={s} value={s} onSelect={setPicked}>
						{s}
					</Suggestion>
				))}
			</Cluster>
			{picked ? <p className="text-xs text-muted-foreground">Picked: {picked}</p> : null}
		</div>
	);
}
