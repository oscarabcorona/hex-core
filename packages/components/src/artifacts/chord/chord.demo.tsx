import { Chord } from "@hex-core/components";

/** Chord demo: bidirectional trade flow between four world regions. */
export function ChordDemo() {
	return (
		<Chord
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
