"use client";

import { useState } from "react";
import { PageTransition } from "@hex-core/motion";

const PAGES = {
	home: { title: "Home", body: "Welcome to the marketing site." },
	docs: { title: "Docs", body: "Browse the component catalog." },
	pricing: { title: "Pricing", body: "Simple, agent-friendly pricing." },
} as const;

export function PageTransitionDemo() {
	const [page, setPage] = useState<keyof typeof PAGES>("home");
	return (
		<div className="flex w-full max-w-md flex-col gap-3">
			<div className="flex gap-2">
				{(Object.keys(PAGES) as Array<keyof typeof PAGES>).map((key) => (
					<button
						type="button"
						key={key}
						onClick={() => setPage(key)}
						className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
							page === key
								? "bg-primary text-primary-foreground"
								: "bg-secondary text-secondary-foreground"
						}`}
					>
						{PAGES[key].title}
					</button>
				))}
			</div>
			<div className="min-h-32 rounded-md border bg-card p-4">
				<PageTransition pageKey={page} duration={250}>
					<div className="text-sm text-foreground">
						<h3 className="text-lg font-semibold">{PAGES[page].title}</h3>
						<p className="mt-1 text-muted-foreground">{PAGES[page].body}</p>
					</div>
				</PageTransition>
			</div>
		</div>
	);
}
