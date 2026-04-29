/**
 * Shared classifier used by `audit-use-client.mjs` (build-time census +
 * doc input) and `inject-use-client.mjs` (postbuild directive injection).
 *
 * Single source of truth for "what counts as client-only?" so the two
 * scripts can't drift apart. A previous review caught Stepper + TimePicker
 * being misclassified as RSC-safe because the JSX-handler pattern lived in
 * only one of the two scripts — extracting the patterns + walker into this
 * module prevents that class of bug.
 *
 * False-positive direction (intentional): a pure-server helper named
 * `useTokens()` would trip the `\buse[A-Z]\w*\s*\(` pattern and be marked
 * client. We accept that — false-positive client is a perf miss; false-
 * negative client (this review's P1) is a runtime crash. Tighten the
 * pattern only if a real false positive shows up.
 */

import * as fs from "node:fs";
import * as path from "node:path";

export const CLIENT_PATTERNS = [
	// Library imports that always force client
	/from ['"]@radix-ui\//,
	/from ['"]react-hook-form['"]/,
	/from ['"]@hookform\//,
	/from ['"]cmdk['"]/,
	/from ['"]vaul['"]/,
	/from ['"]sonner['"]/,
	/from ['"]react-day-picker['"]/,
	/from ['"]input-otp['"]/,
	/from ['"]react-resizable-panels['"]/,
	/from ['"]next-themes['"]/,
	/from ['"]next\//,
	/from ['"]streamdown['"]/,
	// React hook calls — `useX(` covers useState/useEffect/useRef/useReducer/
	// useContext/useId/useMemo/useCallback/useLayoutEffect/useTransition/
	// useDeferredValue/useSyncExternalStore/useFormStatus and any custom
	// hook a component reaches for. False-positive direction documented above.
	/\buse[A-Z]\w*\s*\(/,
	// Inline JSX event handlers — `onClick={…}`, `onChange={(e) => …}`,
	// `onFocus={fn}`, etc. React 19 + Next.js RSC bans serializing function
	// props from Server Components, so any file passing a handler INTO a
	// JSX element must be client-only.
	//
	// Known false-positive matches (acceptable — flips a file to client
	// when it could have stayed server, never the other way):
	//   - destructured-default props: `function F({ onClick = () => {} })`
	//   - non-JSX assignments: `const onChange = (e) => {}` outside markup
	// Tightening to `<…\bon[A-Z]…={` would require multiline JSX awareness
	// the regex doesn't have. Accept the false positive — the cost is one
	// extra "use client" directive per misidentified file, vs the
	// false-negative cost which is a runtime crash.
	/\bon[A-Z]\w*\s*=\s*[{(]/,
];

/**
 * Walk a directory recursively, returning all `.tsx` files (excluding
 * `.test.tsx`).
 * @param {string} dir
 * @returns {string[]}
 */
export function walkTsx(dir) {
	const out = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...walkTsx(full));
		else if (
			entry.isFile() &&
			entry.name.endsWith(".tsx") &&
			!entry.name.endsWith(".test.tsx")
		) {
			out.push(full);
		}
	}
	return out;
}

/**
 * @param {string} sourceContent - Source file contents
 * @returns {boolean} true if any client pattern matches
 */
export function isClientSource(sourceContent) {
	return CLIENT_PATTERNS.some((p) => p.test(sourceContent));
}

/**
 * @param {string} fileContent - File content
 * @returns {boolean} true if the first 3 lines contain `"use client"`
 */
export function hasUseClientDirective(fileContent) {
	return /^\s*("use client"|'use client')\s*;?/m.test(
		fileContent.split("\n").slice(0, 3).join("\n"),
	);
}

/**
 * Classify every `.tsx` source under `srcDir`. Returned shape mirrors what
 * `audit-use-client.mjs` emits for downstream consumers (CI report, the
 * inject script, the bundle test).
 * @param {string} srcDir
 * @returns {Record<string, "client" | "server">}
 */
export function classifySources(srcDir) {
	const result = {};
	for (const file of walkTsx(srcDir)) {
		const rel = path.relative(srcDir, file);
		const content = fs.readFileSync(file, "utf8");
		result[rel] = isClientSource(content) ? "client" : "server";
	}
	return result;
}
