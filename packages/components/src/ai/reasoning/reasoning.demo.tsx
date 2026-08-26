import { Markdown, Reasoning } from "@hex-core/components";

const THINKING = `Looking at the user's question — they asked about React 19's effect on \`forwardRef\`.

Key facts:
- React 19 makes \`ref\` a regular prop on function components
- Existing \`forwardRef\` code keeps working
- New code shouldn't need \`forwardRef\` at all

I'll lead with the practical change and call out the migration path.`;

export function ReasoningDemo() {
	return (
		<div className="w-full max-w-lg">
			<Reasoning durationMs={4200}>
				<Markdown>{THINKING}</Markdown>
			</Reasoning>
		</div>
	);
}
