import { Sequence } from "@hex-core/components";

/** Sequence demo: signup flow across User → API → DB with sync + return arrows. */
export function SequenceDemo() {
	return (
		<Sequence
			actors={[
				{ id: "user", label: "User" },
				{ id: "api", label: "API" },
				{ id: "db", label: "DB" },
			]}
			messages={[
				{ from: "user", to: "api", label: "POST /signup" },
				{ from: "api", to: "db", label: "INSERT user" },
				{ from: "db", to: "api", label: "ok", type: "return" },
				{ from: "api", to: "user", label: "201 Created", type: "return" },
			]}
		/>
	);
}
