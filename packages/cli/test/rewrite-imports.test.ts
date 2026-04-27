import { describe, expect, it } from "vitest";
import { DEFAULT_ALIASES, rewriteRegistryImports } from "../src/lib/rewrite-imports.js";

describe("rewriteRegistryImports", () => {
	it("rewrites lib/utils to the alias and drops the .js", () => {
		const src = `import { cn } from "../../lib/utils.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import { cn } from "@/lib/utils";\n`);
	});

	it("rewrites sibling-directory component imports to components/ui/<name>", () => {
		const src = `import { Command } from "../command/command.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import { Command } from "@/components/ui/command";\n`);
	});

	it("rewrites legacy primitives/<name>/<name> imports the same way", () => {
		const src = `import { Button } from "../../primitives/button/button.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import { Button } from "@/components/ui/button";\n`);
	});

	it("rewrites _shared internal modules", () => {
		const src = `import { gapVariants } from "../_shared/layout-variants.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import { gapVariants } from "@/components/_shared/layout-variants";\n`);
	});

	it("strips .js from remaining relative imports", () => {
		const src = `import x from "./helper.js";\nimport y from "../sibling.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import x from "./helper";\nimport y from "../sibling";\n`);
	});

	it("strips .js from re-export specifiers", () => {
		const src = `export { foo } from "./bar.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`export { foo } from "./bar";\n`);
	});

	it("leaves bare specifiers untouched", () => {
		const src =
			`import * as React from "react";\n` +
			`import { Slot } from "@radix-ui/react-slot";\n` +
			`import { cn } from "../../lib/utils.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(
			`import * as React from "react";\n` +
				`import { Slot } from "@radix-ui/react-slot";\n` +
				`import { cn } from "@/lib/utils";\n`,
		);
	});

	it("honors a custom alias config", () => {
		const src =
			`import { cn } from "../../lib/utils.js";\n` +
			`import { Command } from "../command/command.js";\n`;
		const out = rewriteRegistryImports(src, {
			components: "~/ui",
			lib: "~/utils",
			hooks: "~/hooks",
		});
		expect(out).toBe(
			`import { cn } from "~/utils/utils";\n` +
				`import { Command } from "~/ui/ui/command";\n`,
		);
	});

	it("handles multi-line and grouped imports", () => {
		const src = `import {\n\tCommand,\n\tCommandList,\n} from "../command/command.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import {\n\tCommand,\n\tCommandList,\n} from "@/components/ui/command";\n`);
	});

	it("preserves type-only imports", () => {
		const src = `import type { ButtonProps } from "../button/button.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import type { ButtonProps } from "@/components/ui/button";\n`);
	});

	it("does not rewrite mismatched directory/file pairs", () => {
		// "../command/popover.js" should NOT match the sibling-dir rule
		// (directory and file slug differ). We still drop the .js though.
		const src = `import { x } from "../command/popover.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import { x } from "../command/popover";\n`);
	});

	it("default aliases match what hex init writes", () => {
		expect(DEFAULT_ALIASES).toEqual({
			components: "@/components",
			lib: "@/lib",
			hooks: "@/hooks",
		});
	});
});
