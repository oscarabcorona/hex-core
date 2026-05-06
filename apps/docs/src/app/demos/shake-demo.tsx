"use client";

import { useState } from "react";
import { Shake } from "@hex-core/motion";

export function ShakeDemo() {
	const [errors, setErrors] = useState(0);
	return (
		<div className="flex w-full max-w-md flex-col gap-4">
			<button
				type="button"
				onClick={() => setErrors((e) => e + 1)}
				className="self-start rounded-md border bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground"
			>
				Trigger error ({errors})
			</button>
			<Shake trigger={errors} intensity={6} duration={420}>
				<input
					type="email"
					placeholder="email@example.com"
					className="w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground"
					aria-invalid={errors > 0}
				/>
			</Shake>
		</div>
	);
}
