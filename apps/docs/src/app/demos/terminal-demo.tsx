"use client";

import { Terminal } from "../../components/ui";

export function TerminalDemo() {
	const sample = [
		"$ npx @hex-core/cli init\r\n",
		"\u001b[36m✓\u001b[0m Detected Tailwind v4\r\n",
		"\u001b[36m✓\u001b[0m Wrote app/globals.css\r\n",
		"\u001b[36m✓\u001b[0m Installed @hex-core/components\r\n",
		"\r\n",
		"$ npx @hex-core/cli add button\r\n",
		"\u001b[36m✓\u001b[0m Wrote components/ui/button.tsx\r\n",
		"\r\n",
		"$ ",
	];

	return (
		<div className="w-full max-w-2xl">
			<Terminal output={sample} disableInput rows={12} />
			<p className="mt-2 text-xs text-muted-foreground">
				Read-only display. Pass `onInput` and a transport (WebSocket, fetch stream) for an interactive shell.
			</p>
		</div>
	);
}
