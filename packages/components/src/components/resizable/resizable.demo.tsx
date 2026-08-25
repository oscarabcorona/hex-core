"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@hex-core/components";

/** Resizable demo: two horizontal panels separated by a grab-grip handle. */
export function ResizableDemo() {
	return (
		<ResizablePanelGroup
			orientation="horizontal"
			className="min-h-[200px] max-w-md rounded-lg border"
		>
			<ResizablePanel defaultSize={50}>
				<div className="flex h-full items-center justify-center p-6">
					<span className="font-medium">One</span>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50}>
				<ResizablePanelGroup orientation="vertical">
					<ResizablePanel defaultSize={50}>
						<div className="flex h-full items-center justify-center p-6">
							<span className="font-medium">Two</span>
						</div>
					</ResizablePanel>
					<ResizableHandle />
					<ResizablePanel defaultSize={50}>
						<div className="flex h-full items-center justify-center p-6">
							<span className="font-medium">Three</span>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
