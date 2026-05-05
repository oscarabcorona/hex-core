import { Cloze } from "../../components/ui";

/** Cloze demo: cell biology fill-in-the-blank with two redacted spans. */
export function ClozeDemo() {
	return (
		<Cloze
			parts={[
				"The mitochondria is the ",
				{ hidden: "powerhouse" },
				" of the cell. It generates most of the cell's ",
				{ hidden: "ATP" },
				" through aerobic respiration.",
			]}
		/>
	);
}
