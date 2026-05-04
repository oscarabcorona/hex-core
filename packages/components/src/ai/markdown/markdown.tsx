"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { InlineCitation } from "../inline-citation/inline-citation.js";
import { Reasoning } from "../reasoning/reasoning.js";
import { Sources, type SourceRef } from "../sources/sources.js";
import { ToolCall } from "../tool-call/tool-call.js";
import type { ToolCallState } from "../types.js";
import { cn } from "../../lib/utils.js";
import { closeUnterminated } from "./close-unterminated.js";
import { remarkAdmonitions } from "./remark-admonitions.js";

/**
 * Streaming-safe markdown renderer with AI-aware element slots.
 *
 * Native pipeline (no `streamdown`): `react-markdown` + `remark-gfm`
 * for tables/task lists, `rehype-raw` to preserve the custom
 * `<tool-call>` element, `rehype-sanitize` to whitelist our slot tags,
 * `closeUnterminated` for streaming recovery (closes mid-stream `**`,
 * fences, links, tags before the parser sees them).
 *
 * Slot wiring:
 * - **Fenced code** (` ```lang `) → `<pre><code class="language-*">` (client-safe; consumers post-highlight).
 * - **Footnote-style links** (`[1](url)`) → `<InlineCitation>` (inline `<sup>` with hover preview).
 * - **`<sources data='[…]' />`** → `<Sources>` (collapsible RAG-source list).
 * - **`<tool-call name=… state=… args=… result=…/>`** → `<ToolCall>`.
 * - **`> [!think]\n> body`** blockquotes → `<Reasoning>`.
 *
 * The fenced-code slot doesn't route to the in-house `<CodeBlock>`
 * because CodeBlock is an async Server Component and Markdown runs
 * client-side. Consumers in an RSC tree can compose `<CodeBlock>`
 * directly when they need server-side Shiki highlighting.
 *
 * @example
 * <Message role="assistant">
 *   <Markdown>{streamingText}</Markdown>
 * </Message>
 */
export interface MarkdownProps {
	/** Raw markdown. May be a partial chunk during streaming. */
	children: string;
	className?: string;
}

// Allowlist for the AI-aware slot tags + attrs. `hast-util-sanitize`
// normalizes element tag names to lowercase before lookup, so the
// `tool-call` and `sources` keys are the literal kebab-case HTML tag
// names. The `dataAdmonition` attribute key is the camelCase
// hast-property name — it serializes to the kebab `data-admonition`
// attribute on the rendered `<blockquote>`, which the
// `ReasoningOrQuoteSlot` reads as `rest["data-admonition"]`.
const SANITIZE_SCHEMA = {
	...defaultSchema,
	tagNames: [...(defaultSchema.tagNames ?? []), "tool-call", "sources"],
	attributes: {
		...(defaultSchema.attributes ?? {}),
		"tool-call": ["name", "state", "args", "result"],
		sources: ["data"],
		blockquote: [
			...((defaultSchema.attributes ?? {}).blockquote ?? []),
			"dataAdmonition",
		],
	},
};

const COMPONENTS = {
	code: CodeBlockSlot,
	a: CitationOrLinkSlot,
	blockquote: ReasoningOrQuoteSlot,
	"tool-call": ToolCallSlot,
	sources: SourcesSlot,
} as const;

/**
 * Render streaming-safe markdown with AI-aware slot wiring.
 *
 * @param props - The markdown source string + optional className.
 * @returns A `<div>` wrapping the rendered markdown tree.
 */
function Markdown({ children, className }: MarkdownProps) {
	const safe = React.useMemo(() => closeUnterminated(children), [children]);
	return (
		<div
			className={cn(
				"prose prose-sm max-w-none text-foreground",
				"prose-headings:text-foreground prose-strong:text-foreground",
				"prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:underline",
				"prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none",
				className,
			)}
		>
			{/*
			 * SECURITY INVARIANT: rehype-sanitize MUST follow rehype-raw.
			 * Reordering re-opens raw <script>/<iframe>/event-handler
			 * injection from any markdown source — including streamed model
			 * output, where an attacker could prompt-inject arbitrary HTML.
			 * The sanitize schema's `tagNames` allowlist is the only line
			 * of defense once raw HTML is parsed.
			 */}
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkAdmonitions]}
				rehypePlugins={[rehypeRaw, [rehypeSanitize, SANITIZE_SCHEMA]]}
				components={COMPONENTS}
			>
				{safe}
			</ReactMarkdown>
		</div>
	);
}

export { Markdown, closeUnterminated };

// ─── Slot renderers ────────────────────────────────────────────────────
//
// Inlined into this file (rather than imported from a `slots/`
// subdirectory) so the registry-build distribution path ships a single
// self-contained `markdown.tsx`. The npm-published `@hex-core/components`
// has tsup inline imports anyway; the CLI distribution path
// (`npx hex add markdown`) only walks one file deep, so nested slots
// would break consumer compiles.

// In markdown, `[1](url)` parses as a link whose TEXT is "1" — the
// brackets are syntax, not content. So a "footnote-style" link is one
// whose visible text is a bare integer.
const FOOTNOTE_RE = /^(\d+)$/;

interface CitationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	/** Hast node passed by react-markdown@10 — destructured to keep it off the DOM. */
	node?: unknown;
}

/**
 * `react-markdown` `a` renderer. Footnote-style numeric links become
 * `<InlineCitation>` (inline `<sup>` + hover preview); everything else
 * renders as a default link with prose styling.
 *
 * The block-level `<Citation>` chip is still importable separately —
 * use it inside a `<Sources>` panel where the chip-shaped UI fits, and
 * use this slot for inline mid-sentence references.
 *
 * @param props - Anchor attributes + react-markdown's hast `node` (dropped).
 * @returns Either an `<InlineCitation>` or an `<a>`.
 */
function CitationOrLinkSlot({
	href,
	children,
	className,
	node: _node,
	...rest
}: CitationLinkProps) {
	const text = extractText(children);
	const footnote = FOOTNOTE_RE.exec(text);
	if (footnote && href) {
		const index = Number(footnote[1]);
		return <InlineCitation index={index} url={href} title={inferCitationTitle(href)} />;
	}
	return (
		<a href={href} className={className} {...rest}>
			{children}
		</a>
	);
}

/**
 * Flatten a React-children value to a string for footnote-pattern
 * matching. Footnote links from `react-markdown` come through as a
 * single string child (`<a>1</a>`), so we only need string + array
 * unwrapping; nested elements correctly fall through to a default
 * `<a>` since their text doesn't match `^\d+$` anyway.
 *
 * @param children - The link's React children.
 * @returns The flattened text content (empty for non-string trees).
 */
function extractText(children: React.ReactNode): string {
	if (typeof children === "string") return children;
	if (Array.isArray(children)) return children.map(extractText).join("");
	return "";
}

/**
 * Pick a Citation title from the URL: hostname for absolute URLs,
 * the raw href for relative paths or anchors. Empty hostnames (e.g.
 * `mailto:foo@bar`) fall back to the href so the chip never renders
 * with an empty title.
 */
function inferCitationTitle(href: string): string {
	try {
		const url = new URL(href);
		const hostname = url.hostname.replace(/^www\./, "");
		return hostname.length > 0 ? hostname : href;
	} catch {
		return href;
	}
}

interface CodeBlockSlotProps extends React.HTMLAttributes<HTMLElement> {
	/** Hast node from react-markdown@10 — used to discriminate fenced vs inline. */
	node?: unknown;
}

/**
 * `react-markdown` `code` renderer.
 *
 * - **Block (fenced):** renders `<code class="language-*" data-fenced>`
 *   inside a `<pre>` wrapper that react-markdown adds. We tag the
 *   className so consumer-side highlighters can target it.
 * - **Inline:** plain `<code>` with token + muted-bg styling.
 *
 * Detects fenced via `language-*` className OR newline in children
 * (the parser only emits multi-line content for fenced blocks, never
 * for inline code). react-markdown@10 dropped the `inline` prop, so
 * we don't rely on it.
 *
 * @param props - HTML attributes + react-markdown's hast `node` (dropped).
 * @returns A `<code>` element.
 */
function CodeBlockSlot({ className, children, node: _node, ...rest }: CodeBlockSlotProps) {
	const langMatch = /language-([a-zA-Z0-9-]+)/.exec(className ?? "");
	// Fence detection. Prefer the className signal; fall back to the
	// children shape. `Array.isArray && length > 1` guards the case where
	// a downstream plugin replaces the string child with a React subtree
	// (then `String(children) === "[object Object]"` would falsely flip
	// fenced → inline).
	const isFenced =
		Boolean(langMatch) ||
		(Array.isArray(children) && children.length > 1) ||
		String(children ?? "").includes("\n");

	if (!isFenced) {
		return (
			<code
				className={cn(
					"rounded bg-muted px-[0.3em] py-[0.15em] font-mono text-[0.85em]",
					className,
				)}
				{...rest}
			>
				{children}
			</code>
		);
	}

	return (
		<code
			className={cn("font-mono text-sm", className)}
			data-fenced="true"
			{...rest}
		>
			{children}
		</code>
	);
}

interface ReasoningSlotProps extends React.BlockquoteHTMLAttributes<HTMLQuoteElement> {
	"data-admonition"?: string;
	/** Hast node from react-markdown@10 — destructured to keep it off the DOM. */
	node?: unknown;
}

/**
 * `react-markdown` `blockquote` renderer. Routes `[!think]` admonitions
 * to `<Reasoning>` (tagged via the `remarkAdmonitions` mdast plugin);
 * everything else renders as a styled blockquote.
 *
 * @param props - Blockquote attributes + react-markdown's hast `node` (dropped).
 * @returns Either a `<Reasoning>` or a default `<blockquote>`.
 */
function ReasoningOrQuoteSlot({
	children,
	className,
	node: _node,
	...rest
}: ReasoningSlotProps) {
	if (rest["data-admonition"] === "think") {
		return <Reasoning>{children}</Reasoning>;
	}
	return (
		<blockquote
			className={cn(
				"my-4 border-l-2 border-border pl-4 italic text-muted-foreground",
				className,
			)}
			{...rest}
		>
			{children}
		</blockquote>
	);
}

interface ToolCallAttrs {
	name?: string;
	state?: string;
	args?: string;
	result?: string;
	children?: React.ReactNode;
	/** Hast node from react-markdown@10 — destructured to keep it off the DOM. */
	node?: unknown;
}

const VALID_TOOL_CALL_STATES: Record<ToolCallState, true> = {
	pending: true,
	running: true,
	result: true,
	error: true,
};

/**
 * Renderer for the custom `<tool-call>` HTML tag (preserved by
 * `rehype-raw`, allowed in the sanitize schema). Reads `name`
 * (required), `state` (defaults to `result`), and JSON-stringified
 * `args` / `result` from the element attributes; renders `<ToolCall>`.
 * Falls back to passthrough if `name` is missing — keeps malformed
 * mid-stream fragments from crashing the render.
 *
 * @param props - Tool-call attributes + hast `node` (dropped).
 * @returns A `<ToolCall>` or a Fragment passthrough.
 */
function ToolCallSlot({ name, state, args, result, children, node: _node }: ToolCallAttrs) {
	if (!name) return <>{children}</>;
	const parsedState: ToolCallState = isToolCallState(state) ? state : "result";
	return (
		<ToolCall
			name={name}
			state={parsedState}
			args={parseJson(args)}
			result={parseJson(result)}
		/>
	);
}

function isToolCallState(value: unknown): value is ToolCallState {
	return typeof value === "string" && value in VALID_TOOL_CALL_STATES;
}

function parseJson(raw: string | undefined): unknown {
	if (raw === undefined || raw === "") return undefined;
	try {
		return JSON.parse(raw);
	} catch {
		return raw;
	}
}

interface SourcesSlotAttrs {
	/** JSON-stringified `SourceRef[]`. Parsed lazily. */
	data?: string;
	children?: React.ReactNode;
	/** Hast node from react-markdown@10 — destructured to keep it off the DOM. */
	node?: unknown;
}

/**
 * Renderer for the custom `<sources>` HTML tag (preserved by
 * `rehype-raw`, allowed in the sanitize schema).
 *
 * Reads a JSON-stringified `data` attribute holding a `SourceRef[]`
 * and renders `<Sources>`. Bad JSON, missing data, or a non-array
 * payload all fall through to a Fragment passthrough — keeps malformed
 * mid-stream fragments from crashing the render.
 *
 * @param props - The serialized `data` attribute + hast `node` (dropped).
 * @returns A `<Sources>` panel or a Fragment passthrough.
 */
function SourcesSlot({ data, children, node: _node }: SourcesSlotAttrs) {
	// Memoize the parse pass — every Markdown re-render (each streaming
	// token!) would otherwise re-parse the (potentially large) JSON
	// payload from scratch. Same pattern as `closeUnterminated` upstream.
	const sources = React.useMemo(() => parseSources(data), [data]);
	if (!sources) return <>{children}</>;
	return <Sources sources={sources} />;
}

function parseSources(raw: string | undefined): SourceRef[] | null {
	if (raw === undefined || raw === "") return null;
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return null;
	}
	if (!Array.isArray(parsed)) return null;
	const result: SourceRef[] = [];
	for (const item of parsed) {
		if (!item || typeof item !== "object") continue;
		// `in`-narrowing keeps each property access typed as `unknown`,
		// so the typeof guards below narrow without an `as` cast.
		if (!("title" in item) || typeof item.title !== "string") continue;
		const ref: SourceRef = { title: item.title };
		if ("url" in item && typeof item.url === "string") ref.url = item.url;
		if ("page" in item && typeof item.page === "number") ref.page = item.page;
		if ("index" in item && typeof item.index === "number") ref.index = item.index;
		result.push(ref);
	}
	return result;
}
