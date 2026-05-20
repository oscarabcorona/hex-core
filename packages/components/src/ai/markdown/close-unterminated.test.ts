/**
 * Truth table for closeUnterminated. Each pair tests an open-token
 * shape at end-of-input and asserts the appended closer.
 */
import { describe, expect, it } from "vitest";
import { closeUnterminated } from "./close-unterminated.js";

describe("closeUnterminated — pass-through", () => {
	it("returns the input unchanged when everything is well-terminated", () => {
		const md = "# Heading\n\n**bold** and *italic* and `code`.\n";
		expect(closeUnterminated(md)).toBe(md);
	});

	it("returns empty input unchanged", () => {
		expect(closeUnterminated("")).toBe("");
	});

	it("leaves a fully-closed fenced block unchanged", () => {
		const md = "```ts\nconst x = 1;\n```\n";
		expect(closeUnterminated(md)).toBe(md);
	});
});

describe("closeUnterminated — fenced code", () => {
	it("appends a closing fence when the code block is open", () => {
		const md = "```ts\nconst x =";
		const out = closeUnterminated(md);
		expect(out).toBe("```ts\nconst x =\n```\n");
	});

	it("does not double-close an already-closed fence", () => {
		const md = "```\nfoo\n```";
		expect(closeUnterminated(md)).toBe(md);
	});

	it("ignores inline ** inside an unclosed fence", () => {
		const md = "```\n**not bold";
		const out = closeUnterminated(md);
		// Should add only the fence closer — no `**` because it's inside the masked fence.
		expect(out).toBe("```\n**not bold\n```\n");
	});
});

describe("closeUnterminated — HTML tag", () => {
	it("appends > for an unclosed tag at the tail", () => {
		expect(closeUnterminated("text <span")).toBe("text <span>");
	});

	it("appends > for an open tag with attributes", () => {
		expect(closeUnterminated('text <a href="x"')).toBe('text <a href="x">');
	});

	it("does not add > when the tag is fully formed", () => {
		expect(closeUnterminated("text <span>x</span>")).toBe("text <span>x</span>");
	});
});

describe("closeUnterminated — links", () => {
	it("appends ) for unclosed paren", () => {
		expect(closeUnterminated("see [docs](https://x.com")).toBe("see [docs](https://x.com)");
	});

	it("appends ] for unclosed bracket without paren", () => {
		expect(closeUnterminated("see [docs")).toBe("see [docs]");
	});

	it("does not appen ) when the link is complete", () => {
		expect(closeUnterminated("see [docs](https://x.com)")).toBe("see [docs](https://x.com)");
	});
});

describe("closeUnterminated — inline backticks", () => {
	it("appends a backtick for unclosed inline code at line end", () => {
		expect(closeUnterminated("call `foo")).toBe("call `foo`");
	});

	it("does not add a backtick when inline code is closed", () => {
		expect(closeUnterminated("call `foo`")).toBe("call `foo`");
	});
});

describe("closeUnterminated — strikethrough", () => {
	it("appends ~~ for unclosed strike", () => {
		expect(closeUnterminated("this is ~~broken")).toBe("this is ~~broken~~");
	});

	it("leaves balanced strike unchanged", () => {
		expect(closeUnterminated("this is ~~broken~~ now")).toBe("this is ~~broken~~ now");
	});
});

describe("closeUnterminated — bold", () => {
	it("appends ** for unclosed bold", () => {
		expect(closeUnterminated("this is **bold")).toBe("this is **bold**");
	});

	it("leaves balanced bold unchanged", () => {
		expect(closeUnterminated("this is **bold** end")).toBe("this is **bold** end");
	});
});

describe("closeUnterminated — italic", () => {
	it("appends * for unclosed asterisk italic", () => {
		expect(closeUnterminated("a *italic")).toBe("a *italic*");
	});

	it("appends _ for unclosed underscore italic", () => {
		expect(closeUnterminated("a _italic")).toBe("a _italic_");
	});

	it("ignores intra-word underscores", () => {
		expect(closeUnterminated("foo_bar_baz")).toBe("foo_bar_baz");
	});

	it("handles bold + italic combo `***both***` left open as `***both`", () => {
		// `***both` = one ** + one *, so we need to close in reverse: append * then **.
		const out = closeUnterminated("a ***both");
		// Order of suffix assembly is bold-first then italic; final string: "a ***both***"
		expect(out).toBe("a ***both***");
	});
});

describe("closeUnterminated — HTML comments and autolinks", () => {
	it("appends --> for an unclosed HTML comment at any position", () => {
		expect(closeUnterminated("text <!-- in progress")).toBe("text <!-- in progress-->");
	});

	it("does not double-close a fully closed comment", () => {
		expect(closeUnterminated("<!-- aside --> rest")).toBe("<!-- aside --> rest");
	});

	it("does not add > when a comment closer is also being added", () => {
		// Defensive: my regex 2a should fire and skip the tag clause.
		const out = closeUnterminated("a <!-- mid");
		expect(out).toBe("a <!-- mid-->");
		expect(out.endsWith(">-->")).toBe(false);
	});

	it("closes a streamed autolink-shaped tag with > (lucky alignment with autolink syntax)", () => {
		// `<https://example.com` looks like an autolink to remark, but at the
		// regex level it's treated as a tag-shaped opener. Closing with `>`
		// happens to produce a valid autolink.
		expect(closeUnterminated("see <https://example.com")).toBe("see <https://example.com>");
	});
});

describe("closeUnterminated — footnotes, images, autolinks", () => {
	it("appends ] for an unclosed GFM footnote reference shape", () => {
		// `[^1` matches the bracket clause. Once closed, remark-gfm renders
		// it as a footnote reference (ok behavior).
		expect(closeUnterminated("see [^1")).toBe("see [^1]");
	});

	it("appends ) for an unclosed image link", () => {
		expect(closeUnterminated("![hero](https://i.example.com/foo")).toBe(
			"![hero](https://i.example.com/foo)",
		);
	});

	it("appends ] for an unclosed image alt text", () => {
		expect(closeUnterminated("![hero")).toBe("![hero]");
	});
});

describe("closeUnterminated — idempotence", () => {
	it("running twice on the same input produces the same output (idempotent)", () => {
		const inputs = [
			"# Heading\n\n**bold** and `code`",
			"```ts\nconst x =",
			"see [docs",
			"see [docs](https://x.com",
			"<!-- mid",
			"text <!-- aside --> rest",
		];
		for (const md of inputs) {
			const once = closeUnterminated(md);
			const twice = closeUnterminated(once);
			expect(twice).toBe(once);
		}
	});
});

describe("closeUnterminated — escapes and unicode", () => {
	it("does not close an escaped asterisk italic (`\\*not italic`)", () => {
		const md = "foo \\*not italic";
		expect(closeUnterminated(md)).toBe(md);
	});

	it("does not close an escaped inline backtick (\\`code)", () => {
		const md = "foo \\`code";
		expect(closeUnterminated(md)).toBe(md);
	});

	it("does not close an escaped underscore italic (`\\_under`)", () => {
		const md = "foo \\_under";
		expect(closeUnterminated(md)).toBe(md);
	});

	it("closes only the real italic when mixed with an escaped marker", () => {
		expect(closeUnterminated("foo \\* and *real")).toBe("foo \\* and *real*");
	});

	it("treats `_中文_` as a closed underscore pair (Unicode word boundary)", () => {
		const md = "前 _中文_ 后";
		expect(closeUnterminated(md)).toBe(md);
	});

	it("closes a CRLF-line-ended fenced code block", () => {
		const md = "```ts\r\nconst x =";
		expect(closeUnterminated(md)).toBe("```ts\r\nconst x =\n```\n");
	});

	it("detects a fence opener on a later line even when an earlier line has balanced inline code", () => {
		const md = "foo `bar` baz\n```ts\nconst x =";
		const out = closeUnterminated(md);
		expect(out.startsWith(md)).toBe(true);
		expect(out.endsWith("\n```\n")).toBe(true);
		// The backtick counter must NOT also add a stray `\`` — inline code on line 1 is balanced.
		expect(out.endsWith("`")).toBe(false);
	});
});

describe("closeUnterminated — combined real-world streams", () => {
	it("closes multiple opens in one pass (fence + link)", () => {
		const md = "see [docs](https://x.com\n```ts\nconst y =";
		const out = closeUnterminated(md);
		// Both closers append at end-of-input. The parser then recovers; we
		// don't try to splice closers mid-stream.
		expect(out.startsWith(md)).toBe(true);
		expect(out).toContain("```\n");
		expect(out.endsWith(")")).toBe(true);
	});

	it("renders a typical mid-stream LLM chunk safely", () => {
		const md = "## Reasoning\n\nLet me **think** about this. Then `useState";
		const out = closeUnterminated(md);
		// Bold is closed (balanced), only the inline-code is open.
		expect(out).toBe("## Reasoning\n\nLet me **think** about this. Then `useState`");
	});
});
