import { Context } from "../../components/ui";

export function ContextDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Default — 24% (ok)</p>
				<Context used={47_000} max={200_000} />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Warning — 80%</p>
				<Context used={160_000} max={200_000} />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Danger — 95%</p>
				<Context used={190_000} max={200_000} />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Custom label + thresholds</p>
				<Context
					label="Retrieved chunks"
					used={6}
					max={10}
					warningAt={0.5}
					dangerAt={0.8}
				/>
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Small numbers (no k formatter)</p>
				<Context used={250} max={500} />
			</div>
		</div>
	);
}
