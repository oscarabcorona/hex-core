import type { Prop } from "@hex-core/registry";

/**
 * Renders a component's prop interface as an API reference table. Required
 * props get a pill badge; optional props are unadorned.
 * @param props - Array of prop definitions from the registry
 */
export function PropsTable({ props }: { props: Prop[] }) {
	if (props.length === 0) {
		return <p className="text-sm text-muted-foreground">No props.</p>;
	}

	return (
		<div className="overflow-x-auto rounded-lg border">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b bg-muted/50">
						<th className="px-4 py-3 text-left font-medium">Prop</th>
						<th className="px-4 py-3 text-left font-medium">Type</th>
						<th className="px-4 py-3 text-left font-medium">Default</th>
						<th className="px-4 py-3 text-left font-medium">Description</th>
					</tr>
				</thead>
				<tbody>
					{props.map((prop) => (
						<tr key={prop.name} className="border-b last:border-0">
							<td className="px-4 py-3">
								<div className="flex items-center gap-1.5">
									<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
										{prop.name}
									</code>
									{prop.required ? (
										<span
											aria-label="required"
											className="inline-flex items-center rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
										>
											required
										</span>
									) : null}
								</div>
							</td>
							<td className="px-4 py-3">
								<code className="text-xs text-muted-foreground">{formatType(prop)}</code>
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{prop.default !== undefined && prop.default !== null
									? String(prop.default)
									: "—"}
							</td>
							<td className="px-4 py-3 text-muted-foreground">{prop.description}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/** Format a prop's type (incl. enum values) for display. */
function formatType(prop: Prop): string {
	if (prop.type === "enum" && prop.enumValues) {
		return prop.enumValues.map((v) => `"${v}"`).join(" | ");
	}
	return prop.type;
}
