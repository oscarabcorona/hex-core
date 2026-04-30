"use client";

import { useState } from "react";
import { Button, Composer, SpeechRecognition } from "../../components/ui";

export function SpeechRecognitionDemo() {
	const [listening, setListening] = useState(false);
	const [text, setText] = useState("");
	const [interim, setInterim] = useState("");

	return (
		<div className="w-full max-w-lg space-y-3">
			<Composer
				value={text + (interim ? " " + interim : "")}
				onValueChange={(v) => {
					setText(v);
					if (interim) setInterim("");
				}}
				onSubmit={(v) => {
					if (!v.trim()) return;
					setText("");
					setInterim("");
				}}
				placeholder="Click the mic to dictate, or type…"
			>
				<SpeechRecognition
					isListening={listening}
					onListeningChange={setListening}
					onTranscript={(chunk, isFinal) => {
						if (isFinal) {
							setText((t) => (t ? `${t} ${chunk}` : chunk));
							setInterim("");
						} else {
							setInterim(chunk);
						}
					}}
				/>
				<Button type="submit" disabled={!text.trim() && !interim.trim()}>
					Send
				</Button>
			</Composer>
			<p className="text-xs text-muted-foreground">
				Mic permission required. Firefox lacks Web Speech API and renders the disabled fallback.
			</p>
		</div>
	);
}
