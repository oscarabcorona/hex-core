import { Separator } from "@hex-core/components";

export function SeparatorDemo() {
	return (
		<div className="w-full space-y-6">
			<div>
				<h4 className="mb-2 text-sm font-medium">Horizontal</h4>
				<Separator />
			</div>

			<div>
				<h4 className="mb-2 text-sm font-medium">Vertical (in flex row)</h4>
				<div className="flex h-5 items-center gap-4 text-sm">
					<span>Blog</span>
					<Separator orientation="vertical" />
					<span>Docs</span>
					<Separator orientation="vertical" />
					<span>Source</span>
				</div>
			</div>

			<div>
				<h4 className="mb-2 text-sm font-medium">In context (section divider)</h4>
				<div className="rounded-md border bg-card">
					<div className="space-y-0.5 p-4">
						<h5 className="text-sm font-semibold leading-none">Radix Primitives</h5>
						<p className="text-xs text-muted-foreground">
							An open-source UI component library.
						</p>
					</div>
					<Separator />
					<div className="flex h-10 items-center gap-4 px-4 text-sm">
						<span>Blog</span>
						<Separator orientation="vertical" />
						<span>Docs</span>
						<Separator orientation="vertical" />
						<span>Source</span>
					</div>
				</div>
			</div>
		</div>
	);
}
