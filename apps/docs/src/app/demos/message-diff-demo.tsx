import { Markdown, MessageDiff } from "../../components/ui";

const LEFT = `**Plan** is the pre-execution intent — what the agent proposes to do, optionally gated on user approval.

**Task** is the during-execution status — each step carries a lifecycle state.`;

const RIGHT = `\`<Plan>\` shows the agent's *proposed* steps before execution. The footer's optional \`onApprove\` / \`onCancel\` callbacks render an approval gate.

\`<Task>\` shows the agent's *running* steps with per-step lifecycle state. They share a vocabulary so consumers can swap one for the other when the user approves.`;

export function MessageDiffDemo() {
	return (
		<div className="flex w-full max-w-3xl flex-col gap-6">
			<MessageDiff
				left={{
					label: "GPT-5",
					role: "assistant",
					content: <Markdown>{LEFT}</Markdown>,
					meta: "1.2s · Score 0.78",
				}}
				right={{
					label: "Claude Sonnet 4.6",
					role: "assistant",
					content: <Markdown>{RIGHT}</Markdown>,
					meta: "0.9s · Score 0.91",
				}}
			/>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Before / after edit comparison
				</p>
				<MessageDiff
					left={{
						label: "Before",
						role: "assistant",
						content: "The capital is Paris.",
					}}
					right={{
						label: "After",
						role: "assistant",
						content:
							"Paris is the capital of France — population 2.1M in the city, 12M in the metro region.",
					}}
				/>
			</div>
		</div>
	);
}
