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

describe("Markdown — footnote-style links route to Citation", () => {
	it("renders [N](url) as a Citation anchor with the index span", () => {
		const { container } = render(
			<Markdown>{"see [1](https://anthropic.com/research)"}</Markdown>,
		);
		const link = container.querySelector("a[href='https://anthropic.com/research']");
		expect(link).not.toBeNull();
		// Citation prepends the [N] label inside a font-mono span.
		expect(link?.textContent ?? "").toContain("[1]");
		expect(link?.textContent ?? "").toContain("anthropic.com");
	});

	it("renders a regular link as <a> when the text isn't a footnote", () => {
		const { container } = render(
			<Markdown>{"read [the docs](https://hex-core.dev)"}</Markdown>,
		);
		const a = container.querySelector("a");
		expect(a).not.toBeNull();
		expect(a?.getAttribute("href")).toBe("https://hex-core.dev");
		expect(a?.textContent).toBe("the docs");
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
