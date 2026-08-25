import { Venn } from "@hex-core/components";

/** Venn demo: 3-set OS overlap (Linux / Mac / Windows). */
export function VennDemo() {
	return (
		<Venn
			sets={[
				{ id: "linux", label: "Linux" },
				{ id: "mac", label: "Mac" },
				{ id: "windows", label: "Windows" },
			]}
		/>
	);
}
