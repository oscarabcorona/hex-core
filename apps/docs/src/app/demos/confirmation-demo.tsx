"use client";

import { useState } from "react";
import { Button, Confirmation } from "../../components/ui";

export function ConfirmationDemo() {
	const [lastAction, setLastAction] = useState<string | null>(null);

	return (
		<div className="flex w-full max-w-lg flex-col gap-4">
			<div className="flex flex-wrap items-center gap-2">
				<Confirmation
					trigger={<Button variant="destructive">Delete account</Button>}
					title="Delete your account?"
					description="This action cannot be undone. All conversations and tool history will be lost."
					severity="danger"
					confirmLabel="Delete"
					onConfirm={() => setLastAction("Account deleted")}
					onCancel={() => setLastAction("Cancelled deletion")}
				/>
				<Confirmation
					trigger={<Button>Run migration</Button>}
					title="Run the schema migration?"
					description="This will dual-write to users_v2 for 6 hours. Reverting requires a manual rollback."
					severity="warning"
					onConfirm={() => setLastAction("Migration started")}
				/>
				<Confirmation
					trigger={<Button variant="outline">Heads up</Button>}
					title="New eval results are ready"
					description="Run #42 finished. Score increased from 0.78 to 0.91."
					severity="info"
					confirmLabel="Got it"
					onConfirm={() => setLastAction("Acknowledged")}
				/>
			</div>
			{lastAction ? (
				<p className="text-xs text-muted-foreground">Last action: {lastAction}</p>
			) : null}
		</div>
	);
}
