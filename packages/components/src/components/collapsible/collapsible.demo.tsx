"use client";

import { useState } from "react";
import {
	Button,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@hex-core/components";

/**
 * Collapsible patterns: "show more" list with a rotating chevron driven by
 * `data-[state=open]`, and a labeled advanced-options panel with an outline trigger.
 */
export function CollapsibleDemo() {
	// Local state drives only the Hide/Show button label — chevron rotation
	// is pure CSS via the trigger's Radix-managed data-state attribute.
	const [open, setOpen] = useState(false);

	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Show-more list (chevron rotates on open)
				</p>
				<Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
					<div className="flex items-center justify-between space-x-4 px-4">
						<h4 className="text-sm font-semibold">
							@peduarte starred 3 repositories
						</h4>
						<CollapsibleTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="w-20 justify-between [&[data-state=open]>svg]:rotate-180"
							>
								{open ? "Hide" : "Show"}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-4 w-4 transition-transform duration-200"
									aria-hidden="true"
								>
									<polyline points="6 9 12 15 18 9" />
								</svg>
							</Button>
						</CollapsibleTrigger>
					</div>
					<div className="rounded-md border px-4 py-3 font-mono text-sm">
						@radix-ui/primitives
					</div>
					<CollapsibleContent className="space-y-2">
						<div className="rounded-md border px-4 py-3 font-mono text-sm">
							@radix-ui/colors
						</div>
						<div className="rounded-md border px-4 py-3 font-mono text-sm">
							@stitches/react
						</div>
					</CollapsibleContent>
				</Collapsible>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Advanced options (outline trigger)
				</p>
				<Collapsible defaultOpen={false} className="rounded-md border p-4">
					<CollapsibleTrigger asChild>
						<Button variant="outline" size="sm" className="w-full justify-between">
							Advanced options
							<span aria-hidden="true" className="text-xs text-muted-foreground">
								⌥ A
							</span>
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className="mt-3 space-y-2 text-sm text-muted-foreground">
						<p>These settings tune behaviour for power users:</p>
						<ul className="ml-4 list-disc space-y-1">
							<li>Enable experimental features</li>
							<li>Verbose logging</li>
							<li>Custom cache directory</li>
						</ul>
					</CollapsibleContent>
				</Collapsible>
			</div>
		</div>
	);
}
