import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	jsdoc.configs["flat/recommended-typescript-flavor"],
	prettier,
	{
		ignores: ["**/dist/**", "**/node_modules/**", "**/.tsup/**", "registry/**", "apps/**"],
	},
	{
		rules: {
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
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
		files: ["packages/cli/**/*.ts", "scripts/**/*.ts", "packages/*/scripts/**/*.{js,mjs}"],
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
);
