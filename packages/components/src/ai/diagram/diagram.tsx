"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Render a Mermaid diagram from a source string. Useful for AI agent
 * outputs that emit flowcharts / sequence diagrams / class diagrams in
 * Markdown — pipe the code-fence body straight in.
 *
 * Heavy peer: requires `mermaid` (~700 KB gzip). The hex-core CLI's `add`
 * flow prompts before installing — this is the largest engine in the
 * AI Elements set, so the consumer should opt in deliberately.
 *
 * @example
 * <Diagram>{`flowchart LR\n  A --> B\n  B --> C`}</Diagram>
 *
 * <Diagram theme="dark" id="agent-flow">{mermaidSource}</Diagram>
 */
export interface DiagramProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onError"> {
	/** Mermaid source string. */
	children: string;
	/** Light or dark mermaid theme. Default "default" (light). */
	theme?: "default" | "dark" | "forest" | "neutral";
	/** Stable ID for the rendered SVG. Required when multiple diagrams share a page; auto-generated when omitted. */
	id?: string;
	/** Called on parse/render failure with the engine's message. */
	onError?: (message: string) => void;
}

/**
 * Renders a Mermaid diagram from source.
 * @param props - Source string + theme + lifecycle callbacks
 * @returns A div containing the rendered SVG
 */
function Diagram({ children: source, theme = "default", id, onError, className, ...rest }: DiagramProps) {
	const [svg, setSvg] = React.useState<string>("");
	const [error, setError] = React.useState<string | null>(null);
	const onErrorRef = React.useRef(onError);
	onErrorRef.current = onError;

	// useId is stable across SSR/hydration AND unique per component instance,
	// avoiding the module-singleton counter bug where two diagrams in
	// streamed AI output collide on mermaid's internal cache key. Mermaid
	// rejects ":" in IDs (React's useId emits ":r0:"-style) so strip it.
	const reactId = React.useId();
	const stableId = id ?? `hex-diagram-${reactId.replace(/:/g, "-")}`;

	React.useEffect(() => {
		let cancelled = false;
		setError(null);
		void (async () => {
			try {
				const { default: mermaid } = await import("mermaid");
				if (cancelled) return;
				mermaid.initialize({ startOnLoad: false, theme, securityLevel: "strict" });
				const { svg: rendered } = await mermaid.render(stableId, source);
				if (!cancelled) setSvg(rendered);
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				if (cancelled) return;
				setError(message);
				onErrorRef.current?.(message);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [source, theme, stableId]);

	if (error) {
		return (
			<div
				{...rest}
				data-hex-diagram-error
				role="alert"
				className={cn(
					"rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive",
					className,
				)}
			>
				<div className="font-medium">Diagram failed to render</div>
				<pre className="mt-1 whitespace-pre-wrap text-xs opacity-80">{error}</pre>
			</div>
		);
	}

	return (
		<div
			{...rest}
			data-hex-diagram
			data-theme={theme}
			className={cn("overflow-auto rounded-md border bg-background p-3", className)}
			// dangerouslySetInnerHTML: mermaid sanitizes its own SVG output via
			// securityLevel="strict" (no foreignObject, no script tags). Source
			// strings still come from the consumer — never from untrusted user
			// input without their own validation upstream.
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	);
}

export { Diagram };
