import { definePackageTests } from "../../vitest.base.js";

export default definePackageTests({
	environment: "jsdom",
	tsx: true,
	setupFiles: ["./vitest.setup.ts"],
});
