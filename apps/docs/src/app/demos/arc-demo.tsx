import { Arc } from "../../components/ui";

/** Arc demo: 5 ordered nodes with co-occurrence arcs above the baseline. */
export function ArcDemo() {
	return (
		<Arc
			nodes={[
				{ id: "alice", label: "Alice" },
				{ id: "bob", label: "Bob" },
				{ id: "carol", label: "Carol" },
				{ id: "dave", label: "Dave" },
				{ id: "eve", label: "Eve" },
			]}
			edges={[
				{ source: "alice", target: "bob" },
				{ source: "alice", target: "carol" },
				{ source: "bob", target: "dave" },
				{ source: "carol", target: "eve" },
				{ source: "dave", target: "eve" },
			]}
		/>
	);
}
