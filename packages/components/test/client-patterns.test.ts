import { describe, expect, it } from "vitest";
import { isClientSource } from "../scripts/_client-patterns.mjs";

/**
 * Direct unit coverage for the patterns in `scripts/_client-patterns.mjs`.
 * Complements `bundle.test.ts` (which only sees the patterns through the
 * end-to-end classifier across the live source tree) by exercising each
 * signal in isolation, so a future tightening of the heuristic doesn't
 * silently break a category.
 */

describe("isClientSource — explicit directive", () => {
	it("flags a file whose first line is a bare `\"use client\"` directive", () => {
		const src = '"use client";\n\nexport function Foo() { return null; }';
		expect(isClientSource(src)).toBe(true);
	});

	it("flags single-quote variant `'use client';`", () => {
		const src = "'use client';\n\nexport function Foo() { return null; }";
		expect(isClientSource(src)).toBe(true);
	});

	it("flags a directive on a non-zero line when surrounding lines are blank", () => {
		const src = '\n\n"use client";\nexport function Foo() { return null; }';
		expect(isClientSource(src)).toBe(true);
	});

	it("does NOT flag a `// \"use client\"` comment alone", () => {
		const src = '// "use client" reminder for future\nexport function Foo() { return null; }';
		expect(isClientSource(src)).toBe(false);
	});

	it("does NOT flag a JSDoc `* \"use client\"` mention alone", () => {
		const src = '/**\n * Pairs with "use client" in the parent.\n */\nexport function Foo() { return null; }';
		expect(isClientSource(src)).toBe(false);
	});
});

describe("isClientSource — library imports", () => {
	it("flags `from \"@radix-ui/…\"` imports", () => {
		expect(isClientSource('import * as X from "@radix-ui/react-dialog";')).toBe(true);
	});

	it("flags `from \"react-hook-form\"`", () => {
		expect(isClientSource('import { useForm } from "react-hook-form";')).toBe(true);
	});

	it("flags `from \"next/…\"`", () => {
		expect(isClientSource('import Link from "next/link";')).toBe(true);
	});

	it("does NOT flag `from \"react\"` alone (server-safe React entry)", () => {
		expect(isClientSource('import * as React from "react";\nexport function Foo() { return null; }')).toBe(false);
	});
});

describe("isClientSource — hook calls and JSX handlers", () => {
	it("flags `useState(` hook call", () => {
		const src = 'import * as React from "react";\nexport function Foo() { const [x] = React.useState(0); return null; }';
		expect(isClientSource(src)).toBe(true);
	});

	it("flags an inline JSX `onClick={…}` handler", () => {
		const src = 'export function Foo() { return <button onClick={() => {}}>x</button>; }';
		expect(isClientSource(src)).toBe(true);
	});

	it("does NOT flag a pure-server component with no signals", () => {
		const src = 'export function Foo({ label }: { label: string }) { return <span>{label}</span>; }';
		expect(isClientSource(src)).toBe(false);
	});
});
