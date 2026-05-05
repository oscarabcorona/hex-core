import { Flowchart } from "../../components/ui";

/** Flowchart demo: authorization decision flow with terminal/diamond/rect node shapes. */
export function FlowchartDemo() {
	return (
		<Flowchart
			nodes={[
				{ id: "start", label: "Start", shape: "round" },
				{ id: "check", label: "Authorized?", shape: "diamond" },
				{ id: "ok", label: "Continue" },
				{ id: "denied", label: "Reject", shape: "round" },
			]}
			edges={[
				{ source: "start", target: "check" },
				{ source: "check", target: "ok", label: "yes" },
				{ source: "check", target: "denied", label: "no" },
			]}
		/>
	);
}
