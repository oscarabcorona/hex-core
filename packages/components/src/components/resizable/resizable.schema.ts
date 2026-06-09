import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const resizableSchema: ComponentSchemaDefinition = {
	name: "resizable",
	displayName: "Resizable",
	description:
		"Draggable split panes built on react-resizable-panels v4. Horizontal or vertical, with keyboard-accessible handles and persistable layout.",
	category: "component",
	subcategory: "layout",
	props: [
		{
			name: "orientation",
			type: "string",
			required: false,
			default: "horizontal",
			description: "Group orientation: 'horizontal' | 'vertical'",
		},
		{
			name: "defaultLayout",
			type: "object",
			required: false,
			description: "Array of initial panel sizes in order (percentages summing to 100)",
		},
		{
			name: "onLayoutChange",
			type: "function",
			required: false,
			description: "Fires when the user drags a handle; receives the new layout array",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable resizing for the whole group",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Alternating ResizablePanel + ResizableHandle nodes",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["react-resizable-panels", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["border", "ring"],
	examples: [
		{
			title: "Horizontal split pane",
			description: "Two resizable panels with a grab-grip handle",
			code: '<ResizablePanelGroup orientation="horizontal" className="min-h-[300px] max-w-md rounded-lg border">\n  <ResizablePanel defaultSize={50}>\n    <div className="flex h-full items-center justify-center p-6">One</div>\n  </ResizablePanel>\n  <ResizableHandle withHandle />\n  <ResizablePanel defaultSize={50}>\n    <div className="flex h-full items-center justify-center p-6">Two</div>\n  </ResizablePanel>\n</ResizablePanelGroup>',
		},
	],
	ai: {
		whenToUse:
			"Use for editor-style layouts (file tree + editor), dashboards with configurable panels, or any UI where users need to trade space between regions. Layouts can be persisted to localStorage via the group's id.",
		whenNotToUse:
			"Don't use for responsive layouts — use CSS grid/flex with breakpoints. Don't use for modal layouts (use Dialog/Sheet). Don't nest deeply (>2 levels) — it hurts a11y and perception. Don't use if panels need to collapse/expand as a single action (use Collapsible).",
		commonMistakes: [
			"Forgetting ResizableHandle between panels — they won't resize",
			"Using 'cols'/'rows' instead of orientation='horizontal'/'vertical' (old v1 API)",
			"Not providing defaultSize on each panel — initial layout will be uneven",
			"Rendering panel content that changes DOM size during drag — react-resizable-panels performance suffers",
			"Omitting a group id when you want layout to persist via localStorage",
		],
		relatedComponents: ["separator", "collapsible"],
		accessibilityNotes:
			"ResizableHandle is focusable and resizable via keyboard arrows. role='separator' is set, with aria-valuenow/min/max wired by react-resizable-panels. The grab-grip is aria-hidden (decorative).",
		tokenBudget: 756,
	},
	tags: ["resizable", "split-pane", "layout", "panels"],
};
