import { Button, Message, MessageActions } from "@hex-core/components";

function CopyIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<rect width="14" height="14" x="8" y="8" rx="2" />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
		</svg>
	);
}

function RetryIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M3 12a9 9 0 1 0 3-6.7" />
			<polyline points="3 4 3 10 9 10" />
		</svg>
	);
}

export function MessageActionsDemo() {
	return (
		<div className="w-full max-w-lg">
			<Message role="assistant">
				The capital of France is Paris — a city of about 2.1 million in the historic Île-de-France
				region.
				<MessageActions>
					<Button variant="ghost" size="icon" aria-label="Copy">
						<CopyIcon />
					</Button>
					<Button variant="ghost" size="icon" aria-label="Regenerate">
						<RetryIcon />
					</Button>
				</MessageActions>
			</Message>
		</div>
	);
}
