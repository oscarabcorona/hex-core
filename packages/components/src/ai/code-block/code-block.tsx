import * as React from "react";
import { cache } from "react";
import { type BundledLanguage, codeToHtml } from "shiki";
import { cn } from "../../lib/utils.js";
import { CodeBlockCopy } from "./code-block-copy.js";

/**
 * Languages we surface in the prop type. Defined as a strict subset of
 * Shiki's `BundledLanguage` (plus `"text"` from `PlainTextLanguage`) so the
 * `language` prop is type-checked against the real list of bundled grammars
 * without casting at the call site. Consumers needing other grammars can
 * widen this type and pass any Shiki language ID through.
 */
export type SupportedLang =
	| Extract<BundledLanguage, "bash" | "ts" | "tsx" | "js" | "jsx" | "json" | "css" | "html" | "md" | "py">
	| "text";

const LABEL_TO_LANG: Record<string, SupportedLang> = {
	pnpm: "bash",
	npm: "bash",
	yarn: "bash",
	bun: "bash",
	bash: "bash",
	sh: "bash",
	shell: "bash",
	zsh: "bash",
	ts: "ts",
	typescript: "ts",
	tsx: "tsx",
	js: "js",
	javascript: "js",
	jsx: "jsx",
	json: "json",
	css: "css",
	html: "html",
	md: "md",
	markdown: "md",
	py: "py",
	python: "py",
	text: "text",
	prompt: "text",
	plain: "text",
};

const DEFAULT_THEMES = { light: "github-light", dark: "github-dark" } as const;

/**
 * Per-render-tree memoization of `codeToHtml`. React's `cache()` dedupes
 * identical (code, lang, theme) combos within a single RSC render pass —
 * useful when a page renders many copies of the same install snippet.
 * Shiki itself caches grammars/themes per process, so this layer only
 * eliminates duplicate parse + tokenize work within one request.
 */
const cachedCodeToHtml = cache(
	async (code: string, lang: SupportedLang, themesKey: string, themes: { light: string; dark: string }) => {
		void themesKey;
		return codeToHtml(code, { lang, themes, defaultColor: false });
	},
);

function resolveLang(label?: string, language?: SupportedLang): SupportedLang {
	if (language) return language;
	if (label) {
		const fromLabel = LABEL_TO_LANG[label.toLowerCase()];
		if (fromLabel) return fromLabel;
	}
	return "text";
}

/**
 * Syntax-highlighted code block with a language-label header and a copy
 * button. Highlighting runs server-side via Shiki using a dual-theme
 * (default: github-light / github-dark) so the same HTML flips on
 * `data-theme`/`prefers-color-scheme` without client-side rehydration.
 *
 * Async Server Component — render inside RSC trees or pre-render in
 * static contexts. For client-side streaming code blocks, plug Streamdown's
 * built-in code rendering via `Markdown components={{ pre: … }}` instead.
 *
 * @example
 * <CodeBlock label="pnpm" code="pnpm add @hex-core/components" />
 * @example
 * <CodeBlock language="tsx" code={src} />
 */
export interface CodeBlockProps {
	code: string;
	/** Optional header label (e.g. "pnpm", "tsx"). Inferred from `language` if omitted. */
	label?: string;
	/** Explicit Shiki grammar key. Overrides inference from `label`. */
	language?: SupportedLang;
	/** Override the default github-light / github-dark theme pair. */
	themes?: { light: string; dark: string };
	className?: string;
}

/**
 * Async Server Component that highlights `code` server-side and emits the
 * resulting HTML with a header + copy island.
 *
 * @param props - code, optional label/language/themes
 * @returns A bordered card wrapping the highlighted code
 */
async function CodeBlock({
	code,
	label,
	language,
	themes = DEFAULT_THEMES,
	className,
}: CodeBlockProps) {
	const lang = resolveLang(label, language);
	const themesKey = `${themes.light}|${themes.dark}`;
	const html = await cachedCodeToHtml(code, lang, themesKey, themes);
	const displayLabel = label ?? lang;

	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-lg border bg-card text-card-foreground",
				className,
			)}
		>
			<div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5">
				<span className="font-mono text-xs font-medium text-muted-foreground">{displayLabel}</span>
				<CodeBlockCopy code={code} />
			</div>
			<div
				data-shiki=""
				className="overflow-x-auto p-4 font-mono text-sm [&_pre]:!bg-transparent"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is trusted server-rendered HTML
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	);
}

export { CodeBlock };
