import { Trace } from "../../components/ui";

export function TraceDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-6">
			<Trace
				ariaLabel="Migration agent trace"
				steps={[
					{
						id: "1",
						kind: "think",
						title: "Plan the migration",
						detail: "User asked for a 3-table dual-write window.",
						durationMs: 450,
						timestamp: "14:30:01",
					},
					{
						id: "2",
						kind: "tool-call",
						title: "read schema/users.sql",
						detail: "12 columns, indexed on email + tenant_id.",
						durationMs: 120,
						timestamp: "14:30:02",
					},
					{
						id: "3",
						kind: "observation",
						title: "1.2M rows; 80k active in last 30d",
						durationMs: 60,
						timestamp: "14:30:02",
					},
					{
						id: "4",
						kind: "tool-call",
						title: "ALTER TABLE users ADD COLUMN tenant_v2",
						durationMs: 4200,
						timestamp: "14:30:06",
					},
					{
						id: "5",
						kind: "error",
						title: "Lock timeout after 30s",
						detail: "Tx held by tenant=42 — retrying with smaller batch.",
						timestamp: "14:30:36",
					},
				]}
			/>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Compact (size=&quot;sm&quot;)</p>
				<Trace
					ariaLabel="Recent steps"
					size="sm"
					steps={[
						{ id: "1", kind: "think", title: "Quick check", durationMs: 90 },
						{ id: "2", kind: "tool-call", title: "GET /api/health", durationMs: 40 },
						{ id: "3", kind: "observation", title: "All systems green" },
					]}
				/>
			</div>
		</div>
	);
}
