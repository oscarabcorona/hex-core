import {
	Button,
	Input,
	Label,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@hex-core/components";

/**
 * Popover patterns: inline form (dimensions), info card, and a
 * plain-button trigger that anchors to the right.
 */
export function PopoverDemo() {
	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Inline form</p>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline">Dimensions</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80">
						<div className="grid gap-4">
							<div className="space-y-1">
								<h4 className="font-medium leading-none">Dimensions</h4>
								<p className="text-sm text-muted-foreground">
									Set the dimensions for the layer.
								</p>
							</div>
							<div className="grid gap-2">
								<div className="grid grid-cols-3 items-center gap-4">
									<Label htmlFor="pop-width">Width</Label>
									<Input id="pop-width" defaultValue="100%" className="col-span-2 h-8" />
								</div>
								<div className="grid grid-cols-3 items-center gap-4">
									<Label htmlFor="pop-height">Height</Label>
									<Input
										id="pop-height"
										defaultValue="25px"
										className="col-span-2 h-8"
									/>
								</div>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Info card</p>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" size="sm">
							What&apos;s this?
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start">
						<div className="space-y-2 text-sm">
							<p className="font-medium leading-none">API key</p>
							<p className="text-muted-foreground">
								Keep this secret. Rotate it immediately if exposed.
							</p>
						</div>
					</PopoverContent>
				</Popover>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Right-anchored
				</p>
				<div className="flex justify-end">
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm">
								Filters
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end">
							<div className="space-y-2 text-sm">
								<p className="font-medium leading-none">Filter results</p>
								<p className="text-muted-foreground">
									This panel anchors to the trigger&apos;s right edge via{" "}
									<code className="rounded bg-muted px-1 py-0.5 text-xs">
										{`align="end"`}
									</code>
									.
								</p>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>
		</div>
	);
}
