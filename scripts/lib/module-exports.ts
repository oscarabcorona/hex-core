import * as ts from "typescript";

/**
 * The public surface of a single module, split by what an `export { ... }`
 * clause needs to say about each name.
 */
export interface ModuleExports {
	/** Runtime bindings — components, `cva` variant maps, helper functions. */
	values: string[];
	/** Type-only bindings — re-exported with the inline `type` modifier. */
	types: string[];
}

/** Local declaration kinds we need to tell apart when resolving `export { X }`. */
type DeclKind = "value" | "type";

/**
 * Record every top-level declaration in a source file by name and kind.
 *
 * `export { Button, buttonVariants }` — the convention throughout
 * `packages/components` — names bindings without saying whether they are
 * values or types, so the declarations have to be indexed first and the
 * export clause resolved against them.
 * @param source - The parsed source file
 * @returns Map of declared name → whether it is a type or a runtime value
 */
function indexDeclarations(source: ts.SourceFile): Map<string, DeclKind> {
	const kinds = new Map<string, DeclKind>();

	for (const statement of source.statements) {
		if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
			kinds.set(statement.name.text, "type");
		} else if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
			if (statement.name) kinds.set(statement.name.text, "value");
		} else if (ts.isVariableStatement(statement)) {
			for (const decl of statement.declarationList.declarations) {
				if (ts.isIdentifier(decl.name)) kinds.set(decl.name.text, "value");
			}
		} else if (ts.isEnumDeclaration(statement)) {
			kinds.set(statement.name.text, "value");
		} else if (ts.isImportDeclaration(statement)) {
			// A re-exported import (`import { X } from "y"; export { X }`) still
			// needs a kind. Type-only imports are types; everything else is
			// treated as a value, which is the safe default for an export clause.
			const clause = statement.importClause;
			if (!clause) continue;
			const kind: DeclKind = clause.isTypeOnly ? "type" : "value";
			if (clause.name) kinds.set(clause.name.text, kind);
			const bindings = clause.namedBindings;
			if (bindings && ts.isNamedImports(bindings)) {
				for (const spec of bindings.elements) {
					kinds.set(spec.name.text, spec.isTypeOnly ? "type" : kind);
				}
			}
		}
	}

	return kinds;
}

/** True when a node carries the `export` modifier. */
function hasExportModifier(node: ts.Node): boolean {
	return (
		ts.canHaveModifiers(node) &&
		(ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false)
	);
}

/** True for `export default class/function …` (as opposed to `export = x`). */
function isDefaultExport(node: ts.Node): boolean {
	return (
		ts.canHaveModifiers(node) &&
		(ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword) ?? false)
	);
}

/**
 * Names tagged `@internal` in a leading JSDoc block.
 *
 * A module may need to export a helper for its own test file without that
 * helper becoming part of the published API. `@internal` is the standard
 * TypeScript convention for exactly this, and keeps the decision next to
 * the declaration rather than in an allowlist the author will never find.
 * @param source - The parsed source file
 * @returns The set of declared names marked internal
 */
function internalNames(source: ts.SourceFile): Set<string> {
	const internal = new Set<string>();

	/*
	 * A file-level header comment is bound by the parser to whatever
	 * declaration follows it, so a header that merely mentions `@internal`
	 * in prose would silently drop the module's first export — the exact
	 * kind of invisible drift this generator exists to prevent.
	 *
	 * A header starts the file, so a JSDoc block at offset 0 is treated as
	 * documenting the module rather than the declaration under it. Put an
	 * `@internal` tag in the declaration's own JSDoc.
	 */
	const isInternal = (node: ts.Node): boolean =>
		ts
			.getJSDocTags(node)
			.some((tag) => tag.tagName.text === "internal" && tag.parent.pos > 0);

	for (const statement of source.statements) {
		if (!isInternal(statement)) continue;
		if (
			ts.isInterfaceDeclaration(statement) ||
			ts.isTypeAliasDeclaration(statement) ||
			ts.isEnumDeclaration(statement) ||
			ts.isFunctionDeclaration(statement) ||
			ts.isClassDeclaration(statement)
		) {
			if (statement.name) internal.add(statement.name.text);
		} else if (ts.isVariableStatement(statement)) {
			for (const decl of statement.declarationList.declarations) {
				if (ts.isIdentifier(decl.name)) internal.add(decl.name.text);
			}
		}
	}

	return internal;
}

/**
 * Read a module's exported names without type-checking it.
 *
 * Uses a standalone parse rather than a full `ts.Program` — the barrels
 * only need names and value/type-ness, and building a program over ~290
 * component files on every build would cost seconds for no extra signal.
 *
 * Names come back sorted so the emitted barrel is byte-stable across
 * machines; CI diffs the generated files.
 * @param filePath - Absolute path to a `.ts` / `.tsx` module
 * @returns The module's exported value and type names, each sorted
 * @example
 * readModuleExports("…/primitives/button/button.tsx")
 * // → { values: ["Button", "buttonVariants"], types: ["ButtonProps"] }
 */
export function readModuleExports(filePath: string): ModuleExports {
	const source = ts.createSourceFile(
		filePath,
		ts.sys.readFile(filePath) ?? "",
		ts.ScriptTarget.Latest,
		// `getJSDocTags` walks parent pointers to find bound JSDoc.
		/* setParentNodes */ true,
		filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);

	const declKinds = indexDeclarations(source);
	const internal = internalNames(source);
	const values = new Set<string>();
	const types = new Set<string>();

	const add = (name: string, kind: DeclKind): void => {
		if (internal.has(name)) return;
		(kind === "type" ? types : values).add(name);
	};

	for (const statement of source.statements) {
		// `export default …` — a barrel re-exports by NAME, and this reader
		// used to record `export default function Thing()` as a named export
		// `Thing`, which generated `export { Thing } from "./x.js"` against a
		// module that has no such binding. A silently-wrong barrel is worse
		// than a missing one, so this is fatal rather than skipped.
		if (ts.isExportAssignment(statement) || isDefaultExport(statement)) {
			throw new Error(
				`${filePath}: \`export default\` is not supported in a generated barrel — ` +
					`a barrel re-exports by name. Use a named export.`,
			);
		}

		// `export { A, B, type C }` / `export { A } from "./x.js"`
		if (ts.isExportDeclaration(statement)) {
			const bindings = statement.exportClause;
			// `export * from "./x.js"` (no clause) and `export * as ns from
			// "./x.js"` (a namespace clause) both used to fall through this
			// `continue` and vanish from the barrel with no diagnostic — the
			// exact invisible-drift failure the generator exists to prevent.
			// Resolving them means reading the target module too; until
			// something needs that, refuse loudly.
			if (!bindings) {
				throw new Error(
					`${filePath}: \`export * from …\` is not supported — the barrel ` +
						`generator cannot see through it. List the names explicitly.`,
				);
			}
			if (!ts.isNamedExports(bindings)) {
				throw new Error(
					`${filePath}: \`export * as ns from …\` is not supported — ` +
						`the barrel generator re-exports names, not namespaces.`,
				);
			}
			for (const spec of bindings.elements) {
				const name = spec.name.text;
				const local = (spec.propertyName ?? spec.name).text;
				const explicitType = statement.isTypeOnly || spec.isTypeOnly;
				add(name, explicitType ? "type" : (declKinds.get(local) ?? "value"));
			}
			continue;
		}

		if (!hasExportModifier(statement)) continue;

		if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
			add(statement.name.text, "type");
		} else if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
			if (statement.name) add(statement.name.text, "value");
		} else if (ts.isEnumDeclaration(statement)) {
			add(statement.name.text, "value");
		} else if (ts.isVariableStatement(statement)) {
			for (const decl of statement.declarationList.declarations) {
				if (ts.isIdentifier(decl.name)) add(decl.name.text, "value");
			}
		}
	}

	return {
		values: [...values].sort(),
		types: [...types].sort(),
	};
}
