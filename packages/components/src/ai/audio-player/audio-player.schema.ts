import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const audioPlayerSchema: ComponentSchemaDefinition = {
	name: "audio-player",
	displayName: "Audio Player",
	description:
		"Audio playback control backed by wavesurfer.js. Renders a play/pause button + linear waveform progress + duration. Pair with `<AudioWaveform>` for a standalone waveform display.",
	category: "ai",
	subcategory: "voice",
	props: [
		{
			name: "src",
			type: "string",
			required: true,
			description: "Audio source — URL string or Blob (both accepted). Re-loads when changed.",
		},
		{
			name: "autoPlay",
			type: "boolean",
			required: false,
			default: false,
			description: "Auto-play once the file is decoded and ready.",
		},
		{
			name: "onEnded",
			type: "function",
			required: false,
			description: "Called when playback reaches the end.",
		},
		{
			name: "onError",
			type: "function",
			required: false,
			description: "Called on engine error (network, decode, codec unsupported).",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the container.",
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
				name: "wavesurfer.js",
				version: "^7.8.0",
				bundleKbGzip: 50,
				reason: "Audio decode + waveform rendering engine",
			},
		],
	},
	tokensUsed: ["background", "foreground", "muted-foreground"],
	examples: [
		{
			title: "Play a podcast URL",
			description: "Simplest case — URL src with default controls.",
			code: '<AudioPlayer src="/podcast.mp3" />',
			composition: ["audio", "playback"],
		},
		{
			title: "Voicemail with auto-play",
			description: "Blob src + auto-play + ended callback to mark as read.",
			code: '<AudioPlayer\n  src={voicemailBlob}\n  autoPlay\n  onEnded={() => markRead(voicemailId)}\n/>',
			composition: ["audio", "voicemail"],
		},
	],
	ai: {
		whenToUse:
			"Voicemail playback, AI-generated speech preview (TTS output), podcast/transcript pairings, voice-message threads. Pair with `<AudioWaveform>` if you need a standalone waveform without the play control.",
		whenNotToUse:
			"Don't use for video (use `<video>` directly). Don't use for streaming live audio with no fixed duration (use the native MediaSource API). Don't bundle this for an app that only plays the OS notification chime — use `<audio>`.",
		commonMistakes: [
			"Passing a fresh `new Blob()` reference on every render — the src effect re-loads on identity change, which restarts playback. Memoize with useMemo",
			"Forgetting that wavesurfer.js needs the audio file to be CORS-accessible — same-origin or correct Access-Control-Allow-Origin",
			"Setting autoPlay={true} for unmuted audio — most browsers block this; first interaction is required",
			"Forgetting to handle onError — a 404 or codec failure leaves the play button disabled forever with no user feedback",
		],
		relatedComponents: ["audio-waveform", "speech-recognition"],
		accessibilityNotes:
			"The play button has aria-label that flips between Play/Pause. The waveform is decorative; screen readers get current/total duration via the visible time text. For agent voice messages, also set an aria-label on the wrapper describing the message context.",
		tokenBudget: 360,
	},
	tags: ["ai", "audio", "voice", "playback", "wavesurfer", "podcast", "tts"],
};
