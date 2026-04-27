/**
 * Emit a Tailwind v3 `tailwind.config.ts` mapping the raw `--<key>` CSS
 * variables (which `globals.css` writes inside `@layer base { :root {} }`)
 * to color/radius/spacing utilities. Mirrors the shadcn/ui shape since
 * Hex UI's components target the same utility surface.
 *
 * The tokens-derived `theme.extend` map comes pre-built from
 * `themeToTailwindConfig` (in @hex-core/tokens) — this just wraps it in
 * a TypeScript module the consumer can import directly.
 */
export function emitTailwindV3Config(extendMaps: Record<string, Record<string, string>>): string {
	const extendBody = JSON.stringify(extendMaps, null, "\t")
		.split("\n")
		.map((line, i) => (i === 0 ? line : `\t\t${line}`))
		.join("\n");

	return `import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config = {
\tdarkMode: ["class"],
\tcontent: [
\t\t"./pages/**/*.{ts,tsx}",
\t\t"./components/**/*.{ts,tsx}",
\t\t"./app/**/*.{ts,tsx}",
\t\t"./src/**/*.{ts,tsx}",
\t],
\ttheme: {
\t\textend: ${extendBody},
\t},
\tplugins: [animate],
} satisfies Config;

export default config;
`;
}
