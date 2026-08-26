import { LoadingIndicator } from "@hex-core/components";

export function LoadingIndicatorDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">With label</p>
				<LoadingIndicator label="Thinking…" />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Inline only</p>
				<LoadingIndicator />
			</div>
		</div>
	);
}
