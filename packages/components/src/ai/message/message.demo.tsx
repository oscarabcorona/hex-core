import { Message } from "@hex-core/components";

export function MessageDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-3">
			<Message role="user">What&apos;s the capital of France?</Message>
			<Message role="assistant">Paris.</Message>
		</div>
	);
}
