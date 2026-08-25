import { Funnel } from "@hex-core/components";

/** Funnel demo: signup conversion drop-off across 4 stages with stage-to-stage rate annotations. */
export function FunnelDemo() {
	return (
		<Funnel
			stages={[
				{ id: "visit", label: "Visited", value: 10000 },
				{ id: "signup", label: "Signed up", value: 1200 },
				{ id: "active", label: "Active", value: 480 },
				{ id: "paid", label: "Paid", value: 95 },
			]}
		/>
	);
}
