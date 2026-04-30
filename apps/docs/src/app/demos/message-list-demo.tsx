import { Message, MessageList } from "../../components/ui";

const CONVERSATION = [
	{ id: "1", role: "user" as const, content: "Can you summarize the React 19 announcement?" },
	{
		id: "2",
		role: "assistant" as const,
		content:
			"React 19 introduces ref as a normal prop, the use() hook for reading promises, useActionState for forms, and improved Server Components and Suspense.",
	},
	{ id: "3", role: "user" as const, content: "What does that mean for forwardRef?" },
	{
		id: "4",
		role: "assistant" as const,
		content: "forwardRef is no longer required for new components — ref is just a regular prop you destructure.",
	},
];

export function MessageListDemo() {
	return (
		<div className="w-full max-w-lg">
			<MessageList className="h-80">
				{CONVERSATION.map((m) => (
					<Message key={m.id} role={m.role}>
						{m.content}
					</Message>
				))}
			</MessageList>
		</div>
	);
}
