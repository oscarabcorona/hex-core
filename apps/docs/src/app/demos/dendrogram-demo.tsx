import { Dendrogram } from "../../components/ui";

/** Dendrogram demo: animal taxonomy (Mammals: Cat/Dog; Birds: Robin). */
export function DendrogramDemo() {
	return (
		<Dendrogram
			root={{
				id: "root",
				label: "Animals",
				children: [
					{
						id: "mammals",
						label: "Mammals",
						children: [
							{ id: "cat", label: "Cat" },
							{ id: "dog", label: "Dog" },
						],
					},
					{
						id: "birds",
						label: "Birds",
						children: [{ id: "robin", label: "Robin" }],
					},
				],
			}}
		/>
	);
}
