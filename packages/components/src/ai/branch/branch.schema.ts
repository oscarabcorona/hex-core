import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const branchSchema: ComponentSchemaDefinition = {
	name: "branch",
	displayName: "Branch",
	description:
		"Headless alternate-response navigator. Renders one active branch with a prev/next control chip beneath it. Stateless — consumer owns `current` and `total`.",
	category: "ai",
	subcategory: "agent",
	props: [
		{
			name: "current",
			type: "number",
			required: true,
			description: "Zero-indexed active branch.",
		},
		{
			name: "total",
			type: "number",
			required: true,
			description: "Total number of branches.",
		},
		{
			name: "onCurrentChange",
			type: "function",
			required: false,
			description: "Called with the next index when the user steps prev/next. Omit to render the controls disabled (read-only).",
		},
		{
			name: "children",
			type: "ReactNode",
			required: true,
			description: "The active branch's content — typically a `<Message>` wrapping `<Markdown>`.",
		},
		{
			name: "aria-label",
			type: "string",
			required: false,
			default: "Response branches",
			description: "Accessible name for the navigator landmark.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the root.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "The active branch's content. Render any node — typically `<Message>` + `<Markdown>`.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["muted", "muted-foreground", "foreground", "ring"],
	examples: [
		{
			title: "Switch between alternate model responses",
			description: "Three response candidates; arrow keys + chip step through them.",
			code: 'const [i, setI] = useState(0);\n<Branch current={i} total={alternatives.length} onCurrentChange={setI}>\n  <Message role="assistant"><Markdown>{alternatives[i]}</Markdown></Message>\n</Branch>',
			composition: ["chat", "branch", "alternates"],
		},
		{
			title: "Read-only single-branch view",
			description: "Omit `onCurrentChange` to render the chip disabled — for archived conversations or when the model only produced one response.",
			code: '<Branch current={0} total={1}>\n  <Message role="assistant"><Markdown>{response}</Markdown></Message>\n</Branch>',
			composition: ["chat", "branch", "read-only"],
		},
	],
	ai: {
		whenToUse:
			"When a model returns multiple alternate responses (regenerate, n>1, ensemble) and the user should be able to navigate between them. Pair with `<Message>` + `<Markdown>` for the body and let the consumer own the active index.",
		whenNotToUse:
			"Don't use for sequential chat history (use `<MessageList>`). Don't use for unrelated tabs (use `<Tabs>`). Don't use to gate streaming — render the in-flight response directly.",
		commonMistakes: [
			"Passing `current` outside `[0, total - 1]` — the prev/next controls disable at the boundaries; out-of-range values render the controls but show the wrong index in the chip",
			"Treating Branch as stateful — it's headless, the consumer must keep `current` in their own state and react to `onCurrentChange`",
			"Rendering all branches inside `children` — Branch shows ONE branch at a time; the consumer slices to the active branch before passing in",
			"Using Branch for tabs or steppers — they're separate primitives with different semantics (Tabs = labeled regions, Stepper = ordered progress)",
		],
		relatedComponents: ["pagination", "tabs", "message", "markdown"],
		accessibilityNotes:
			"Wraps the body in a `role=\"group\"` with a labelled landmark. Prev/next are real `<button>`s with aria-labels (\"Previous response\" / \"Next response\") and disabled state at boundaries. The N-of-M chip is `aria-live=\"polite\"` + `aria-atomic=\"true\"` only when interactive (so AT announces the new position as one unit when the user steps); read-only branches drop the live-region to avoid initial-mount noise on chat surfaces with many `<Branch>` blocks. Arrow keys (Left/Right) step through branches when focus is anywhere inside the group; the wrapper itself is not focusable, so the prev/next buttons or any focusable descendant carry the keys.",
		tokenBudget: 1045,
	},
	tags: ["ai", "agent", "branch", "navigation", "alternates"],
};
