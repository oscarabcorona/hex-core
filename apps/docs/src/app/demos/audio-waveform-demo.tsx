"use client";

import { AudioWaveform } from "../../components/ui";

export function AudioWaveformDemo() {
	return (
		<div className="w-full max-w-md">
			<AudioWaveform
				src="https://cdn.freesound.org/previews/770/770999_16235016-lq.mp3"
				height={56}
			/>
			<p className="mt-2 text-xs text-muted-foreground">
				Standalone waveform — no playback controls. Pair with `AudioPlayer` if interaction is needed.
			</p>
		</div>
	);
}
