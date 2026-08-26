import { Alert, AlertDescription, AlertTitle } from "@hex-core/components";

/** Alert demo: default info alert + destructive error variant. */
export function AlertDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-4">
			<Alert>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
				</svg>
				<AlertTitle>Heads up!</AlertTitle>
				<AlertDescription>
					You can add components to your app via the CLI with{" "}
					<code className="rounded bg-muted px-1">pnpm dlx @hex-core/cli add</code>.
				</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>Your session has expired. Please sign in again.</AlertDescription>
			</Alert>
		</div>
	);
}
