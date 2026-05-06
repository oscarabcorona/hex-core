import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import { listComponents } from "../lib/registry";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hex-core.dev";
const siteTitle = "Hex Core — AI-Native Component Library";
const componentCount = listComponents().length;
const siteDescription = `Component library designed for LLMs and humans. MCP-first distribution, Radix UI + Tailwind CSS, ${componentCount} polished primitives and compounds.`;

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: siteTitle,
		template: "%s — Hex Core",
	},
	description: siteDescription,
	applicationName: "Hex Core",
	authors: [{ name: "Hex Core" }],
	keywords: [
		"hex core",
		"component library",
		"mcp",
		"ai-native",
		"react components",
		"radix ui",
		"tailwind css",
	],
	openGraph: {
		type: "website",
		url: siteUrl,
		siteName: "Hex Core",
		title: siteTitle,
		description: siteDescription,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: siteTitle,
		description: siteDescription,
		images: ["/opengraph-image"],
	},
	alternates: {
		canonical: siteUrl,
	},
};

/**
 * Root layout — HTML shell, fonts, ThemeProvider. All visual chrome (header,
 * sidebar) lives in nested layouts (see app/docs/layout.tsx).
 */
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} scroll-smooth antialiased`}
			style={{ colorScheme: "light dark" }}
			data-scroll-behavior="smooth"
			suppressHydrationWarning
		>
			<body className="min-h-screen bg-background font-sans">
				{/* ThemeProvider wraps <body> (not <html>) so the root layout stays a Server Component. next-themes targets document.documentElement directly via its inline script. */}
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					enableColorScheme
					disableTransitionOnChange
					storageKey="hex-core-theme"
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
