import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const composerSchema: ComponentSchemaDefinition = {
	name: "composer",
	displayName: "Composer",
	description:
		"Multi-line input + submission shell for chat. Submits on Enter (Shift+Enter inserts newline). Trailing slot for attachment + send buttons.",
	category: "ai",
	subcategory: "input",
	props: [
		{
			name: "value",
			type: "string",
			required: true,
			description: "Controlled textarea value.",
		},
		{
			name: "onValueChange",
			type: "function",
			required: true,
			description: "Called with the new value on each keystroke.",
		},
		{
			name: "onSubmit",
			type: "function",
			required: true,
			description: "Called with the trimmed value on Enter or form submit.",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Lock the input and suppress submission (e.g. during streaming).",
		},
		{
			name: "placeholder",
			type: "string",
			required: false,
			description: "Textarea placeholder copy.",
		},
		{
			name: "submitOnEnter",
			type: "boolean",
			required: false,
			default: true,
			description: "Submit when Enter is pressed without Shift. Disable to require button click.",
		},
		{
			name: "children",
			type: "ReactNode",
			required: false,
			description: "Trailing slot — attachment buttons, voice toggle, send button, etc.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the form wrapper.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Trailing action buttons rendered after the textarea.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "ring", "muted-foreground"],
	examples: [
		{
			title: "Basic composer",
			description: "Controlled input + send button.",
			code: 'const [value, setValue] = useState("");\n<Composer\n  value={value}\n  onValueChange={setValue}\n  onSubmit={(v) => { send(v); setValue(""); }}\n  placeholder="Ask anything…"\n>\n  <Button type="submit" disabled={!value.trim()}>Send</Button>\n</Composer>',
			composition: ["chat", "form"],
		},
		{
			title: "With attachment slot",
			description: "Attach button on the leading edge of the trailing slot.",
			code: '<Composer value={v} onValueChange={setV} onSubmit={send}>\n  <Button variant="ghost" size="icon" onClick={pickFile}><Paperclip /></Button>\n  <Button type="submit">Send</Button>\n</Composer>',
			composition: ["chat", "form", "attachment"],
		},
	],
	ai: {
		whenToUse:
			"Wrap any user-input surface in an AI app — chatbots, AI editors, agent prompts. Pair with `useChat` from @ai-sdk/react or any equivalent state hook.",
		whenNotToUse:
			"Don't use for non-chat forms (use Form + Textarea). Don't bake fetch/streaming logic into onSubmit — keep the network call in the consumer.",
		commonMistakes: [
			"Calling onSubmit with the raw event instead of the value — onSubmit receives the trimmed string already",
			"Forgetting to clear `value` after submit — Composer is fully controlled",
			"Wrapping the component in <form> — Composer renders its own form element",
		],
		relatedComponents: ["message-list", "suggestion", "loading-indicator"],
		accessibilityNotes:
			"Renders a real <form> + <textarea>, so Enter submission and screen-reader announcements work without extra ARIA. Pass `aria-label` on the wrapper if there's no visible label.",
		tokenBudget: 280,
	},
	tags: ["ai", "input", "chat", "form", "composer", "textarea"],
};
