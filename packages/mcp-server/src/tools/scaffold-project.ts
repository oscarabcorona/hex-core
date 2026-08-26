import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
	generateGlobalsCss,
	getTheme,
	loadRegistryItem,
	themeToTailwindConfig,
} from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `scaffold-project` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 6: scaffold_project ───

	server.registerTool(
		TOOL.SCAFFOLD_PROJECT,
		{
			description:
				"Generate a complete file tree to set up Hex Core in a project. Returns the config file, globals.css with theme tokens, tailwind config extension, utility functions, and requested components.",
			inputSchema: z
				.object({
					components: z.array(z.string()).describe("Component names to include"),
					theme: z.string().optional().default("default").describe("Theme name"),
				})
				.strict(),
		},
		async ({ components, theme: themeName }) => {
			const theme = getTheme(themeName);
			if (!theme) {
				return {
					content: [
						{
							type: "text" as const,
							text: `Theme "${themeName}" not found.`,
						},
					],
				};
			}

			const files: Array<{ path: string; content: string }> = [];

			// 1. globals.css with theme
			files.push({
				path: "app/globals.css",
				content: generateGlobalsCss(theme),
			});

			// 2. Tailwind config extension
			const twConfig = themeToTailwindConfig(theme);
			files.push({
				path: "tailwind.config.ts (extend section)",
				content: JSON.stringify({ theme: { extend: twConfig } }, null, 2),
			});

			// 3. cn utility
			files.push({
				path: "lib/utils.ts",
				content: `import { type ClassValue, clsx } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n\treturn twMerge(clsx(inputs));\n}\n`,
			});

			// 4 + 5. Each requested component: its files and its npm deps, in one
			// pass. These were two loops over the same slug list, each calling
			// `loadRegistryItem` — the memo made it cheap but it read as two
			// independent walks, and a reader adding a third would have followed
			// the pattern.
			const allNpmDeps = new Set<string>(["clsx", "tailwind-merge"]);
			for (const compName of components) {
				const item = loadRegistryItem(compName);
				if (!item) continue;

				for (const file of item.files) {
					if (file.type === "component") {
						files.push({
							path: file.path,
							content: file.content,
						});
					}
				}

				const deps = item.dependencies as { npm?: string[] };
				if (deps.npm) {
					for (const dep of deps.npm) {
						allNpmDeps.add(dep);
					}
				}
			}

			const result = {
				files,
				npmDependencies: [...allNpmDeps].sort(),
				installCommand: `pnpm add ${[...allNpmDeps].sort().join(" ")}`,
			};

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(result, null, 2),
					},
				],
			};
		},
	);
}
