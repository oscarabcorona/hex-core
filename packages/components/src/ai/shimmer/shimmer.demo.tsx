import { Message, MessageList, Shimmer } from "@hex-core/components";

export function ShimmerDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Placeholder bar</p>
				<Shimmer width="80%" />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Inside an assistant message turn</p>
				<MessageList>
					<Message role="user">Summarize the latest research on auth tokens.</Message>
					<Message role="assistant">
						<Shimmer width="60%" />
					</Message>
				</MessageList>
			</div>
		</div>
	);
}
