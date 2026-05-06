import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectFramework } from "../src/lib/detect-framework.js";
import { detectShadcn } from "../src/lib/detect-shadcn.js";

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-detect-shadcn-"));
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writePkg(deps: Record<string, string>) {
	fs.writeFileSync(
		path.join(tmpDir, "package.json"),
		JSON.stringify({ name: "scratch", dependencies: deps }, null, 2),
	);
}

function writeFile(rel: string, content = "") {
	const abs = path.join(tmpDir, rel);
	fs.mkdirSync(path.dirname(abs), { recursive: true });
	fs.writeFileSync(abs, content);
}

describe("detectShadcn", () => {
	it("detects shadcn via components.json alone", () => {
		writePkg({ next: "^16.0.0" });
		writeFile("src/app/page.tsx", "");
		writeFile("components.json", JSON.stringify({ aliases: { components: "@/components", utils: "@/lib/utils" } }));
		const fw = detectFramework(tmpDir);
		const result = detectShadcn(tmpDir, fw);
		expect(result.isShadcn).toBe(true);
		expect(result.componentsJsonPath).toBeTruthy();
	});

	it("detects shadcn via UI dir + radix peers (no components.json)", () => {
		writePkg({ next: "^16.0.0", "@radix-ui/react-slot": "^1.0.0" });
		writeFile("src/app/page.tsx", "");
		writeFile("src/components/ui/button.tsx", "// shadcn button");
		const fw = detectFramework(tmpDir);
		const result = detectShadcn(tmpDir, fw);
		expect(result.isShadcn).toBe(true);
		expect(result.signals.matchedSlugs).toContain("button");
	});

	it("does NOT detect shadcn when ui dir exists but no @radix-ui peer is declared", () => {
		writePkg({ next: "^16.0.0" });
		writeFile("src/app/page.tsx", "");
		writeFile("src/components/ui/button.tsx", "// some button");
		const fw = detectFramework(tmpDir);
		const result = detectShadcn(tmpDir, fw);
		expect(result.isShadcn).toBe(false);
	});

	it("does NOT detect shadcn when only non-shadcn slugs live in ui/", () => {
		writePkg({ next: "^16.0.0", "@radix-ui/react-slot": "^1.0.0" });
		writeFile("src/app/page.tsx", "");
		writeFile("src/components/ui/my-custom-thing.tsx", "");
		const fw = detectFramework(tmpDir);
		const result = detectShadcn(tmpDir, fw);
		expect(result.isShadcn).toBe(false);
	});

	it("classifies toast as a rename and carousel as no-mapping", () => {
		writePkg({ next: "^16.0.0", "@radix-ui/react-slot": "^1.0.0" });
		writeFile("src/app/page.tsx", "");
		writeFile("components.json", "{}");
		writeFile("src/components/ui/button.tsx", "");
		writeFile("src/components/ui/toast.tsx", "");
		writeFile("src/components/ui/carousel.tsx", "");
		const fw = detectFramework(tmpDir);
		const result = detectShadcn(tmpDir, fw);
		const slugs = Object.fromEntries(result.uiFiles.map((f) => [f.shadcnSlug, f]));
		expect(slugs.button.status).toBe("match");
		expect(slugs.toast.status).toBe("rename");
		expect(slugs.toast.hexSlug).toBe("sonner");
		expect(slugs.carousel.status).toBe("no-mapping");
		expect(slugs.carousel.hexSlug).toBe(null);
	});

	it("flags hexConfigPresent when hex.config.json already exists", () => {
		writePkg({ next: "^16.0.0", "@radix-ui/react-slot": "^1.0.0" });
		writeFile("src/app/page.tsx", "");
		writeFile("components.json", "{}");
		writeFile("hex.config.json", "{}");
		const fw = detectFramework(tmpDir);
		const result = detectShadcn(tmpDir, fw);
		expect(result.conflicts.hasHexConfig).toBe(true);
	});

	it("ignores nested directories — only scans top-level *.tsx in ui/", () => {
		writePkg({ next: "^16.0.0", "@radix-ui/react-slot": "^1.0.0" });
		writeFile("src/app/page.tsx", "");
		writeFile("components.json", "{}");
		writeFile("src/components/ui/button.tsx", "");
		writeFile("src/components/ui/blocks/feature-card.tsx", "");
		const fw = detectFramework(tmpDir);
		const result = detectShadcn(tmpDir, fw);
		const slugs = result.uiFiles.map((f) => f.shadcnSlug);
		expect(slugs).toContain("button");
		expect(slugs).not.toContain("feature-card");
	});

	it("works for the no-src layout (Next.js without --src-dir)", () => {
		writePkg({ next: "^16.0.0", "@radix-ui/react-dialog": "^1.0.0" });
		writeFile("app/page.tsx", "");
		writeFile("components.json", "{}");
		writeFile("components/ui/dialog.tsx", "");
		const fw = detectFramework(tmpDir);
		expect(fw.srcDir).toBe(false);
		const result = detectShadcn(tmpDir, fw);
		expect(result.isShadcn).toBe(true);
		expect(result.signals.uiDir?.endsWith("components/ui")).toBe(true);
	});
});
