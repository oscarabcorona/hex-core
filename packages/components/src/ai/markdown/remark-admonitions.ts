import type { Blockquote, Paragraph, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

const SUPPORTED = new Set(["think"]);

/**
 * Tag blockquotes that start with `[!think]` as admonitions of type
 * `think`. Strips the marker text from the rendered content and writes
 * the type onto `node.data.hProperties` so the rehype pass surfaces it
 * as a `data-admonition` attribute on the `<blockquote>` element. Slot
 * renderers in the React layer then route that attribute to
 * `<Reasoning>`.
 *
 * Pure transform; no I/O. Operates on the mdast tree before
 * `remark-rehype` produces hast.
 *
 * Only ships `[!think]` in Phase 2. Other admonitions
 * (`[!warn]`/`[!info]`/`[!error]`) can be added by extending the
 * `SUPPORTED` set without touching slot wiring.
 *
 * @returns A unified plugin transformer.
 */
export function remarkAdmonitions() {
	return (tree: Root) => {
		visit(tree, "blockquote", (node: Blockquote) => {
			const marker = extractMarker(node);
			if (!marker || !SUPPORTED.has(marker.type)) return;
			stripMarkerText(node, marker.length);
			node.data = node.data ?? {};
			node.data.hProperties = {
				...(node.data.hProperties ?? {}),
				dataAdmonition: marker.type,
			};
		});
	};
}

interface MarkerHit {
	type: string;
	/** Number of characters to strip from the leading text node. */
	length: number;
}

/**
 * Read the leading text of the first paragraph and detect a `[!type]`
 * marker. Returns null when the blockquote doesn't start with one.
 *
 * @param bq - The blockquote node to inspect.
 * @returns The matched admonition type + the marker length, or null.
 */
function extractMarker(bq: Blockquote): MarkerHit | null {
	const firstChild = bq.children[0];
	if (!firstChild || firstChild.type !== "paragraph") return null;
	const firstText = firstChild.children[0];
	if (!firstText || firstText.type !== "text") return null;
	const match = /^\[!([a-z]+)\]\s*\n?/.exec(firstText.value);
	if (!match) return null;
	const type = match[1];
	if (!type) return null;
	return { type, length: match[0].length };
}

/**
 * Remove the marker text from the leading text node so the rendered
 * blockquote shows only the body. If the text node becomes empty after
 * stripping, drop it.
 *
 * @param bq - The blockquote whose leading text needs trimming.
 * @param length - Number of characters to strip from the leading text.
 */
function stripMarkerText(bq: Blockquote, length: number): void {
	const firstChild: Paragraph | undefined = isParagraph(bq.children[0])
		? bq.children[0]
		: undefined;
	if (!firstChild) return;
	const firstText: Text | undefined = isText(firstChild.children[0])
		? firstChild.children[0]
		: undefined;
	if (!firstText) return;
	const stripped: Text = { ...firstText, value: firstText.value.slice(length) };
	if (stripped.value.length === 0) {
		firstChild.children.shift();
	} else {
		firstChild.children[0] = stripped;
	}
}

function isParagraph(node: Blockquote["children"][number] | undefined): node is Paragraph {
	return node?.type === "paragraph";
}

function isText(node: Paragraph["children"][number] | undefined): node is Text {
	return node?.type === "text";
}
