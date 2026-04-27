#!/usr/bin/env node
/* global console */
/* eslint-disable no-console */
/**
 * Regenerates packages/mcp-server/README.md from README.template.md by
 * importing the built MCP_CLIENTS array out of dist/clients.js and
 * splicing the per-client wiring sections into the template at the
 * marker comment "@generated:client-wiring".
 *
 * Order matters: the package's `build` script runs `tsup` first (which
 * emits `dist/clients.js`) and then this script. A direct import beats
 * regex-parsing the TypeScript source — quirks strings can contain `{`,
 * `}`, or other tokens that a depth-counting parser would mis-split.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");
const distClients = resolve(pkgRoot, "dist/clients.js");
const templatePath = resolve(pkgRoot, "README.template.md");
const outputPath = resolve(pkgRoot, "README.md");
const SPLICE_MARKER = "<!-- @generated:client-wiring -->";

const { MCP_CLIENTS } = await import(pathToFileURL(distClients).href);

if (!Array.isArray(MCP_CLIENTS) || MCP_CLIENTS.length === 0) {
	throw new Error(
		`MCP_CLIENTS in ${distClients} is empty or not an array — did tsup run?`,
	);
}

/**
 * Render one client's section as Markdown.
 * @param {object} c One McpClientWiring entry from MCP_CLIENTS.
 * @returns {string} The Markdown chunk for this client (header, snippet, quirks, docs link).
 */
function renderClientSection(c) {
	const verifiedBadge =
		c.schemaStability === "verified-volatile" && c.verifiedOn
			? ` _(verified ${c.verifiedOn})_`
			: "";
	const note = c.configPathNote ? `\n${c.configPathNote}\n` : "";
	const quirks =
		c.quirks.length > 0
			? `\n${c.quirks.map((q) => `- ${q}`).join("\n")}\n`
			: "";
	return [
		`### ${c.label}${verifiedBadge}`,
		``,
		`Config: \`${c.configPath}\`${note ? "  " : ""}`,
		note.trim(),
		``,
		`\`\`\`${c.format}`,
		c.snippet,
		`\`\`\``,
		quirks.trim() ? `\n${quirks.trim()}` : "",
		``,
		`Docs: [${c.docsUrl}](${c.docsUrl})`,
		``,
	]
		.filter((line) => line !== undefined)
		.join("\n");
}

const template = readFileSync(templatePath, "utf-8");
if (template.split(SPLICE_MARKER).length !== 2) {
	throw new Error(
		`Template ${templatePath} must contain exactly one "${SPLICE_MARKER}" splice marker.`,
	);
}

const wiringMarkdown = MCP_CLIENTS.map(renderClientSection).join("\n");
// Strip the splice marker from the final output — it's a build-time anchor
// for the template, not something an npm consumer should see in their
// rendered README.
const output = template.replace(SPLICE_MARKER, wiringMarkdown);

writeFileSync(outputPath, output, "utf-8");
console.log(
	`✓ Regenerated README.md from template + ${MCP_CLIENTS.length} client wirings.`,
);
