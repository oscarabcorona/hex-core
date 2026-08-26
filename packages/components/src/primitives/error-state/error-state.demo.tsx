import { Button, ErrorState } from "@hex-core/components";

function AlertCircleIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="24"
			height="24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="8" x2="12" y2="12" />
			<line x1="12" y1="16" x2="12.01" y2="16" />
		</svg>
	);
}

export function ErrorStateDemo() {
	return (
		<div className="w-full max-w-md">
			<ErrorState
				icon={<AlertCircleIcon />}
				title="Couldn't load messages"
				message="The server didn't respond. Check your connection and try again."
				action={<Button>Retry</Button>}
			/>
		</div>
	);
}
