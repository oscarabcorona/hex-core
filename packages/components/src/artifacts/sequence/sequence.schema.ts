import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const sequenceSchema: ComponentSchemaDefinition = {
	name: "sequence",
	displayName: "Sequence",
	description:
		"UML-style sequence diagram. Actors as columns with vertical lifelines; messages as horizontal arrows in declaration order. Pure SVG; no heavy peer dep.",
	category: "artifact",
	subcategory: "time",
	props: [
		{
			name: "actors",
			type: "object",
			required: true,
			description: "Array of { id, label }. Display order matches array order (left-to-right columns).",
		},
		{
			name: "messages",
			type: "object",
			required: true,
			description: "Array of { from, to, label?, type? }. Chronological order matches array order (top-to-bottom). Messages whose `from` or `to` actor id is missing are silently skipped.",
		},
		{
			name: "width",
			type: "number",
			required: false,
			default: 720,
			description: "SVG pixel width.",
		},
		{
			name: "headerHeight",
			type: "number",
			required: false,
			default: 40,
			description: "Pixel height of each actor header.",
		},
		{
			name: "messageGap",
			type: "number",
			required: false,
			default: 36,
			description: "Pixel vertical gap between consecutive messages.",
		},
		{
			name: "onActorClick",
			type: "function",
			required: false,
			description: "Called with the clicked SequenceActor.",
		},
		{
			name: "onMessageClick",
			type: "function",
			required: false,
			description: "Called with the clicked SequenceMessage.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the SVG element.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "border", "foreground", "muted-foreground", "background"],
	examples: [
		{
			title: "Signup flow",
			description: "User → API → DB with return arrows.",
			code:
				"<Sequence\n  actors={[\n    { id: \"user\", label: \"User\" },\n    { id: \"api\", label: \"API\" },\n    { id: \"db\", label: \"DB\" },\n  ]}\n  messages={[\n    { from: \"user\", to: \"api\", label: \"POST /signup\" },\n    { from: \"api\", to: \"db\", label: \"INSERT user\" },\n    { from: \"db\", to: \"api\", label: \"ok\", type: \"return\" },\n    { from: \"api\", to: \"user\", label: \"201 Created\", type: \"return\" },\n  ]}\n/>",
			composition: ["sequence", "api-flow"],
		},
		{
			title: "Self-call (loopback) message",
			description: "An actor calling itself renders as a loopback arrow.",
			code:
				"<Sequence\n  actors={[{ id: \"worker\", label: \"Worker\" }]}\n  messages={[{ from: \"worker\", to: \"worker\", label: \"retry\" }]}\n/>",
			composition: ["sequence", "self-call"],
		},
	],
	ai: {
		whenToUse:
			"Visualize WHO talks to WHO and IN WHAT ORDER — API request flows, distributed-system protocols, agent tool-call sequences, OAuth dance, message-queue choreography. Use when the order and direction of messages between actors is the message.",
		whenNotToUse:
			"Don't use for branching process diagrams (use Flowchart). Don't use for events along a real time axis (use TimeAxis). Don't use for tasks with duration (use Gantt). Don't use for >~8 actors — columns become too narrow to read messages on.",
		commonMistakes: [
			"`from` or `to` referencing an id missing from `actors` — the message is silently skipped. Validate ids upstream",
			"Mutating actors / messages between renders — the layout pass is memoized on identity",
			"Reordering `actors` to fix layout while keeping message ordering — that flips the visual flow direction. Order actors by their natural left-to-right reading order",
			"Using `type: \"return\"` for forward-going messages — the dashed style implies a reply, so confused readers expect a prior outgoing message",
		],
		relatedComponents: ["flowchart", "time-axis", "gantt", "canvas", "diagram"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing actor and message counts. Interactive actor headers and message arrows declare role=\"button\", tabIndex, and Enter/Space activation. The aria-label on each message includes its index, source/target labels, and content. For agent outputs, also expose a parallel ordered list of messages with their from/to/label triples.",
		tokenBudget: 1110,
	},
	tags: ["artifact", "diagram", "sequence", "uml", "time", "messaging"],
};
