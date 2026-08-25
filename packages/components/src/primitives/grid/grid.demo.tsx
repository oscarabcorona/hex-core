import { Grid } from "@hex-core/components";

/**
 * Grid demo: fixed-column variants (3 cols) and the responsive auto-fit
 * pattern. The auto-fit example uses a smaller minColWidth so wrapping is
 * visible inside the docs preview frame.
 */
export function GridDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Fixed 3 cols</p>
				<Grid cols={3} gap="md">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: demo placeholders
							key={i}
							className="flex h-16 items-center justify-center rounded-md border bg-muted/30 text-sm font-medium text-muted-foreground"
						>
							{i + 1}
						</div>
					))}
				</Grid>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Auto-fit (min 7rem)</p>
				<Grid cols="auto-fit" minColWidth="7rem" gap="sm">
					{Array.from({ length: 7 }).map((_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: demo placeholders
							key={i}
							className="flex h-12 items-center justify-center rounded-md border bg-muted/30 text-xs text-muted-foreground"
						>
							card {i + 1}
						</div>
					))}
				</Grid>
			</div>
		</div>
	);
}
