"use client";

import { Marquee } from "@hex-core/motion";

const LOGOS = ["Apollo", "Stripe", "Vercel", "Linear", "Notion", "Replicate", "Anthropic"];

export function MarqueeDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-3">
			<p className="text-xs font-medium text-muted-foreground">
				Hover to pause. Pause-on-hover is on by default.
			</p>
			<Marquee
				speed={18000}
				gap={32}
				className="rounded-md border bg-card py-4"
			>
				{LOGOS.map((logo) => (
					<span
						key={logo}
						className="text-sm font-semibold tracking-tight text-foreground"
					>
						{logo}
					</span>
				))}
			</Marquee>
		</div>
	);
}
