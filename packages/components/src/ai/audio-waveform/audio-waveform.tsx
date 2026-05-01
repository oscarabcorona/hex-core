"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Standalone audio waveform display backed by wavesurfer.js. Renders the
 * waveform of a source (URL or Blob) without playback controls — for
 * voice-message previews, audio thumbnails, recording indicators, anywhere
 * the visual is the point.
 *
 * Heavy peer: requires `wavesurfer.js` (~50 KB gzip, shared with
 * AudioPlayer). The hex-core CLI's `add` flow prompts before installing.
 *
 * For interactive playback + waveform together, use `<AudioPlayer>`.
 *
 * @example
 * <AudioWaveform src="/voice-message.mp3" height={48} />
 */
export interface AudioWaveformProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onError"> {
	/** Audio source — URL string or Blob. */
	src: string | Blob;
	/** Pixel height of the waveform. Default 48. */
	height?: number;
	/** Bar color for unplayed regions. CSS color string. */
	waveColor?: string;
	/** Bar color for played regions. Default same as `waveColor`. */
	progressColor?: string;
	/** Called when wavesurfer finishes decoding the source. */
	onReady?: (durationSeconds: number) => void;
	/** Called on engine error (network, decode). */
	onError?: (message: string) => void;
}

/**
 * Renders an audio waveform without playback controls.
 * @param props - Audio source + visual options + lifecycle callbacks
 * @returns A div containing the wavesurfer-rendered waveform
 */
function AudioWaveform({
	src,
	height = 48,
	waveColor = "#a3a3a3",
	progressColor,
	onReady,
	onError,
	className,
	...rest
}: AudioWaveformProps) {
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const onReadyRef = React.useRef(onReady);
	const onErrorRef = React.useRef(onError);
	onReadyRef.current = onReady;
	onErrorRef.current = onError;

	React.useEffect(() => {
		if (!containerRef.current) return;
		let disposed = false;
		let ws: import("wavesurfer.js").default | null = null;
		// Track Blob ObjectURLs so we can revoke on teardown.
		const objectUrl = src instanceof Blob ? URL.createObjectURL(src) : null;

		void (async () => {
			const { default: WaveSurfer } = await import("wavesurfer.js");
			if (disposed || !containerRef.current) return;

			ws = WaveSurfer.create({
				container: containerRef.current,
				waveColor,
				progressColor: progressColor ?? waveColor,
				cursorColor: "transparent",
				height,
				barWidth: 2,
				barGap: 1,
				barRadius: 1,
				normalize: true,
				interact: false,
			});

			ws.on("ready", () => {
				if (ws) onReadyRef.current?.(ws.getDuration());
			});
			ws.on("error", (err: Error) => {
				onErrorRef.current?.(err.message);
			});

			void ws.load(objectUrl ?? (src as string));
		})();

		return () => {
			disposed = true;
			ws?.destroy();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [src, height, waveColor, progressColor]);

	return (
		<div
			{...rest}
			ref={containerRef}
			data-hex-audio-waveform
			className={cn("w-full", className)}
		/>
	);
}

export { AudioWaveform };
