"use client";

import {
	Button,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@hex-core/components";

/**
 * Tooltip patterns: icon-button labels, placement (top/right/bottom/left),
 * and a tooltip carrying a keyboard-shortcut hint.
 */
export function TooltipDemo() {
	return (
		<TooltipProvider>
			<div className="grid w-full max-w-md gap-6">
				<div>
					<p className="mb-2 text-xs font-medium text-muted-foreground">
						Icon-button labels
					</p>
					<div className="flex gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="icon" aria-label="Add item">
									+
								</Button>
							</TooltipTrigger>
							<TooltipContent>Add item</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="icon" aria-label="Delete item">
									×
								</Button>
							</TooltipTrigger>
							<TooltipContent>Delete item</TooltipContent>
						</Tooltip>
					</div>
				</div>

				<div>
					<p className="mb-2 text-xs font-medium text-muted-foreground">Placement</p>
					<div className="flex flex-wrap gap-2">
						{(["top", "right", "bottom", "left"] as const).map((side) => (
							<Tooltip key={side}>
								<TooltipTrigger asChild>
									<Button variant="outline" size="sm" className="capitalize">
										{side}
									</Button>
								</TooltipTrigger>
								<TooltipContent side={side} avoidCollisions={false}>
									Tooltip on {side}
								</TooltipContent>
							</Tooltip>
						))}
					</div>
				</div>

				<div>
					<p className="mb-2 text-xs font-medium text-muted-foreground">
						With keyboard shortcut
					</p>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline">Save</Button>
						</TooltipTrigger>
						<TooltipContent className="flex items-center gap-2">
							Save changes
							<kbd
								aria-hidden="true"
								className="rounded border border-primary-foreground/30 px-1 text-[10px] font-medium"
							>
								⌘S
							</kbd>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</TooltipProvider>
	);
}
