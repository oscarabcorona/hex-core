/**
 * Theme browser — the MCP App bundled into `dist/apps/theme-browser.html`
 * and served as the `ui://hex-core/theme-browser.html` resource. Hosts that
 * support MCP Apps (SEP-1865) render it when `list_themes` is called.
 *
 * Data flow is deliberately lazy so the tool's text output (what the model
 * pays for) never changes: the view re-calls `list_themes` for the card
 * grid, and fetches one theme's palette via `get_theme {format:"json"}`
 * only when a card is selected. "Use this theme" hands the choice back to
 * the conversation as a user message.
 */
import { App } from "@modelcontextprotocol/ext-apps";

/** The `list_themes` wire row (subset the view renders). */
interface ThemeSummary {
	name: string;
	displayName?: string;
	description?: string;
	category?: string;
	tags?: string[];
}

const app = new App({ name: "hex-core-theme-browser", version: "0.1.0" });

/**
 * Pull the first text payload out of a tool result.
 * @param result - A CallToolResult-shaped object
 * @returns The text, or null when the result carries none
 */
function firstText(result: { content?: unknown }): string | null {
	if (!Array.isArray(result.content)) return null;
	const blocks: unknown[] = result.content;
	for (const block of blocks) {
		if (
			typeof block === "object" &&
			block !== null &&
			"type" in block &&
			block.type === "text" &&
			"text" in block &&
			typeof block.text === "string"
		) {
			return block.text;
		}
	}
	return null;
}

/**
 * Parse the `list_themes` JSON into theme summaries.
 * @param text - The tool's text payload
 * @returns Valid rows (entries without a string `name` are dropped)
 */
function parseThemes(text: string): ThemeSummary[] {
	try {
		const raw: unknown = JSON.parse(text);
		if (!Array.isArray(raw)) return [];
		const rows: unknown[] = raw;
		return rows.filter((entry): entry is ThemeSummary => {
			if (typeof entry !== "object" || entry === null) return false;
			return "name" in entry && typeof entry.name === "string";
		});
	} catch {
		return [];
	}
}

/**
 * Turn a flat token value into a renderable CSS color, or null when the
 * token isn't color-shaped (radius, duration, font …).
 * @param value - A `themeToFlatJson` value, e.g. `"222 25% 18%"` or `"hsl(…)"`
 * @returns A CSS color string, or null
 */
function asCssColor(value: string): string | null {
	const trimmed = value.trim();
	if (trimmed.startsWith("#") || trimmed.startsWith("hsl(") || trimmed.startsWith("oklch(")) {
		return trimmed;
	}
	if (/^-?\d+(\.\d+)?(deg)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(trimmed)) {
		return `hsl(${trimmed})`;
	}
	return null;
}

/**
 * Look up a required element by id; throws when the template drifted.
 * @param id - The element id
 * @returns The element
 */
function el(id: string): HTMLElement {
	const found = document.getElementById(id);
	if (!found) throw new Error(`template is missing #${id}`);
	return found;
}

let themes: ThemeSummary[] = [];
let selected: string | null = null;

/**
 * Render one mode's swatch grid from a flat token map.
 * @param container - The `.swatches` element to fill
 * @param tokens - The flat `--name: value` map
 */
function renderSwatches(container: HTMLElement, tokens: Record<string, string>): void {
	container.replaceChildren();
	for (const [name, value] of Object.entries(tokens)) {
		const color = asCssColor(value);
		if (!color) continue;
		const swatch = document.createElement("div");
		swatch.className = "swatch";
		const chip = document.createElement("div");
		chip.className = "chip";
		chip.style.background = color;
		const label = document.createElement("span");
		label.className = "label";
		label.textContent = name.replace(/^--/, "");
		label.title = `${name}: ${value}`;
		swatch.append(chip, label);
		container.appendChild(swatch);
	}
}

/**
 * Fetch one theme's light + dark palettes and show the detail pane. Clears
 * the previous palette immediately (never show theme A's swatches under
 * theme B's name), surfaces fetch failures in `#status`, and drops stale
 * responses when the user has already clicked another card.
 * @param theme - The selected theme summary
 */
async function showDetail(theme: ThemeSummary): Promise<void> {
	selected = theme.name;
	el("detail").hidden = false;
	el("detail-name").textContent = theme.displayName ?? theme.name;
	el("detail-desc").textContent = theme.description ?? "";
	el("status").textContent = "";
	el("swatches-light").replaceChildren();
	el("swatches-dark").replaceChildren();
	for (const card of document.querySelectorAll(".card")) {
		card.classList.toggle("selected", card.getAttribute("data-theme") === theme.name);
	}
	try {
		for (const mode of ["light", "dark"] as const) {
			const result = await app.callServerTool({
				name: "get_theme",
				arguments: { name: theme.name, format: "json", mode },
			});
			if (selected !== theme.name) return; // a later click won this pane
			const text = firstText(result);
			if (!text) continue;
			try {
				const parsed: unknown = JSON.parse(text);
				if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
					const tokens: Record<string, string> = {};
					for (const [key, value] of Object.entries(parsed)) {
						if (typeof value === "string") tokens[key] = value;
					}
					renderSwatches(el(`swatches-${mode}`), tokens);
				}
			} catch {
				// non-JSON payload (e.g. "Theme not found") — leave the grid empty
			}
		}
	} catch (error: unknown) {
		if (selected !== theme.name) return;
		el("status").textContent =
			`Failed to load palette: ${error instanceof Error ? error.message : String(error)}`;
	}
}

/**
 * Render the card grid, filtered by the search box.
 * @param filter - Lowercased filter text ("" shows everything)
 */
function renderCards(filter: string): void {
	const cards = el("cards");
	cards.replaceChildren();
	const visible = themes.filter((theme) => {
		if (filter === "") return true;
		const haystack = [theme.name, theme.displayName, theme.category, ...(theme.tags ?? [])]
			.filter((part): part is string => typeof part === "string")
			.join(" ")
			.toLowerCase();
		return haystack.includes(filter);
	});
	if (visible.length === 0) {
		const empty = document.createElement("li");
		empty.className = "empty";
		empty.textContent = "No themes match.";
		cards.appendChild(empty);
		return;
	}
	for (const theme of visible) {
		const li = document.createElement("li");
		const button = document.createElement("button");
		button.className = "card";
		button.type = "button";
		button.setAttribute("data-theme", theme.name);
		const name = document.createElement("span");
		name.className = "name";
		name.textContent = theme.displayName ?? theme.name;
		const category = document.createElement("span");
		category.className = "category";
		category.textContent = theme.category ?? "";
		const desc = document.createElement("span");
		desc.className = "desc";
		desc.textContent = theme.description ?? "";
		button.append(name, category, desc);
		button.addEventListener("click", () => {
			void showDetail(theme);
		});
		li.appendChild(button);
		cards.appendChild(li);
	}
}

/** Connect to the host, load the theme list, and wire up the UI. */
async function init(): Promise<void> {
	await app.connect();
	const result = await app.callServerTool({ name: "list_themes", arguments: {} });
	const text = firstText(result);
	themes = text ? parseThemes(text) : [];
	renderCards("");

	const filter = el("filter");
	filter.addEventListener("input", () => {
		renderCards(filter instanceof HTMLInputElement ? filter.value.trim().toLowerCase() : "");
	});

	el("use-theme").addEventListener("click", () => {
		if (!selected) return;
		const message = `Use the "${selected}" Hex theme: fetch it with get_theme (name "${selected}", format "css") and write it into globals.css, or run \`hex theme apply ${selected}\`.`;
		void app
			.sendMessage({ role: "user", content: [{ type: "text", text: message }] })
			.then(() => {
				el("status").textContent = `Asked the assistant to apply "${selected}".`;
			})
			.catch(() => {
				el("status").textContent = `Run: hex theme apply ${selected}`;
			});
	});
}

void init().catch((error: unknown) => {
	const cards = document.getElementById("cards");
	if (cards) {
		const failure = document.createElement("li");
		failure.className = "empty";
		failure.textContent = `Failed to load themes: ${error instanceof Error ? error.message : String(error)}`;
		cards.replaceChildren(failure);
	}
});
