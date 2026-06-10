"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Browser SpeechRecognition wrapper. Renders a mic toggle button that
 * starts/stops the Web Speech API and emits transcript chunks.
 *
 * Headless on data: `isListening` + `onListeningChange` are required so
 * the consumer keeps state where it fits (a `useChat` hook, redux,
 * local state). `onTranscript` fires per result with `isFinal` so the
 * consumer can append finalized phrases and replace interim ones.
 *
 * Falls back to a disabled button labeled `notSupportedLabel` when the
 * browser lacks `SpeechRecognition` (Firefox as of 2026, older Safari).
 *
 * @example
 * const [listening, setListening] = useState(false);
 * const [text, setText] = useState("");
 * <SpeechRecognition
 *   isListening={listening}
 *   onListeningChange={setListening}
 *   onTranscript={(chunk, isFinal) => {
 *     if (isFinal) setText((t) => t + chunk);
 *   }}
 * />
 */
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionResultLike {
	readonly isFinal: boolean;
	readonly length: number;
	readonly [index: number]: { readonly transcript: string };
}

interface SpeechRecognitionResultListLike {
	readonly length: number;
	readonly [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
	readonly resultIndex: number;
	readonly results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike {
	readonly error: string;
	readonly message?: string;
}

interface SpeechRecognitionInstance {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	onresult: ((event: SpeechRecognitionEventLike) => void) | null;
	onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
	onend: (() => void) | null;
	start(): void;
	stop(): void;
	abort(): void;
}

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
	if (typeof window === "undefined") return null;
	const w = window as unknown as {
		SpeechRecognition?: SpeechRecognitionConstructor;
		webkitSpeechRecognition?: SpeechRecognitionConstructor;
	};
	return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeechRecognitionProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onError"> {
	/** Controlled listening state. */
	isListening: boolean;
	/** Called when listening starts/stops (user toggle or browser auto-end). */
	onListeningChange: (listening: boolean) => void;
	/** Called per transcript chunk. `isFinal` indicates a finalized phrase. */
	onTranscript: (text: string, isFinal: boolean) => void;
	/** Called on browser error (e.g. "not-allowed", "no-speech", "network"). */
	onError?: (error: string, message?: string) => void;
	/** BCP-47 language tag. Default `"en-US"`. */
	lang?: string;
	/** Keep listening across pauses. Default `true`. */
	continuous?: boolean;
	/** Emit interim (in-progress) results. Default `true`. */
	interimResults?: boolean;
	/** Accessible name when idle. Default `"Start dictation"`. */
	startLabel?: string;
	/** Accessible name when listening. Default `"Stop dictation"`. */
	stopLabel?: string;
	/** Accessible name + tooltip when the browser lacks the API. */
	notSupportedLabel?: string;
}

/**
 * Renders a mic toggle button wired to the Web Speech API.
 * @param props - controlled listening state + transcript callback
 * @returns A button element that toggles speech recognition
 */
function SpeechRecognition({
	isListening,
	onListeningChange,
	onTranscript,
	onError,
	lang = "en-US",
	continuous = true,
	interimResults = true,
	startLabel = "Start dictation",
	stopLabel = "Stop dictation",
	notSupportedLabel = "Speech recognition not supported in this browser",
	disabled,
	className,
	...rest
}: SpeechRecognitionProps) {
	const recognitionRef = React.useRef<SpeechRecognitionInstance | null>(null);
	const [isSupported, setIsSupported] = React.useState(true);

	// "Latest ref" pattern, assigned synchronously in render so a Web Speech
	// callback firing between commit and a useEffect can never see stale
	// closures. React permits ref mutation during render when the assignment
	// is purely a latest-value mirror.
	const onTranscriptRef = React.useRef(onTranscript);
	const onListeningChangeRef = React.useRef(onListeningChange);
	const onErrorRef = React.useRef(onError);
	onTranscriptRef.current = onTranscript;
	onListeningChangeRef.current = onListeningChange;
	onErrorRef.current = onError;

	// Mounted guard: the engine fires onend asynchronously, sometimes after
	// the React tree has been torn down. Without this, a stale handler can
	// invoke setState on an unmounted parent.
	const mountedRef = React.useRef(true);
	React.useEffect(
		() => () => {
			mountedRef.current = false;
		},
		[],
	);

	// Set when the lifecycle effect's cleanup runs because of a prop change
	// (lang/continuous/interimResults), not user-initiated stop. The about-
	// to-fire onend should NOT bubble back as `onListeningChange(false)` in
	// that case — the new effect run is about to re-create the engine.
	const rebuildingRef = React.useRef(false);
	// Latest `isListening` mirror so cleanup can read the NEW value (closure
	// captures OLD). NEW=true means this is a prop-change rebuild; NEW=false
	// means the user stopped.
	const isListeningRef = React.useRef(isListening);
	isListeningRef.current = isListening;

	// SSR: ctor lookup must run after mount.
	React.useEffect(() => {
		const Ctor = getSpeechRecognitionCtor();
		setIsSupported(Ctor !== null);
	}, []);

	// Toggle the engine on `isListening` change. Recreate per session so a
	// stuck session can't leak — Chrome's recognition is single-use after
	// onend in some failure modes.
	React.useEffect(() => {
		if (!isListening) return;

		const Ctor = getSpeechRecognitionCtor();
		if (!Ctor) return;

		const instance = new Ctor();
		instance.continuous = continuous;
		instance.interimResults = interimResults;
		instance.lang = lang;

		instance.onresult = (event) => {
			if (!mountedRef.current) return;
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				const transcript = result[0]?.transcript ?? "";
				if (transcript) onTranscriptRef.current(transcript, result.isFinal);
			}
		};
		instance.onerror = (event) => {
			if (!mountedRef.current) return;
			onErrorRef.current?.(event.error, event.message);
			// "aborted" is a normal stop signal — don't toggle off twice.
			if (event.error !== "aborted") onListeningChangeRef.current(false);
		};
		instance.onend = () => {
			if (!mountedRef.current) return;
			// Skip the off-toggle when cleanup is from a prop-change rebuild;
			// the next effect run will re-start with the new options.
			if (rebuildingRef.current) return;
			onListeningChangeRef.current(false);
		};

		recognitionRef.current = instance;
		try {
			instance.start();
		} catch (err) {
			// Chrome throws if start() is called twice; surface as an error
			// rather than letting it crash the React tree.
			onErrorRef.current?.("start-failed", err instanceof Error ? err.message : String(err));
			onListeningChangeRef.current(false);
		}

		return () => {
			// Mark this teardown as a rebuild iff isListening is STILL true
			// in the latest render (only lang/continuous/interimResults
			// changed). On a real user-stop the NEW isListening is false and
			// any synchronous onend-from-abort should toggle parent state.
			rebuildingRef.current = isListeningRef.current;
			instance.onresult = null;
			instance.onerror = null;
			instance.onend = null;
			try {
				instance.abort();
			} catch {
				// abort() throws if the engine never started; safe to ignore.
			}
			recognitionRef.current = null;
			// Reset on next microtask so a follow-up effect run sees a clean slate.
			queueMicrotask(() => {
				rebuildingRef.current = false;
			});
		};
	}, [isListening, continuous, interimResults, lang]);

	const tooltip = !isSupported
		? notSupportedLabel
		: isListening
			? stopLabel
			: startLabel;
	// aria-label is stable when supported so screen readers don't re-announce
	// the entire button on each toggle. State is conveyed via aria-pressed.
	// Only the unsupported case swaps the accessible name.
	const accessibleName = isSupported ? startLabel : notSupportedLabel;
	const isDisabled = disabled || !isSupported;

	return (
		<button
			type="button"
			{...rest}
			disabled={isDisabled}
			aria-label={accessibleName}
			aria-pressed={isListening}
			title={tooltip}
			onClick={(event) => {
				rest.onClick?.(event);
				if (event.defaultPrevented || isDisabled) return;
				onListeningChange(!isListening);
			}}
			className={cn(
				"inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background",
				"text-foreground transition-all duration-[var(--duration-normal,200ms)] ease-out",
				"hover:bg-accent hover:text-accent-foreground",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"disabled:cursor-not-allowed disabled:opacity-50",
				isListening && "animate-pulse border-destructive text-destructive",
				className,
			)}
		>
			<svg
				aria-hidden
				viewBox="0 0 16 16"
				width="14"
				height="14"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<rect x="6" y="2" width="4" height="8" rx="2" />
				<path d="M3.5 7.5a4.5 4.5 0 0 0 9 0" />
				<path d="M8 12v2" />
				<path d="M5.5 14h5" />
			</svg>
		</button>
	);
}

export { SpeechRecognition };
