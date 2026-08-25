import { Skeleton } from "@hex-core/components";

/**
 * Skeleton patterns: profile row, card placeholder, and a paragraph block.
 * Each container sets `aria-busy="true"` so screen readers know content is loading.
 */
export function SkeletonDemo() {
	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Profile row</p>
				<div className="flex items-center gap-4" aria-busy="true">
					<Skeleton className="h-12 w-12 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-[250px]" />
						<Skeleton className="h-4 w-[200px]" />
					</div>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Card</p>
				<div
					className="flex flex-col space-y-3 rounded-md border p-4"
					aria-busy="true"
				>
					<Skeleton className="h-40 w-full rounded-md" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
					</div>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Paragraph</p>
				<div className="space-y-2" aria-busy="true">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-[90%]" />
					<Skeleton className="h-4 w-[60%]" />
				</div>
			</div>
		</div>
	);
}
