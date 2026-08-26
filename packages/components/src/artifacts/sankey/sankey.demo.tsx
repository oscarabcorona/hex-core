import { Sankey } from "@hex-core/components";

/** Sankey demo: energy flow from sources (Coal/Gas/Solar) through Grid to consumers (Homes/Industry). */
export function SankeyDemo() {
	return (
		<Sankey
			nodes={[
				{ id: "coal", label: "Coal" },
				{ id: "gas", label: "Gas" },
				{ id: "solar", label: "Solar" },
				{ id: "grid", label: "Grid" },
				{ id: "homes", label: "Homes" },
				{ id: "industry", label: "Industry" },
			]}
			links={[
				{ source: "coal", target: "grid", value: 60 },
				{ source: "gas", target: "grid", value: 30 },
				{ source: "solar", target: "grid", value: 25 },
				{ source: "grid", target: "homes", value: 70 },
				{ source: "grid", target: "industry", value: 45 },
			]}
		/>
	);
}
