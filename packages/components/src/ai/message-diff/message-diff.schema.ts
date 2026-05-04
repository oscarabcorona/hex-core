import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const messageDiffSchema: ComponentSchemaDefinition = {
	name: "message-diff",
	displayName: "MessageDiff",
	description:
		"Side-by-side comparison of two assistant turns — the canonical eval UX. Each side renders a header label and a `<Message>` with the response. Sides scroll independently; collapses to a single column at narrow widths.",
	category: "ai",
	subcategory: "evals",
	props: [
		{
			name: "left",
			type: "object",
			required: true,
			description: "Left-hand side: `{ label: ReactNode; role: Role; content: ReactNode; meta?: ReactNode }`.",
		},
		{
			name: "right",
			type: "object",
			required: true,
			description: "Right-hand side: same shape as `left`.",
		},
		{
			name: "collapseBelow",
			type: "enum",
			required: false,
			default: "md",
			description: "Tailwind breakpoint below which the diff wraps to a single column.",
			enumValues: ["sm", "md", "lg"],
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the root grid.",
		},
	],
	variants: [],
	slots: [
		{
			name: "left.content",
			description: "Content node for the left side — typically a `<Markdown>` block.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
		{
			name: "right.content",
			description: "Content node for the right side — typically a `<Markdown>` block.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge", "class-variance-authority"],
		internal: ["lib/utils", "components/message/message"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "card-foreground", "border", "muted", "muted-foreground", "foreground", "secondary", "accent"],
	examples: [
		{
			title: "A/B comparison of two model responses",
			description: "Render GPT-5 vs Claude Sonnet 4.6 side-by-side; meta shows latency.",
			code: '<MessageDiff\n  left={{ label: "GPT-5", role: "assistant", content: <Markdown>{a}</Markdown>, meta: "1.2s" }}\n  right={{ label: "Claude Sonnet 4.6", role: "assistant", content: <Markdown>{b}</Markdown>, meta: "0.9s" }}\n/>',
			composition: ["evals", "compare", "diff"],
		},
		{
			title: "Before / after edit comparison",
			description: "Compare an assistant turn before and after a prompt-engineering tweak.",
			code: '<MessageDiff\n  left={{ label: "Before", role: "assistant", content: oldText }}\n  right={{ label: "After", role: "assistant", content: newText }}\n  collapseBelow="lg"\n/>',
			composition: ["evals", "diff"],
		},
		{
			title: "Score-annotated comparison",
			description: "Pass a score in `meta` for grader-style displays.",
			code: '<MessageDiff\n  left={{ label: "Run #1", role: "assistant", content: a, meta: "Score: 0.82" }}\n  right={{ label: "Run #2", role: "assistant", content: b, meta: "Score: 0.91" }}\n/>',
			composition: ["evals", "scoring"],
		},
	],
	ai: {
		whenToUse:
			"In an evals UI, prompt-tuning playground, or A/B preference-collection surface — anywhere the user picks between two candidate assistant responses or compares before/after edits. Pair with `<Markdown>` for the response bodies and an external preference-capture mechanism (radio group, vote buttons) outside the component.",
		whenNotToUse:
			"Don't use for sequential turns in a conversation (use `<MessageList>` — diff is sibling comparison, not chronological). Don't use for diff-style code review (file-level diff lives in a different primitive). Don't use to show inline word-level changes — `<MessageDiff>` is presentational; tokenized diff highlighting belongs in the content itself (compose with a custom Markdown transform).",
		commonMistakes: [
			"Passing markdown source as a string when the consumer expects rendered output — wrap with `<Markdown>{text}</Markdown>` so streaming-safe formatting kicks in",
			"Mixing roles between sides without a reason (e.g. `left.role=\"user\"`, `right.role=\"assistant\"`) — almost always both sides are `\"assistant\"`",
			"Putting score / latency text inside `content` — keep that in the `meta` slot so the header reads as one row instead of bleeding into the message body",
			"Setting `collapseBelow=\"lg\"` on a wide-content surface — the side-by-side rhythm collapses too aggressively at desktop breakpoints; default `md` covers most cases",
		],
		relatedComponents: ["message", "message-list", "markdown", "branch"],
		accessibilityNotes:
			"Wraps the two sides in a `role=\"group\"` with `aria-label=\"Message comparison\"` so screen readers announce them as a related pair. Each side carries a stable `data-side=\"left\"` / `data-side=\"right\"` attribute — target it (`[data-side='left']`) for keyboard navigation hooks, focus management, or per-side test queries. The grid collapses to a single column at narrow widths so the comparison stays usable when there's not enough horizontal real estate to host both columns side-by-side.",
		tokenBudget: 240,
	},
	tags: ["ai", "evals", "diff", "compare", "messages"],
};
