"use client";

import { Plan } from "../../components/ui";

export function PlanDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-4">
			<Plan
				label="Refactor auth module"
				description="Three-step refactor with tests."
				steps={[
					{ id: "read", label: "Read existing auth", detail: "Audit token-rotation logic in lib/auth.ts." },
					{ id: "apply", label: "Apply changes", detail: "Migrate 3 callsites to the new helper." },
					{ id: "test", label: "Run tests", detail: "Unit + integration." },
				]}
				onApprove={() => undefined}
				onCancel={() => undefined}
			/>
			<Plan
				label="Migrate users table (read-only display)"
				description="No approval gate — display only."
				steps={[
					{ id: "users", label: "Migrate users", detail: "1.2M rows, batched in 10k chunks." },
					{ id: "orders", label: "Migrate orders", detail: "8M rows, dual-write window." },
					{ id: "verify", label: "Verify integrity" },
				]}
			/>
			<Plan
				steps={[
					{ id: "fetch", label: "Fetch model" },
					{ id: "load", label: "Load weights" },
					{ id: "warm", label: "Warm caches" },
				]}
				onApprove={() => undefined}
				approveLabel="Run it"
			/>
		</div>
	);
}
