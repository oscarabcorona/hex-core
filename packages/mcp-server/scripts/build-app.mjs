/**
 * Bundle the theme-browser MCP App into a single self-contained HTML file at
 * `dist/apps/theme-browser.html`. Runs after tsup in the package build.
 *
 * The template carries an `<!-- @generated:app-bundle -->` marker where the
 * esbuild-bundled script is spliced in — same marker-splice convention as
 * scripts/build-readme.mjs. The output must be self-contained: MCP Apps
 * hosts render the resource in a sandboxed iframe with no network access to
 * this package.
 */
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const APP_DIR = join(PKG_ROOT, "src/apps/theme-browser");
const OUT_DIR = join(PKG_ROOT, "dist/apps");
const MARKER = "<!-- @generated:app-bundle -->";

const bundle = await build({
	entryPoints: [join(APP_DIR, "app.ts")],
	bundle: true,
	format: "iife",
	platform: "browser",
	target: "es2020",
	minify: true,
	write: false,
});

// A "</script>" inside a string literal would terminate the inline tag early.
const js = bundle.outputFiles[0].text.replaceAll("</script", "<\\/script");

const template = readFileSync(join(APP_DIR, "template.html"), "utf8");
if (!template.includes(MARKER)) {
	console.error(`template.html is missing the ${MARKER} marker`);
	process.exit(1);
}
// Function replacement — string replacement would interpret "$&" in the JS.
const html = template.replace(MARKER, () => `<script>\n${js}\n</script>`);

mkdirSync(OUT_DIR, { recursive: true });
const outFile = join(OUT_DIR, "theme-browser.html");
writeFileSync(outFile, html);
console.log(`theme-browser app: ${(html.length / 1024).toFixed(1)} KB → ${outFile}`);
