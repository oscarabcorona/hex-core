import { Spacer } from "../../components/ui";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

/**
 * Spacer demo: vertical sizes shown between content blocks (the canonical
 * use case), plus a horizontal example inside an inline row.
 */
export function SpacerDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Vertical sizes</p>
				<div className="rounded-md border bg-muted/30 p-3">
					{sizes.map((size, i) => (
						<div key={size}>
							<div className="flex items-center gap-2">
								<span className="font-mono text-[10px] text-muted-foreground">{size}</span>
								<div className="h-2 flex-1 rounded-sm bg-foreground/10" />
							</div>
							{i < sizes.length - 1 && <Spacer size={size} />}
						</div>
					))}
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Horizontal pushes apart</p>
				<div className="flex items-center rounded-md border bg-muted/30 p-3">
					<span className="text-sm font-medium">Left</span>
					<Spacer axis="horizontal" size="xl" />
					<span className="text-sm font-medium">Right</span>
				</div>
			</div>
		</div>
	);
}
