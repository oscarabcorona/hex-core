/**
 * Locale-independent string comparator for deterministic sorts.
 * `Array.prototype.sort` with argument-less `localeCompare` follows the
 * host ICU locale (hyphen/punctuation collation varies by `LANG`), which
 * would let two machines emit differently-ordered "deterministic"
 * artifacts. Code-unit comparison is stable everywhere.
 * @param a - Left string
 * @param b - Right string
 * @returns Negative, zero, or positive per the usual comparator contract
 */
export function compareStrings(a: string, b: string): number {
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
}
