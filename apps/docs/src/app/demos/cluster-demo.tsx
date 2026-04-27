import { Badge, Cluster } from "../../components/ui";

const tags = ["react", "typescript", "tailwind", "radix", "next", "vite", "esm", "vitest"];

/**
 * Cluster demo: wrapping tag list (the canonical use case), plus a baseline
 * alignment example with mixed-size children to show `align="baseline"`.
 */
export function ClusterDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Wrapping tag list</p>
				<Cluster gap="sm" className="rounded-md border bg-muted/30 p-3">
					{tags.map((tag) => (
						<Badge key={tag} variant="secondary">
							{tag}
						</Badge>
					))}
				</Cluster>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Baseline alignment</p>
				<Cluster gap="md" align="baseline" className="rounded-md border bg-muted/30 p-3">
					<span className="text-3xl font-bold">$45</span>
					<span className="text-sm text-muted-foreground">per month</span>
					<Badge variant="outline">Pro</Badge>
				</Cluster>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Justify between</p>
				<Cluster justify="between" align="center" className="rounded-md border bg-muted/30 p-3">
					<span className="text-sm font-medium">Total</span>
					<span className="font-mono text-sm">$1,200.00</span>
				</Cluster>
			</div>
		</div>
	);
}
