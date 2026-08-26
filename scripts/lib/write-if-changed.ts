import * as fs from "node:fs";
import * as path from "node:path";

/** True for a Node filesystem error carrying an `errno` code. */
function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
	return err instanceof Error && "code" in err;
}

/**
 * Read a file, or return null when it does not exist.
 *
 * Attempts the read and handles `ENOENT` rather than calling `existsSync`
 * first: a check-then-read leaves a window in which the file can be
 * created or removed, and the check buys nothing the read does not
 * already tell us.
 * @param filePath - Absolute path to read
 * @returns The file contents, or null if it is absent
 */
export function readIfExists(filePath: string): string | null {
	try {
		return fs.readFileSync(filePath, "utf-8");
	} catch (err) {
		if (isErrnoException(err) && err.code === "ENOENT") return null;
		throw err;
	}
}

/**
 * Write a generated file only when its contents actually change.
 *
 * Keeps mtimes stable so Turbopack and `tsup --watch` don't rebuild on a
 * no-op regeneration, and keeps `git status` quiet when a generator is
 * re-run with no input changes.
 * @param filePath - Absolute destination path
 * @param content - The full file contents
 * @returns True when the file was written
 */
export function writeIfChanged(filePath: string, content: string): boolean {
	if (readIfExists(filePath) === content) return false;
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, content);
	return true;
}
