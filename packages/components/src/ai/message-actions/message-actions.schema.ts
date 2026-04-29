import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const messageActionsSchema: ComponentSchemaDefinition = {
	name: "message-actions",
	displayName: "MessageActions",
	description:
		"Inline action-button row beneath a message — copy, regenerate, thumbs-up/down. Pure container; consumer supplies the buttons + handlers.",
	category: "ai",
	subcategory: "chat",
	props: [
		{
			name: "children",
			type: "ReactNode",
			required: true,
			description: "Action buttons (typically Button variant=\"ghost\" size=\"icon\").",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Action buttons rendered in a horizontal row.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [],
	examples: [
		{
			title: "Copy + regenerate",
			description: "Two ghost icon buttons under an assistant message.",
			code: '<MessageActions>\n  <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(text)}><CopyIcon /></Button>\n  <Button variant="ghost" size="icon" onClick={onRegenerate}><RetryIcon /></Button>\n</MessageActions>',
			composition: ["chat", "actions"],
		},
	],
	ai: {
		whenToUse:
			"Render after assistant turns where the user might want to copy, regenerate, or rate the response. Combine with `group/message` on the parent Message to enable hover-reveal.",
		whenNotToUse:
			"Don't use under user turns (no actions to take). Don't put primary CTAs here — actions row is for secondary, optional follow-ups.",
		commonMistakes: [
			"Forgetting `group/message` on the parent Message — hover-reveal won't trigger",
			"Stacking too many buttons (more than ~4) — overwhelms the chat",
		],
		relatedComponents: ["message", "button"],
		accessibilityNotes:
			"Pure layout container. Each child button must carry its own `aria-label` since icon-only buttons have no accessible text.",
		tokenBudget: 180,
	},
	tags: ["ai", "chat", "actions", "row", "container"],
};
