import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const audioWaveformSchema: ComponentSchemaDefinition = {
	name: "audio-waveform",
	displayName: "Audio Waveform",
	description:
		"Standalone audio waveform display backed by wavesurfer.js — for voice-message previews, audio thumbnails, recording indicators. No playback controls (use `<AudioPlayer>` for that).",
	category: "ai",
	subcategory: "voice",
	props: [
		{
			name: "src",
			type: "string",
			required: true,
			description: "Audio source — URL string or Blob (both accepted).",
		},
		{
			name: "height",
			type: "number",
			required: false,
			default: 48,
			description: "Pixel height of the waveform.",
		},
		{
			name: "waveColor",
			type: "string",
			required: false,
			default: "#a3a3a3",
			description: "CSS color for the waveform bars.",
		},
		{
			name: "progressColor",
			type: "string",
			required: false,
			description: "CSS color for played regions. Defaults to waveColor.",
		},
		{
			name: "onReady",
			type: "function",
			required: false,
			description: "Called once decoded with the duration in seconds.",
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
	tokensUsed: [],
	examples: [
		{
			title: "Voice-message preview",
			description: "Waveform thumbnail in a chat bubble.",
			code: '<AudioWaveform src={voiceMessageUrl} height={32} />',
			composition: ["audio", "thumbnail", "chat"],
		},
		{
			title: "Recording indicator with duration callback",
			description: "Notify the parent when the waveform is decoded.",
			code: '<AudioWaveform\n  src={recordedBlob}\n  onReady={(seconds) => setMessageDuration(seconds)}\n/>',
			composition: ["audio", "recording"],
		},
	],
	ai: {
		whenToUse:
			"Voice-message bubbles, recording previews, audio attachment thumbnails — any visual representation of audio content where you DON'T want playback controls. Pair with `<AudioPlayer>` if interaction is needed.",
		whenNotToUse:
			"Don't use when the user needs to play/pause/scrub — use `<AudioPlayer>`. Don't use as a real-time audio analyzer (this renders the static decoded waveform; live mic visualization needs the Web Audio API directly).",
		commonMistakes: [
			"Re-creating a Blob src on every render — the effect re-loads, which is expensive. Memoize",
			"Setting height too small (<16px) — bars don't render distinctly",
			"Forgetting that decoding takes time on large files — show a Skeleton until onReady fires",
		],
		relatedComponents: ["audio-player", "speech-recognition"],
		accessibilityNotes:
			"The waveform is decorative — supply an aria-label on the wrapper that describes the audio (e.g. 'Voice message from Alice, 1:24'). The interact={false} setting prevents accidental keyboard focus on a non-interactive element.",
		tokenBudget: 320,
	},
	tags: ["ai", "audio", "waveform", "voice", "wavesurfer", "thumbnail"],
};
