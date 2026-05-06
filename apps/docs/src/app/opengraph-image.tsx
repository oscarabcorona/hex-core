import { ImageResponse } from "next/og";
import { listComponents } from "../lib/registry";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Hex Core — AI-Native Component Library";

/*
 * Colors here mirror the dark-mode palette in `apps/docs/src/app/globals.css`
 * (`--color-background: hsl(210 15% 2%)`, `--color-foreground: hsl(222 22.5% 89%)`,
 * `--color-primary: hsl(222 30% 60%)`, `--color-primary-foreground: hsl(210 15% 8%)`).
 * Satori cannot resolve CSS custom properties, so they're inlined. If the
 * palette in globals.css changes, refresh these to match.
 *
 * Satori requires every <div> with multiple children (text runs count too) to
 * declare `display: flex`. Every div below sets it explicitly.
 */

/**
 * Build-time OG image for the root route. Renders to a static PNG at
 * 1200×630 via Next.js file convention. The component count is pulled from
 * the registry so it stays in sync with the library.
 */
export default function OpenGraphImage() {
	const count = listComponents().length;

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				width: "100%",
				height: "100%",
				padding: "80px",
				background: "hsl(210 15% 2%)",
				color: "hsl(222 22.5% 89%)",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: 64,
						height: 64,
						borderRadius: 14,
						background: "hsl(222 30% 60%)",
						color: "hsl(210 15% 8%)",
						fontWeight: 700,
						fontSize: 36,
					}}
				>
					H
				</div>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<div style={{ display: "flex", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>
						Hex Core
					</div>
					<div style={{ display: "flex", fontSize: 18, opacity: 0.7 }}>
						AI-Native Component Library
					</div>
				</div>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				<div
					style={{
						display: "flex",
						fontSize: 68,
						fontWeight: 700,
						letterSpacing: "-0.03em",
						lineHeight: 1.05,
					}}
				>
					{count} components. MCP-first distribution.
				</div>
				<div style={{ display: "flex", fontSize: 26, opacity: 0.7 }}>
					Radix UI + Tailwind + schema-typed AI hints
				</div>
			</div>
		</div>,
		size,
	);
}
