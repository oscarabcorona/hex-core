import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const speechRecognitionSchema: ComponentSchemaDefinition = {
	name: "speech-recognition",
	displayName: "Speech Recognition",
	description:
		"Browser Web Speech API toggle button. Emits transcript chunks via callback; consumer keeps the text. Renders a disabled state when the browser doesn't support SpeechRecognition.",
	category: "ai",
	subcategory: "voice",
	props: [
		{
			name: "isListening",
			type: "boolean",
			required: true,
			description: "Controlled listening state.",
		},
		{
			name: "onListeningChange",
			type: "function",
			required: true,
			description:
				"Called when listening starts/stops (user toggle or browser auto-end after silence/error).",
		},
		{
			name: "onTranscript",
			type: "function",
			required: true,
			description:
				"Called per transcript chunk: `(text, isFinal)`. `isFinal=true` indicates a finalized phrase you should append; `isFinal=false` is an in-progress interim result you should replace on the next event.",
		},
		{
			name: "onError",
			type: "function",
			required: false,
			description:
				"Called on browser error. Common values: \"not-allowed\" (mic permission denied), \"no-speech\", \"network\", \"audio-capture\".",
		},
		{
			name: "lang",
			type: "string",
			required: false,
			default: "en-US",
			description: "BCP-47 language tag (e.g. \"es-ES\", \"ja-JP\").",
		},
		{
			name: "continuous",
			type: "boolean",
			required: false,
			default: true,
			description: "Keep listening across pauses. Set false for single-utterance dictation.",
		},
		{
			name: "interimResults",
			type: "boolean",
			required: false,
			default: true,
			description:
				"Emit interim (in-progress) results. Set false to receive only finalized phrases.",
		},
		{
			name: "startLabel",
			type: "string",
			required: false,
			default: "Start dictation",
			description: "Accessible name + tooltip when idle.",
		},
		{
			name: "stopLabel",
			type: "string",
			required: false,
			default: "Stop dictation",
			description: "Accessible name + tooltip when listening.",
		},
		{
			name: "notSupportedLabel",
			type: "string",
			required: false,
			default: "Speech recognition not supported in this browser",
			description: "Accessible name + tooltip when the browser lacks the Web Speech API.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the button.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "accent", "accent-foreground", "ring", "destructive"],
	examples: [
		{
			title: "Dictation into a Composer",
			description: "Append finalized phrases to the composer's value.",
			code: 'const [listening, setListening] = useState(false);\nconst [text, setText] = useState("");\n<Composer\n  value={text}\n  onValueChange={setText}\n  onSubmit={(v) => { send(v); setText(""); }}\n>\n  <SpeechRecognition\n    isListening={listening}\n    onListeningChange={setListening}\n    onTranscript={(chunk, isFinal) => { if (isFinal) setText((t) => t + chunk); }}\n  />\n  <Button type="submit">Send</Button>\n</Composer>',
			composition: ["chat", "voice", "form"],
		},
		{
			title: "Live transcription preview",
			description: "Show the in-progress interim result alongside finalized text.",
			code: 'const [final, setFinal] = useState("");\nconst [interim, setInterim] = useState("");\n<>\n  <SpeechRecognition\n    isListening={listening}\n    onListeningChange={setListening}\n    onTranscript={(chunk, isFinal) => {\n      if (isFinal) { setFinal((t) => t + chunk); setInterim(""); }\n      else setInterim(chunk);\n    }}\n  />\n  <p>{final}<span className="opacity-60">{interim}</span></p>\n</>',
			composition: ["voice", "transcription"],
		},
	],
	ai: {
		whenToUse:
			"Voice input for chat, dictation, accessibility-first forms, or any AI app where typing is friction. Pair with Composer for chat, or with a Textarea for long-form dictation.",
		whenNotToUse:
			"Don't use for high-accuracy transcription (browser models are coarse — use a server-side STT API like Whisper). Don't use as the sole input on a form (always pair with a typed fallback for users without mic access or unsupported browsers).",
		commonMistakes: [
			"Treating every onTranscript event as final — you must check `isFinal` to know when to append vs. replace",
			"Forgetting that browser support is uneven — Firefox lacks the API; always render the fallback state",
			"Not handling \"not-allowed\" — when the user denies mic permission, the next start attempt fails silently unless you surface onError",
			"Mutating recognition.lang mid-session — the wrapper recreates the engine on prop change, but rapid toggles can drop transcripts",
		],
		relatedComponents: ["composer"],
		accessibilityNotes:
			"Renders a real <button> with aria-pressed reflecting listening state and aria-label that updates between start/stop/not-supported. The pulsing border (when listening) is decorative — screen readers get the state via aria-pressed.",
		tokenBudget: 1311,
	},
	tags: ["ai", "voice", "speech", "dictation", "transcription", "microphone"],
};
