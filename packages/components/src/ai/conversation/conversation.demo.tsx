"use client";

import { useState } from "react";
import {
	Button,
	Conversation,
	type ConversationMessage,
	Markdown,
} from "@hex-core/components";

const INITIAL: ConversationMessage[] = [
	{ id: "u1", role: "user", content: "What's the difference between Plan and Task?" },
	{
		id: "a1",
		role: "assistant",
		content: (
			<Markdown>{`**Plan** is the pre-execution intent — what the agent proposes to do, optionally gated on user approval.

**Task** is the during/post-execution status — each step carries a lifecycle state (pending, running, result, error).

A typical flow renders \`<Plan>\`, then swaps it for \`<Task>\` once the user approves.`}</Markdown>
		),
	},
];

const SAMPLE_SOURCES = [
	{ title: "Hex UI — Plan vs Task", url: "https://hex-core.dev/docs/components/plan" },
];

export function ConversationDemo() {
	const [messages, setMessages] = useState<ConversationMessage[]>(INITIAL);

	function handleSubmit(text: string) {
		setMessages((prev) => [
			...prev,
			{ id: `u-${prev.length}`, role: "user", content: text },
			{ id: `a-${prev.length}`, role: "assistant", content: `Thanks for asking — "${text}".` },
		]);
	}

	return (
		<div className="flex w-full max-w-xl flex-col gap-6">
			<div className="flex h-[28rem] flex-col">
				<Conversation
					messages={messages}
					onSubmit={handleSubmit}
					sources={SAMPLE_SOURCES}
					placeholder="Ask about Hex UI…"
					composerActions={
						<Button type="submit" size="sm">
							Send
						</Button>
					}
				/>
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Minimal — no sources, no composer actions, default placeholder
				</p>
				<div className="flex h-[14rem] flex-col">
					<Conversation
						messages={[
							{ id: "u1", role: "user", content: "Hello." },
							{ id: "a1", role: "assistant", content: "Hi! How can I help?" },
						]}
						onSubmit={() => undefined}
					/>
				</div>
			</div>
		</div>
	);
}
