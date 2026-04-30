"use client";

import { useState } from "react";
import {
	Toolbar,
	ToolbarButton,
	ToolbarSeparator,
	ToolbarToggleGroup,
	ToolbarToggleItem,
} from "../../components/ui";

export function ToolbarDemo() {
	const [align, setAlign] = useState<string>("left");

	return (
		<div className="w-full max-w-lg">
			<Toolbar aria-label="Editor controls">
				<ToolbarButton aria-label="Undo">Undo</ToolbarButton>
				<ToolbarButton aria-label="Redo">Redo</ToolbarButton>
				<ToolbarSeparator />
				<ToolbarToggleGroup
					type="single"
					value={align}
					onValueChange={(v) => {
						if (v) setAlign(v);
					}}
				>
					<ToolbarToggleItem value="left" aria-label="Align left">
						Left
					</ToolbarToggleItem>
					<ToolbarToggleItem value="center" aria-label="Align center">
						Center
					</ToolbarToggleItem>
					<ToolbarToggleItem value="right" aria-label="Align right">
						Right
					</ToolbarToggleItem>
				</ToolbarToggleGroup>
			</Toolbar>
		</div>
	);
}
