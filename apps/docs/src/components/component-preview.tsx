"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui";
import { CodeBlockCopy } from "./code-block-copy";

type View = "preview" | "code";

function isView(value: string): value is View {
	return value === "preview" || value === "code";
}

/**
 * Two-tab preview pane — Preview + Code — dogfooding the library's own Tabs
 * primitive. The Code tab renders pre-highlighted Shiki HTML; copy affordance
 * sits in the same bar (as a sibling of the tablist, not inside it).
 * @param children - The rendered component preview
 * @param code - The raw source code (used for the copy button payload)
 * @param codeHtml - Shiki-highlighted HTML for the Code tab
 */
export function ComponentPreview({
	children,
	code,
	codeHtml,
}: {
	children: React.ReactNode;
	code: string;
	codeHtml: string;
}) {
	const [view, setView] = useState<View>("preview");

	return (
		<div className="overflow-hidden rounded-lg border">
			<Tabs
				value={view}
				onValueChange={(next) => {
					if (isView(next)) setView(next);
				}}
			>
				<div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
					<TabsList
						aria-label="Preview or code"
						className="h-auto border border-border/60 bg-muted/50 p-0.5"
					>
						<TabsTrigger value="preview" className="px-3 py-1">
							Preview
						</TabsTrigger>
						<TabsTrigger value="code" className="px-3 py-1">
							Code
						</TabsTrigger>
					</TabsList>
					{view === "code" ? (
						<div className="ml-auto">
							<CodeBlockCopy code={code} />
						</div>
					) : null}
				</div>
				<TabsContent
					value="preview"
					className="mt-0 flex min-h-[200px] items-center justify-center bg-muted/30 p-8 shadow-[inset_0_1px_2px_0_rgb(0_0_0/0.04)]"
				>
					{children}
				</TabsContent>
				<TabsContent value="code" className="mt-0">
					{/* Wrapping div is required: TabsContent forwards children, so we
					    can't put `dangerouslySetInnerHTML` on the same element without
					    losing the Radix role="tabpanel" wrapper. */}
					<div
						data-shiki=""
						className="overflow-x-auto p-4 font-mono text-sm [&_pre]:!bg-transparent"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is trusted server-rendered HTML
						dangerouslySetInnerHTML={{ __html: codeHtml }}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
