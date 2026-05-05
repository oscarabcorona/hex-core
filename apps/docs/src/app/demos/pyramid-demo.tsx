import { Pyramid } from "../../components/ui";

/** Pyramid demo: Maslow's hierarchy of needs as a 5-tier widening pyramid. */
export function PyramidDemo() {
	return (
		<Pyramid
			tiers={[
				{ id: "a", label: "Self-actualization" },
				{ id: "e", label: "Esteem" },
				{ id: "l", label: "Love & belonging" },
				{ id: "s", label: "Safety" },
				{ id: "p", label: "Physiological" },
			]}
		/>
	);
}
