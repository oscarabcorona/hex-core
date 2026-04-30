import { Message } from "../../components/ui";

export function MessageDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-3">
			<Message role="user">What's the capital of France?</Message>
			<Message role="assistant">Paris.</Message>
		</div>
	);
}
