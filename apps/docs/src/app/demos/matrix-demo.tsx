import { Matrix } from "../../components/ui";

/** Matrix demo: trade-flow heatmap between four regions, intensity-encoded. */
export function MatrixDemo() {
	return (
		<Matrix
			nodes={[
				{ id: "americas", label: "Americas" },
				{ id: "emea", label: "EMEA" },
				{ id: "apac", label: "APAC" },
				{ id: "africa", label: "Africa" },
			]}
			matrix={[
				[0, 12, 8, 1],
				[10, 0, 5, 2],
				[7, 4, 0, 3],
				[1, 1, 2, 0],
			]}
		/>
	);
}
