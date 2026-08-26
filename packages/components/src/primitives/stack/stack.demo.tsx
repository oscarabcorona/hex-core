import { Stack } from "@hex-core/components";

const gaps = ["xs", "sm", "md", "lg", "xl"] as const;

/**
 * Stack demo: gap scale shown vertically, plus an alignment example with
 * mixed-width children to make `align="center"` visible.
 */
export function StackDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Gap scale</p>
				<div className="flex gap-3">
					{gaps.map((gap) => (
						<div key={gap} className="flex flex-1 flex-col items-center gap-1">
							<Stack gap={gap} className="w-full rounded-md bg-muted/40 p-2">
								<div className="h-3 rounded-sm bg-foreground/20" />
								<div className="h-3 rounded-sm bg-foreground/20" />
								<div className="h-3 rounded-sm bg-foreground/20" />
							</Stack>
							<span className="font-mono text-[10px] text-muted-foreground">{gap}</span>
						</div>
					))}
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Centered hero</p>
				<Stack gap="md" align="center" className="rounded-md border bg-muted/30 p-4">
					<h3 className="text-lg font-semibold">Title</h3>
					<p className="text-sm text-muted-foreground">Subtitle that is wider than the title.</p>
					<button
						type="button"
						className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
					>
						Get started
					</button>
				</Stack>
			</div>
		</div>
	);
}
