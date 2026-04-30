"use client";

import { useState } from "react";
import { Button, Composer } from "../../components/ui";

export function ComposerDemo() {
	const [value, setValue] = useState("");

	return (
		<div className="w-full max-w-lg">
			<Composer
				value={value}
				onValueChange={setValue}
				onSubmit={(v) => {
					if (!v.trim()) return;
					setValue("");
				}}
				placeholder="Ask anything…"
			>
				<Button type="submit" disabled={!value.trim()}>
					Send
				</Button>
			</Composer>
		</div>
	);
}
