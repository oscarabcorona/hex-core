/**
 * Functional tests for the native (post-streamdown) Markdown renderer.
 * Covers each AI-aware slot, plain-markdown semantics, and streaming
 * recovery via closeUnterminated.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "./markdown.js";

describe("Markdown — plain markdown semantics", () => {
	it("renders headings, paragraphs, and lists as semantic HTML", () => {
		render(
			<Markdown>{"# Title\n\nA paragraph.\n\n- one\n- two"}</Markdown>,
		);
		expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument();
		expect(screen.getByText("A paragraph.")).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
	});

	it("merges custom className onto the prose root", () => {
		const { container } = render(
			<Markdown className="custom-md">{"hello"}</Markdown>,
		);
		const root = container.querySelector(".prose");
		expect(root).not.toBeNull();
		expect(root?.className).toContain("custom-md");
	});
});

describe("Markdown — fenced code preserves the language class", () => {
	it("renders fenced code with a language-* class for downstream highlighters", () => {
		const { container } = render(
			<Markdown>{"```ts\nconst x = 1;\n```"}</Markdown>,
		);
		// Fenced code → <pre><code class="language-ts" data-fenced>
		const pre = container.querySelector("pre");
		expect(pre).not.toBeNull();
		const code = pre?.querySelector("code");
		expect(code?.getAttribute("class") ?? "").toContain("language-ts");
		expect(code?.getAttribute("data-fenced")).toBe("true");
		expect(code?.textContent ?? "").toContain("const x = 1;");
	});

	it("renders inline code as a plain <code> with no <pre> wrapper", () => {
		const { container } = render(
			<Markdown>{"call `useState` directly"}</Markdown>,
		);
		const codes = container.querySelectorAll("code");
		expect(codes.length).toBeGreaterThanOrEqual(1);
		// The inline path renders a <code> NOT inside a <pre>.
		expect(container.querySelector("pre")).toBeNull();
	});
});

describe("Markdown — footnote-style links route to InlineCitation", () => {
	it("renders [N](url) as an InlineCitation <sup> anchor with the index visible", () => {
		const { container } = render(
			<Markdown>{"see [1](https://anthropic.com/research)"}</Markdown>,
		);
		const link = container.querySelector("a[href='https://anthropic.com/research']");
		expect(link).not.toBeNull();
		// Trigger renders as <sup><a>[1]</a></sup>; hostname/title live in the
		// hover popover which is in a Portal and not mounted until hover.
		expect(link?.closest("sup")).not.toBeNull();
		expect(link?.textContent).toBe("[1]");
		expect(link?.getAttribute("aria-label")).toContain("Source 1");
		expect(link?.getAttribute("aria-label")).toContain("anthropic.com");
	});

	it("renders a regular link as <a> when the text isn't a footnote", () => {
		const { container } = render(
			<Markdown>{"read [the docs](https://hex-core.dev)"}</Markdown>,
		);
		const a = container.querySelector("a");
		expect(a).not.toBeNull();
		expect(a?.getAttribute("href")).toBe("https://hex-core.dev");
		expect(a?.textContent).toBe("the docs");
		// Default link is NOT inside a <sup>.
		expect(a?.closest("sup")).toBeNull();
	});
});

describe("Markdown — <sources> element routes to Sources", () => {
	it("renders the Sources panel with N citation chips when <sources data='[…]' /> appears", () => {
		const sources = [
			{ title: "Auth research", url: "https://example.com/auth", page: 3 },
			{ title: "OAuth 2.1 spec", url: "https://oauth.net/2.1" },
		];
		const md = `<sources data='${JSON.stringify(sources).replace(/'/g, "&apos;")}' />`;
		const { container } = render(<Markdown>{md}</Markdown>);
		expect(screen.getByRole("button", { name: /2 sources/i })).toBeInTheDocument();
		expect(screen.getByText(/auth research/i)).toBeInTheDocument();
		expect(screen.getByText(/oauth 2\.1 spec/i)).toBeInTheDocument();
		// The raw <sources> element is replaced by the slot's React tree —
		// it must not survive into the live DOM (otherwise the 100KB data
		// attr would inflate the live DOM size on every streaming token).
		expect(container.querySelector("sources")).toBeNull();
	});

	it("drops dangerous URL schemes from <sources data> payload before they reach an <a href>", () => {
		const sources = [
			{ title: "JS", url: "javascript:alert(1)" },
			{ title: "Data", url: "data:text/html,<script>alert(1)</script>" },
			{ title: "VB", url: "vbscript:msgbox(1)" },
			{ title: "Good", url: "https://example.com/ok" },
		];
		const md = `<sources data='${JSON.stringify(sources).replace(/'/g, "&apos;")}' />`;
		const { container } = render(<Markdown>{md}</Markdown>);
		// All four rows render (bad ones as non-link spans); panel still mounts.
		expect(screen.getByRole("button", { name: /4 sources/i })).toBeInTheDocument();
		// No anchor carries a dangerous-scheme URL.
		const hrefs = Array.from(container.querySelectorAll("a"))
			.map((a) => (a.getAttribute("href") ?? "").trim().toLowerCase());
		expect(hrefs.some((h) => /^(javascript|data|vbscript):/.test(h))).toBe(false);
	});

	it("falls back to passthrough when <sources data> is malformed JSON", () => {
		const { container } = render(<Markdown>{"<sources data='not json' />"}</Markdown>);
		// No Sources panel rendered.
		expect(screen.queryByRole("button", { name: /sources/i })).toBeNull();
		// Markdown root still renders.
		expect(container.querySelector(".prose")).not.toBeNull();
	});

	it("renders an XSS payload in source title as plain text (React JSX-escapes)", () => {
		// Defense-in-depth: even if a future Citation refactor moves
		// `title` into `dangerouslySetInnerHTML`, this regression test
		// fails — a real <img onerror> would never execute through the
		// current render path because React escapes JSX text children.
		const xss = [
			{ title: '<img src=x onerror="alert(1)">', url: "https://example.com" },
		];
		const md = `<sources data='${JSON.stringify(xss).replace(/'/g, "&apos;")}' />`;
		const { container } = render(<Markdown>{md}</Markdown>);
		// No <img> from the title — React rendered it as escaped text.
		expect(container.querySelector("img")).toBeNull();
		// The literal title string is in the DOM as text content.
		expect(container.textContent ?? "").toContain('<img src=x onerror="alert(1)">');
	});
});

describe("Markdown — sanitize-schema XSS regressions", () => {
	// These tests pin the rehype-sanitize allowlist as the second line of
	// defense after rehype-raw parses inline HTML. If the SECURITY
	// INVARIANT in markdown.tsx is ever inverted (rehype-sanitize before
	// rehype-raw), these all fail loudly.

	it("strips raw <script> tags", () => {
		const { container } = render(
			<Markdown>{"<script>alert(1)</script>safe"}</Markdown>,
		);
		expect(container.querySelector("script")).toBeNull();
		// Body text after the stripped tag still renders.
		expect(container.textContent ?? "").toContain("safe");
	});

	it("strips inline event-handler attributes from img tags", () => {
		const { container } = render(
			<Markdown>{'<img src="x" onerror="alert(1)" alt="x">'}</Markdown>,
		);
		const img = container.querySelector("img");
		// The element may stay (img is allowed) but the onerror handler MUST be stripped.
		if (img) {
			expect(img.getAttribute("onerror")).toBeNull();
		}
	});

	it("strips dangerous-scheme hrefs from markdown links", () => {
		const { container } = render(
			<Markdown>{"[click](javascript:alert(1))"}</Markdown>,
		);
		const link = container.querySelector("a");
		// rehype-sanitize either drops the href entirely or leaves the link without one.
		const href = (link?.getAttribute("href") ?? "").trim().toLowerCase();
		expect(/^(javascript|data|vbscript):/.test(href)).toBe(false);
	});

	it("strips raw <iframe> tags", () => {
		const { container } = render(
			<Markdown>{'<iframe src="https://evil.com"></iframe>after'}</Markdown>,
		);
		expect(container.querySelector("iframe")).toBeNull();
		expect(container.textContent ?? "").toContain("after");
	});
});

describe("Markdown — [!think] admonition routes to Reasoning", () => {
	it("wraps a [!think] blockquote in the Reasoning primitive", () => {
		const { container } = render(
			<Markdown>{"> [!think]\n> Working through it."}</Markdown>,
		);
		// Reasoning ships a Radix Collapsible Trigger that renders a button
		// labeled "Thinking" (or "Thought for X") — the stable contract that
		// proves slot wiring landed. We don't assert body text: Radix
		// Collapsible doesn't mount Content children in closed state without
		// forceMount, so the body is passed-through but not in the DOM until
		// expanded.
		expect(screen.getByRole("button", { name: /thinking/i })).toBeInTheDocument();
		expect(container.querySelector("blockquote")).toBeNull();
	});

	it("renders a regular blockquote when no admonition marker is present", () => {
		const { container } = render(
			<Markdown>{"> just a plain quote"}</Markdown>,
		);
		expect(container.querySelector("blockquote")).not.toBeNull();
		// Reasoning's "Thinking" label should NOT appear.
		expect(screen.queryByText(/thinking/i)).toBeNull();
	});
});

describe("Markdown — <tool-call> element routes to ToolCall", () => {
	it("renders the ToolCall primitive when a <tool-call> element appears in the markdown", () => {
		const md = '<tool-call name="searchDocs" state="result" args=\'{"q":"x"}\' result=\'{"hits":3}\' />';
		render(<Markdown>{md}</Markdown>);
		// ToolCall surfaces the function name in the header.
		expect(screen.getByText(/searchDocs/)).toBeInTheDocument();
	});

	it("falls back to passthrough when <tool-call> has no name (malformed mid-stream)", () => {
		const md = '<tool-call state="running" />';
		const { container } = render(<Markdown>{md}</Markdown>);
		// No name → render nothing (passthrough). The Markdown root exists,
		// but no element with "searchDocs" / function-name surface.
		expect(screen.queryByText(/searchDocs/)).toBeNull();
		expect(container.querySelector(".prose")).not.toBeNull();
	});
});

describe("Markdown — streaming recovery", () => {
	it("renders mid-stream partial input without throwing (unclosed bold)", () => {
		const { container } = render(
			<Markdown>{"# Heading\n\n**bold without close"}</Markdown>,
		);
		expect(screen.getByRole("heading", { level: 1, name: "Heading" })).toBeInTheDocument();
		// Bold renders as <strong> after closeUnterminated patches the marker.
		expect(container.querySelector("strong")).not.toBeNull();
	});

	it("renders an unclosed fenced code block without throwing", () => {
		const { container } = render(
			<Markdown>{"```ts\nconst x ="}</Markdown>,
		);
		// closeUnterminated appends \n```\n so the parser sees a closed fence.
		const code = container.querySelector("code.language-ts, code[class*='language-ts']");
		expect(code).not.toBeNull();
		expect(code?.textContent ?? "").toContain("const x =");
	});
});
