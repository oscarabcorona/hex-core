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

	it("rewrites cross-tree components/<name>/<name> imports (used by blocks)", () => {
		// A block at packages/components/src/blocks/<slug>/<slug>.tsx reaches up
		// twice to import a molecule. The legacy regex only matched primitives/
		// at that depth — blocks need the components/ arm too.
		const src = `import { Alert } from "../../components/alert/alert.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import { Alert } from "@/components/ui/alert";\n`);
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

	it("rewrites sibling-file variants imports (button.tsx → ./button-variants)", () => {
		const src = `import { type ButtonVariantsProps, buttonVariants } from "./button-variants.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(
			`import { type ButtonVariantsProps, buttonVariants } from "@/components/ui/button-variants";\n`,
		);
	});

	it("rewrites cross-package variants imports (pagination → button-variants)", () => {
		const src = `import { buttonVariants } from "../../primitives/button/button-variants.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import { buttonVariants } from "@/components/ui/button-variants";\n`);
	});

	it("rewrites multi-line cross-package variants imports", () => {
		const src =
			`import {\n` +
			`\ttype ButtonVariantsProps,\n` +
			`\tbuttonVariants,\n` +
			`} from "../../primitives/button/button-variants.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(
			`import {\n` +
				`\ttype ButtonVariantsProps,\n` +
				`\tbuttonVariants,\n` +
				`} from "@/components/ui/button-variants";\n`,
		);
	});

	it("does not collide variants rules with the existing _shared rule", () => {
		// `_shared/layout-variants` must still go to components/_shared/, not
		// components/ui/ — rule 4a's directory capture excludes leading underscores.
		const src = `import { gapVariants } from "../_shared/layout-variants.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import { gapVariants } from "@/components/_shared/layout-variants";\n`);
	});

	it("variants rewrites honor a custom alias config", () => {
		const src = `import { buttonVariants } from "./button-variants.js";\n`;
		const out = rewriteRegistryImports(src, { components: "~/ui", lib: "~/utils" });
		expect(out).toBe(`import { buttonVariants } from "~/ui/ui/button-variants";\n`);
	});

	it("does not match specifiers that only resemble -variants", () => {
		// `./button-variants-extra` and `./button-variants.test` look superficially
		// like the rewrite target but must NOT match — the closing-quote anchor
		// guarantees only paths ending exactly in `-variants[.js]` get rewritten.
		const src =
			`import a from "./button-variants-extra.js";\n` +
			`import b from "./button-variants.test.js";\n`;
		const out = rewriteRegistryImports(src);
		// The .js still gets stripped by rule 5; that's fine.
		expect(out).toBe(
			`import a from "./button-variants-extra";\n` +
				`import b from "./button-variants.test";\n`,
		);
	});

	it("does not match capital-letter slugs (variants rules are lowercase only)", () => {
		// `[a-z]` excludes capitals so renamed/wrong-cased dirs don't sneak through.
		const src = `import x from "../primitives/Button/Button-variants.js";\n`;
		const out = rewriteRegistryImports(src);
		expect(out).toBe(`import x from "../primitives/Button/Button-variants";\n`);
	});

	it("rewrite is idempotent (running it twice produces the same result)", () => {
		const src =
			`import { cn } from "../../lib/utils.js";\n` +
			`import { buttonVariants } from "./button-variants.js";\n` +
			`import { Button } from "../../primitives/button/button.js";\n` +
			`import { gapVariants } from "../_shared/layout-variants.js";\n`;
		const once = rewriteRegistryImports(src);
		const twice = rewriteRegistryImports(once);
		expect(twice).toBe(once);
	});

	it("default aliases match what hex init writes (no hooks — unused)", () => {
		expect(DEFAULT_ALIASES).toEqual({
			components: "@/components",
			lib: "@/lib",
		});
	});
});
