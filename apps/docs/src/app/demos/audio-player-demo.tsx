"use client";

import { AudioPlayer } from "../../components/ui";

export function AudioPlayerDemo() {
	return (
		<div className="w-full max-w-md">
			<AudioPlayer src="https://cdn.freesound.org/previews/770/770999_16235016-lq.mp3" />
			<p className="mt-2 text-xs text-muted-foreground">
				Headless playback control. Pass a URL or Blob, optionally `autoPlay` and `onEnded`.
			</p>
		</div>
	);
}
