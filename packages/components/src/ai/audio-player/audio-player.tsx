"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Audio playback control backed by wavesurfer.js. Renders a play/pause
 * button + linear progress bar + duration. Pair with `<AudioWaveform>`
 * for the visual waveform display (separate component, same engine).
 *
 * Headless on data: pass `src` (URL or Blob); the engine streams + decodes.
 *
 * Heavy peer: requires `wavesurfer.js` (~50 KB gzip, shared with
 * AudioWaveform). The hex-core CLI's `add` flow prompts before installing.
 *
 * @example
 * <AudioPlayer src="/podcast.mp3" />
 * <AudioPlayer src={voicemailBlob} autoPlay onEnded={markRead} />
 */
export interface AudioPlayerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onError"> {
	/** Audio source — URL string or Blob. Re-loads when changed. */
	src: string | Blob;
	/** Auto-play once loaded. Default false. */
	autoPlay?: boolean;
	/** Called when playback finishes. */
	onEnded?: () => void;
	/** Called on engine error (network, decode, etc.). */
	onError?: (message: string) => void;
}

/**
 * Renders an audio player UI driven by wavesurfer.js.
 * @param props - Audio source + playback callbacks
 * @returns A div containing play/pause control + progress bar
 */
function AudioPlayer({ src, autoPlay = false, onEnded, onError, className, ...rest }: AudioPlayerProps) {
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const wsRef = React.useRef<import("wavesurfer.js").default | null>(null);
	const onEndedRef = React.useRef(onEnded);
	const onErrorRef = React.useRef(onError);
	onEndedRef.current = onEnded;
	onErrorRef.current = onError;

	const [isPlaying, setIsPlaying] = React.useState(false);
	const [duration, setDuration] = React.useState(0);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [isReady, setIsReady] = React.useState(false);

	React.useEffect(() => {
		if (!containerRef.current) return;
		let disposed = false;
		// Track Blob ObjectURLs so we can revoke on teardown — without this,
		// each src change leaks one URL + retains the underlying Blob until
		// page unload (a real leak for swap-heavy UIs like voicemail lists).
		const objectUrl = src instanceof Blob ? URL.createObjectURL(src) : null;

		void (async () => {
			const { default: WaveSurfer } = await import("wavesurfer.js");
			if (disposed || !containerRef.current) return;

			const ws = WaveSurfer.create({
				container: containerRef.current,
				waveColor: "#a3a3a3",
				progressColor: "#171717",
				cursorColor: "transparent",
				height: 32,
				barWidth: 2,
				barGap: 1,
				barRadius: 1,
				normalize: true,
			});

			ws.on("ready", () => {
				setIsReady(true);
				setDuration(ws.getDuration());
				if (autoPlay) void ws.play();
			});
			ws.on("play", () => setIsPlaying(true));
			ws.on("pause", () => setIsPlaying(false));
			ws.on("finish", () => {
				setIsPlaying(false);
				onEndedRef.current?.();
			});
			ws.on("timeupdate", (t) => setCurrentTime(t));
			ws.on("error", (err: Error) => {
				onErrorRef.current?.(err.message);
			});

			void ws.load(objectUrl ?? (src as string));
			wsRef.current = ws;
		})();

		return () => {
			disposed = true;
			wsRef.current?.destroy();
			wsRef.current = null;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
		// autoPlay is mount-only; src changes trigger a separate effect.
	}, [src]);

	function togglePlay() {
		const ws = wsRef.current;
		if (!ws || !isReady) return;
		void ws.playPause();
	}

	return (
		<div
			{...rest}
			data-hex-audio-player
			className={cn("flex items-center gap-3 rounded-md border bg-background p-2", className)}
		>
			<button
				type="button"
				onClick={togglePlay}
				disabled={!isReady}
				aria-label={isPlaying ? "Pause" : "Play"}
				className={cn(
					"inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
					"bg-foreground text-background transition-opacity",
					"hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				)}
			>
				{isPlaying ? <PauseIcon /> : <PlayIcon />}
			</button>
			<div ref={containerRef} className="flex-1 min-w-0" />
			<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
				{formatTime(currentTime)} / {formatTime(duration)}
			</span>
		</div>
	);
}

function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayIcon() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
			<path d="M5 3.5v9l8-4.5z" />
		</svg>
	);
}

function PauseIcon() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
			<rect x="4" y="3" width="3" height="10" rx="0.5" />
			<rect x="9" y="3" width="3" height="10" rx="0.5" />
		</svg>
	);
}

export { AudioPlayer };
