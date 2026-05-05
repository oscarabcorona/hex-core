import { Sunburst } from "../../components/ui";

/** Sunburst demo: portfolio split with sub-allocations (Equity → US/Intl, Fixed Income). */
export function SunburstDemo() {
	return (
		<Sunburst
			root={{
				id: "root",
				label: "Portfolio",
				children: [
					{
						id: "eq",
						label: "Equity",
						children: [
							{ id: "us", label: "US", value: 60 },
							{ id: "intl", label: "Intl", value: 20 },
						],
					},
					{ id: "fx", label: "Fixed Income", value: 20 },
				],
			}}
		/>
	);
}
