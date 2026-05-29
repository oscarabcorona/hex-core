import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const terminalSchema: ComponentSchemaDefinition = {
	name: "terminal",
	displayName: "Terminal",
	description:
		"Headless terminal display backed by xterm.js. Consumer owns the data flow — pass `output` to display, receive typed bytes via `onInput`. No PTY, no shell.",
	category: "ai",
	subcategory: "code",
	props: [
		{
			name: "output",
			type: "string",
			required: false,
			description:
				"Bytes to display (string or string[] — array joined). Diffed against prior render — appending to a streaming buffer is O(delta), not O(n).",
		},
		{
			name: "onInput",
			type: "function",
			required: false,
			description:
				"Receives bytes the user typed (incl. control sequences). Wire to a WebSocket / IPC / fetch stream — Terminal doesn't care about transport.",
		},
		{
			name: "cols",
			type: "number",
			required: false,
			default: 80,
			description: "Initial cols. Mount-time only (no runtime resize in v1).",
		},
		{
			name: "rows",
			type: "number",
			required: false,
			default: 24,
			description: "Initial rows. Mount-time only.",
		},
		{
			name: "theme",
			type: "enum",
			required: false,
			default: "dark",
			description: "Color scheme for background / foreground / cursor. One of \"dark\" | \"light\".",
		},
		{
			name: "cursorBlink",
			type: "boolean",
			required: false,
			default: true,
			description: "Animate the cursor.",
		},
		{
			name: "disableInput",
			type: "boolean",
			required: false,
			default: false,
			description: "Read-only mode — onInput will not fire.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the container div.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
		heavyPeer: [
			{
				name: "@xterm/xterm",
				version: "^5.5.0",
				bundleKbGzip: 150,
				reason: "Renders the terminal grid + handles input/output",
			},
		],
	},
	tokensUsed: ["background"],
	examples: [
		{
			title: "Static log display",
			description: "Read-only terminal showing pre-formatted output.",
			code: '<Terminal\n  output="$ ls -la\\r\\ndrwx package.json  src/\\r\\n$ "\n  disableInput\n/>',
			composition: ["log", "viewer"],
		},
		{
			title: "Interactive shell over WebSocket",
			description: "Bidirectional terminal — output streams in, input sends out.",
			code: 'const [output, setOutput] = useState("");\nconst ws = useWebSocket(...);\nws.onmessage = (e) => setOutput((o) => o + e.data);\n<Terminal\n  output={output}\n  onInput={(data) => ws.send(data)}\n  rows={32}\n/>',
			composition: ["shell", "interactive"],
		},
	],
	ai: {
		whenToUse:
			"Display agent shell sessions, code execution sandboxes, build/test logs, or anywhere your AI app needs to surface terminal output with optional user input. Pair with WebSocket / Server-Sent Events for live streaming.",
		whenNotToUse:
			"Don't use for plain log viewing without ANSI codes (use `<pre>` + Markdown). Don't use as a code editor (use a CodeMirror wrapper). Don't try to render hundreds of MB of scrollback — xterm caps internal buffer; truncate upstream.",
		commonMistakes: [
			"Passing the entire log buffer on every render instead of letting Terminal diff — works (it diffs internally) but consumer-side memoization is still smart for huge buffers",
			"Wiring onInput before the consumer has a transport ready — the user types into a black hole. Disable input or render a placeholder until the socket is open",
			"Forgetting that xterm is a peer dep — install via `hex add terminal` (CLI prompts) or manually `pnpm add @xterm/xterm`",
			"Trying to mutate cols/rows mid-session — current version is mount-time only; remount with new dimensions to resize",
		],
		relatedComponents: ["code-block", "composer"],
		accessibilityNotes:
			"xterm.js renders into a canvas + hidden screen-reader text layer; standard SR navigation works. The container exposes `data-hex-terminal` for downstream styling. For agent log displays, also consider an aria-live region above the terminal that announces summaries.",
		tokenBudget: 1020,
	},
	tags: ["ai", "terminal", "xterm", "shell", "code", "sandbox", "agent"],
};
