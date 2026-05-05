import { OrgChart } from "../../components/ui";

/** OrgChart demo: 4-person company hierarchy (CEO → CTO/CFO; Eng team under CTO). */
export function OrgChartDemo() {
	return (
		<OrgChart
			root={{
				id: "ceo",
				label: "Jane Doe",
				subtitle: "CEO",
				children: [
					{
						id: "cto",
						label: "Bob Smith",
						subtitle: "CTO",
						children: [{ id: "eng", label: "Eng Team", subtitle: "12 people" }],
					},
					{ id: "cfo", label: "Sara Lin", subtitle: "CFO" },
				],
			}}
		/>
	);
}
