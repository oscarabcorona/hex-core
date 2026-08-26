import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";
import reactHooks from "eslint-plugin-react-hooks";

// FLAT CONFIG REPLACES, IT DOES NOT MERGE. Two blocks that both set
// `no-restricted-syntax` for the same file keep only the LAST block's
// selectors — the earlier ones are silently disarmed, with no warning and no
// failing test. This is not hypothetical: the colour fence below shipped
// scoped to the component layers while a later unscoped block re-declared the
// rule, so a `#ff00aa` in `primitives/button/button.tsx` linted clean for the
// whole life of the rule.
//
// So the selectors live in named constants and every block that narrows a
// file set REPEATS what it inherits. If you add a block that sets
// `no-restricted-syntax`, spread `BASE_SYNTAX` into it.

/**
 * `as unknown as T` defeats the type system outright — it is the one
 * assertion form that can turn any value into any other with no overlap
 * check. Zero sites remain; this keeps it that way.
 *
 * The alternatives, in order of preference: `satisfies` for object literals,
 * a Zod `.parse()` at a trust boundary, a type guard for unions, `declare
 * global` for untyped browser APIs, and an intersection
 * (`T & Record<string, unknown>`) to widen a fixture.
 */
const NO_UNKNOWN_CAST = {
	selector: "TSAsExpression > TSAsExpression > TSUnknownKeyword",
	message:
		"`as unknown as T` is banned. Use `satisfies`, a Zod `.parse()` at the boundary, a type guard, `declare global` for browser APIs, or an intersection type to widen. See CONTRIBUTING.md § Type safety.",
};

/** Everything `no-restricted-syntax` bans repo-wide. Narrowing blocks repeat it. */
const BASE_SYNTAX = [NO_UNKNOWN_CAST];

const COLOUR_MESSAGE =
	"Hardcoded colour. Use a semantic token — a Tailwind utility (`bg-primary`) or `hsl(var(--border))`. See the token pyramid in packages/tokens/src/themes/default.ts.";

/**
 * Colour literals belong in the token system, not in a component.
 *
 * The whole point of the two-tier palette in `packages/tokens/src/themes/` is
 * that changing a colour is one edit; a hardcoded `#171717` in a component is
 * a value the theme cannot reach, and it will not flip in dark mode.
 */
const NO_COLOUR_LITERALS = [
	{
		// 3, 6 or 8 digits. The 4-digit form is omitted deliberately: it
		// collides with ordinary strings like an order id of `#1042`.
		selector: "Literal[value=/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
		message: COLOUR_MESSAGE,
	},
	{
		// Matches a colour function given literal channels — `hsl(222 25% 18%)`,
		// `rgba(0, 0, 0, .1)`. Deliberately does NOT match `hsl(var(--primary))`,
		// which is the prescribed way to read a token.
		selector: "Literal[value=/(?:rgba?|hsla?)\\(\\s*[\\d.]/]",
		message: COLOUR_MESSAGE,
	},
	{
		// The same, inside a template literal — how conditional classNames are
		// built. Without this arm, `` `border-[${"#171717"}]` `` and any
		// interpolated style string sail past the two selectors above.
		selector:
			"TemplateElement[value.raw=/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b|(?:rgba?|hsla?)\\(\\s*[\\d.]/]",
		message: COLOUR_MESSAGE,
	},
];

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	jsdoc.configs["flat/recommended-typescript-flavor"],
	{
		plugins: { "react-hooks": reactHooks },
		rules: {
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",
		},
	},
	prettier,
	{
		ignores: [
			"**/dist/**",
			"**/node_modules/**",
			"**/.tsup/**",
			"registry/**",
			"apps/**",
			"tests/regression/src/fixtures/**",
			// Scaffolded `hex poc` apps dogfooded at the repo root: generated
			// output plus their own .next builds, linted by their own config.
			"**/.next/**",
			"*-poc*/**",
		],
	},
	{
		rules: {
			// Error, not warn: CodeQL reports unused imports as findings, so a
			// warning here means a red PR check later. Zero across the repo.
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					destructuredArrayIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "error",
			"no-console": ["warn", { allow: ["warn", "error"] }],
			"jsdoc/require-jsdoc": [
				"warn",
				{
					require: {
						FunctionDeclaration: true,
						MethodDefinition: true,
						ClassDeclaration: true,
					},
					contexts: [
						"ExportNamedDeclaration > FunctionDeclaration",
						"ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression",
					],
					checkConstructors: false,
				},
			],
			"jsdoc/require-description": ["warn", { contexts: ["any"] }],
			"jsdoc/require-param-type": "off",
			"jsdoc/require-returns-type": "off",
		},
	},
	{
		files: [
			"packages/cli/**/*.ts",
			"scripts/**/*.ts",
			"packages/*/scripts/**/*.{js,mjs}",
			"tests/regression/scripts/**/*.ts",
		],
		languageOptions: {
			globals: {
				console: "readonly",
				process: "readonly",
			},
		},
		rules: {
			"no-console": "off",
		},
	},
	{
		files: ["**/*.schema.ts"],
		rules: {
			"jsdoc/require-jsdoc": "off",
		},
	},
	{
		files: ["packages/components/**/*.tsx"],
		rules: {
			"jsdoc/check-param-names": "off",
			"jsdoc/require-param": "off",
		},
	},
	{
		// The repo-wide syntax bans. Must come BEFORE any block that narrows
		// `no-restricted-syntax` to a file subset — see the header note.
		rules: {
			"no-restricted-syntax": ["error", ...BASE_SYNTAX],
		},
	},
	{
		/*
		 * The colour fence, scoped to the layers where the token system fully
		 * applies. `src/ai/**` is deliberately outside it: Terminal,
		 * AudioPlayer and AudioWaveform hand concrete colours to third-party
		 * canvas APIs (xterm.js, WaveSurfer) that cannot read CSS custom
		 * properties. `src/lib/color.ts` is the hex↔HSL converter, whose JSDoc
		 * examples are necessarily hex.
		 *
		 * `...BASE_SYNTAX` is repeated deliberately: this block replaces the
		 * repo-wide one for these files, so omitting it would release the
		 * component layers from the `as unknown as` ban. That is the exact
		 * defect this restructure fixes, in the other direction.
		 */
		files: [
			"packages/components/src/primitives/**/*.tsx",
			"packages/components/src/components/**/*.tsx",
			"packages/components/src/artifacts/**/*.tsx",
			"packages/components/src/blocks/**/*.tsx",
		],
		// Tests and demos use literal colours as fixtures on purpose — a
		// `colorBy` stub returning `rgb(255, 0, 0)`, an order id of `#1042`.
		// The rule is about what ships. They keep BASE_SYNTAX via the
		// repo-wide block, because `ignores` here only exempts them from this
		// block, not from the one above.
		ignores: ["**/*.test.tsx", "**/*.demo.tsx"],
		rules: {
			"no-restricted-syntax": ["error", ...BASE_SYNTAX, ...NO_COLOUR_LITERALS],
		},
	},
	{
		/*
		 * Radix is an implementation detail of the primitive and component
		 * layers. Blocks, AI surfaces, artifacts and the docs app compose
		 * what those layers export; reaching past them re-creates the
		 * unstyled, untokenised primitive the library exists to provide.
		 */
		files: ["packages/components/src/{blocks,ai,artifacts}/**/*.{ts,tsx}"],
		/*
		 * `inline-citation` renders a citation popover whose panel is sized
		 * and padded unlike the shared `HoverCardContent`, which hardcodes
		 * `w-64` and its own padding. Composing the primitive would change
		 * how it renders, so it drives `HoverCardPrimitive` directly until
		 * that primitive grows a size variant. It is the one open case;
		 * every other AI surface composes the Hex primitive.
		 */
		ignores: ["packages/components/src/ai/inline-citation/inline-citation.tsx"],
		rules: {
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: ["@radix-ui/*"],
							message:
								"Import the Hex primitive instead (e.g. `Dialog` from ../../primitives/dialog/dialog.js). Radix belongs to the primitive + component layers only — see CONTRIBUTING.md § Layer boundaries.",
						},
					],
				},
			],
		},
	},
);
