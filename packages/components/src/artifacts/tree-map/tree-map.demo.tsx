import { TreeMap } from "@hex-core/components";

/** TreeMap demo: file-size visualization across four top-level folders. */
export function TreeMapDemo() {
	return (
		<TreeMap
			root={{
				id: "root",
				label: "src",
				children: [
					{ id: "a", label: "app", value: 240 },
					{ id: "l", label: "lib", value: 90 },
					{ id: "t", label: "tests", value: 120 },
					{ id: "s", label: "scripts", value: 40 },
				],
			}}
		/>
	);
}
