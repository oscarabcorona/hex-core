# @hex-core/components

## 1.3.0

### Minor Changes

- 062bec3: Adds `ColorPicker` — an HSL-native color editor that round-trips losslessly through the `@hex-core/tokens` HSL triplet format (`"<H> <S>% <L>%"`).

  The picker edits an HSL triplet directly via three labeled sliders (Hue / Saturation / Lightness). A hex input sits beside them as a display adapter — sliders are the source of truth, so the value never loses precision when round-tripping triplet → hex → triplet during slider drags. Invalid hex input is held in a local buffer and not committed until it parses cleanly. The buffer also resists clobbering while the input is focused, so users can type intermediate states without parent re-renders snapping the caret.

  Each `<ColorPicker>` instance generates a stable internal `id` via `React.useId()`, so multiple pickers can render on the same page (e.g. one per token in a theme editor) without label-collision.

  API:

  ```tsx
  const [color, setColor] = React.useState("240 5.9% 10%");
  <ColorPicker value={color} onChange={setColor} aria-label="Primary color" />;
  ```

  Composition: `Popover` (trigger + body) + three `Slider` rows + an `Input` for hex + a swatch preview. Per-axis `aria-label`s (Hue / Saturation / Lightness) on the sliders; the trigger requires an explicit `aria-label` describing the role of the color being edited.

  Also exports the underlying color utilities — `parseHslTriplet`, `formatHslTriplet`, `hslToRgb`, `rgbToHsl`, `hslTripletToHex`, `hexToHslTriplet` plus `HslTriplet` and `RgbColor` types — under `@hex-core/components`. These are pure, testable functions for any consumer that needs to bridge between hex and triplet formats outside the picker UI.

  Registry rebuilt: 52 → 53 component items.

- 6eca0c1: feat(components): forward `captionLayout`, `startMonth`, `endMonth` on `DatePicker` for year-dropdown navigation

  The DatePicker trigger previously gave consumers no way to opt into the native year `<select>` that `react-day-picker` v9 supports. For birth-date and other far-out-year inputs that meant chevron-clicking through dozens of months — long enough that the [shadcn issue](https://github.com/shadcn-ui/ui/issues) about it (P-032) has stayed open as a top request.

  This change adds three pass-through props that map directly onto the underlying `Calendar` (which already forwards them to `react-day-picker`):

  ```tsx
  <DatePicker
  	value={dob}
  	onChange={setDob}
  	placeholder="Date of birth"
  	captionLayout="dropdown"
  	startMonth={new Date(1925, 0)}
  	endMonth={new Date(new Date().getFullYear(), 11)}
  	aria-label="Date of birth"
  />
  ```

  `captionLayout` accepts `"label"` (default — chevron buttons only), `"dropdown"`, `"dropdown-months"`, or `"dropdown-years"`. The schema's `commonMistakes` and a new `Birth-date picker with year dropdown` example call out that `captionLayout="dropdown"` should always be paired with explicit `startMonth`/`endMonth` — RDP's default ±100-year window produces an unwieldy 200-option dropdown.

  A new `date-picker.test.tsx` covers four cases: default has no native `<select>`, `dropdown` mode mounts year + month selects, changing the year select updates the visible grid, and date selection still fires `onChange` after using the dropdown.

  Theme D pain-point P-032 closed.

- 6eca0c1: feat(components): add `Dropzone` — drag-and-drop file input with full keyboard a11y

  `Dropzone` is the upload primitive that's been a top-5 [shadcn feature request](https://github.com/shadcn-ui/ui/issues) for years (pain-point P-033). Built on the **native HTML5 drag-drop API** plus a visually-hidden `<input type="file">` so it ships with **zero new dependencies** — no `react-dropzone`, no custom polyfills.

  The visible body is a `role="button"` div with `tabIndex=0` and the required `aria-label`. Click, Enter, or Space opens the file dialog through the hidden input — every interaction path is covered for sighted, keyboard, and screen-reader users alike. The hidden input is the focusable element so assistive-tech file pickers work.

  ```tsx
  <Dropzone
  	accept="image/*"
  	maxSize={5 * 1024 * 1024}
  	onFilesSelected={(picked) => setFiles((f) => [...f, ...picked])}
  	aria-label="Upload images"
  />
  ```

  Filtering happens before `onFilesSelected` fires:
  - `accept` — supports MIME types (`"image/png"`), wildcards (`"image/*"`), and extensions (`".csv"`)
  - `maxSize` — files over the byte cap are dropped silently
  - `maxFiles` — total cap (after filtering); excess are sliced off
  - `multiple` — defaults to `true`; set `false` for single-file UX

  Drag state is exposed via `data-drag-over` (CSS-only state styling) **and** through a render-prop API:

  ```tsx
  <Dropzone aria-label="Upload">
  	{({ isDragOver }) => <span>{isDragOver ? "Release" : "Drop a file"}</span>}
  </Dropzone>
  ```

  The hidden input's `value` is reset after every emit so picking the same file twice still fires `onFilesSelected`. Dragenter/dragleave use a counter to handle nested children correctly (the typical "flicker on hover over icons" bug).

  Eight tests cover the role/tabindex/aria-label wiring, Enter + Space keyboard activation, drop event emission, `accept` filtering by MIME prefix, `maxSize` enforcement, the disabled state's tab-removal + drop-ignore, and the `data-drag-over` lifecycle.

  Registry rebuilt: 55 → 56 components. Theme D pain-point P-033 closed.

- 6eca0c1: feat(components): add `FileTree` — WAI-ARIA tree with full keyboard navigation

  `FileTree` is the hierarchical-navigation primitive [shadcn has skipped](https://github.com/shadcn-ui/ui/issues) despite growing IDE/Cursor-era demand (pain-point P-035). Built on the **WAI-ARIA tree pattern** — `role="tree"` on the root, `role="treeitem"` per node, `role="group"` per child container, with `aria-level`, `aria-expanded` (folders), `aria-selected`, and `aria-disabled` reflecting state.

  ```tsx
  const nodes = [
  	{
  		id: "src",
  		name: "src",
  		children: [
  			{ id: "src/index.tsx", name: "index.tsx" },
  			{
  				id: "src/components",
  				name: "components",
  				children: [{ id: "src/components/Button.tsx", name: "Button.tsx" }],
  			},
  		],
  	},
  	{ id: "package.json", name: "package.json" },
  ];

  <FileTree
  	aria-label="Project files"
  	nodes={nodes}
  	defaultExpanded={["src"]}
  	selected={selected}
  	onSelect={setSelected}
  />;
  ```

  Full **keyboard navigation** matching the [WAI-ARIA APG tree pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/):
  - **ArrowDown / ArrowUp** — move between visible items (focus follows, but `onSelect` does NOT fire — selection is independent of focus)
  - **ArrowRight** — expand a closed folder, or move to first child if open
  - **ArrowLeft** — collapse an open folder, or move to parent
  - **Home / End** — jump to the first / last visible item
  - **Enter / Space** — activate (toggles expand on folders, fires `onSelect` for everyone)

  **Roving tabindex** — only the active node has `tabIndex=0`, the rest have `tabIndex=-1`, so Tab in/out skips the tree as a whole and arrow keys handle internal navigation. `requestAnimationFrame` defers focus moves so the new tabbable element is in the DOM before `.focus()` runs.

  Expanded state is **uncontrolled by default** (`defaultExpanded={["src"]}`); pass `expanded` + `onExpandedChange` for controlled mode. Selected is purely controlled via `selected` + `onSelect`.

  Each node has `id`, `name`, optional `children`, optional `icon` override, and optional `disabled`. Default icons are folder (open/closed variants) and file SVGs; pass `icon` per-node to use Lucide or any other set. Disabled nodes carry `aria-disabled="true"` and ignore clicks/keyboard activation.

  Eight tests cover the tree role + label, default-collapsed state, `defaultExpanded` reveal + correct `aria-level` propagation, click-to-toggle vs click-to-select branching, ArrowRight/ArrowLeft expand/collapse, Enter activation on leaves, disabled node click suppression, and the roving-tabindex single-tabbable invariant.

  Registry rebuilt: 57 → 58 components. Theme D pain-point P-035 closed — Theme D **success signal hit (7/7)**.

- 6eca0c1: feat(components): add `MultiCombobox` — searchable multi-select on Popover + Command

  shadcn's maintainers have explicitly declined to ship a multi-select primitive — long-standing pain-point P-031. Hex Core now ships one.

  `MultiCombobox` is a sibling to the existing `Combobox`: same `Popover` + `cmdk` Command list, same trigger token surface, but `value` is `string[]` and selecting an option toggles membership instead of replacing the value. The trigger reads `"{n} selected"` once any option is picked (chosen over chip-stack to keep the `role="combobox"` button at a stable height); the comma-joined label list is mirrored on the trigger's `title` attribute as a pointer/screen-reader fallback. A visually-hidden `aria-live="polite"` region announces selection-count changes.

  ```tsx
  const [picks, setPicks] = useState<string[]>([]);

  <MultiCombobox
  	options={[
  		{ value: "bug", label: "Bug" },
  		{ value: "feature", label: "Feature" },
  	]}
  	value={picks}
  	onChange={setPicks}
  	aria-label="Tags"
  />;
  ```

  A `maxSelected` cap is supported as a UX hint — once reached, unselected options carry `aria-disabled="true"` and clicks are ignored. `closeOnSelect` defaults to `false` to match the Linear/Notion multi-select pattern; set it `true` for one-shot pickers.

  ARIA wiring matches the existing `Combobox`: trigger is `role="combobox"` with `aria-expanded`, `aria-haspopup="listbox"`, and `aria-controls` only set while the popover is open (the listbox is portal-mounted, so a permanent `aria-controls` would point at a non-existent id). Each list item carries `aria-selected` reflecting the controlled `value` set.

  Six tests cover trigger a11y wiring, picking + toggling-off, the `maxSelected` cap, per-option `aria-selected`, and the trigger's `"{n} selected"` + `title` mirror.

  Registry rebuilt: 53 → 54 components. Theme D pain-point P-031 closed.

- 6eca0c1: feat(components): add `Stepper` — linear progress for multi-step flows with per-step error state

  `Stepper` is a semantic-HTML primitive for form wizards, onboarding, checkout, and any sequenced flow where the user needs to know where they are and what's next. shadcn has had two long-running discussions (#1422, #4276 — pain-point P-036) about adding one and never has.

  The component renders an `<ol>` with the required `aria-label`, one `<li>` per step, and per-step status derived from the controlled `current` index — except when the consumer pins a step's `status` explicitly. The status union is `"complete" | "current" | "upcoming" | "error"`; `"error"` lets a wizard surface a validation failure on the current or a prior step without lying about its index.

  ```tsx
  <Stepper
  	aria-label="Checkout"
  	current={2}
  	steps={[
  		{ id: "cart", label: "Cart" },
  		{ id: "shipping", label: "Shipping", status: "error" },
  		{ id: "payment", label: "Payment" },
  	]}
  />
  ```

  The current step's interactive child carries `aria-current="step"`. Completed steps prefix the label with a visually-hidden `"Completed: "`; error steps prefix `"Error: "` and set `aria-invalid="true"` on the indicator. When `onStepClick` is omitted the steps are non-interactive `<span>`s — no fake button roles. When provided, each step renders as a real `<button>` with focus-ring tokens; `step.disabled` no-ops the click.

  `size="sm" | "md"` and `orientation="horizontal" | "vertical"` are CVA variants — the vertical layout flips the connector to a 1px column rather than a row. All theming hooks token-based (`--control-height-sm`, `--gap-md`, `--space-3`, `--space-1`, `--duration-normal` plus `primary`, `destructive`, `input`, `muted-foreground`, `ring` semantic tokens).

  Six tests cover the `<ol>` + `aria-label` shape, `aria-current` on the current step + `Completed:` prefix on prior ones, the non-interactive `<span>` path, the interactive `<button>` path with disabled steps, the `status="error"` override + `aria-invalid`, and the vertical orientation root class.

  Registry rebuilt: 53 → 54 components. Theme D pain-point P-036 closed.

- 6eca0c1: feat(components): add `TimePicker` — token-styled native time input

  `TimePicker` ships the #1 most-reacted [shadcn feature request](https://github.com/shadcn-ui/ui/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc) (pain-point P-030). It's a **styled wrapper around the native `<input type="time">`** — the browser handles 12/24-hour locale based on user system settings, keyboard arrow spinning across hour/minute (and seconds) segments, and screen-reader announcement of each segment. The wire format is always 24-hour `"HH:MM"` (or `"HH:MM:SS"` when `step={1}`), so values round-trip cleanly through forms.

  ```tsx
  const [time, setTime] = useState<string>();

  <TimePicker
  	value={time}
  	onChange={setTime}
  	step={300} // 5-minute step
  	min="09:00"
  	max="17:00"
  	aria-label="Working hours start"
  />;
  ```

  Why native: the alternative (Popover with hour/minute scroll columns) needs a substantial custom interaction layer with locale-specific 12/24-hour toggling, screen-reader-friendly announcements, and arrow-key spinning of each segment. The native input gives all of that for free with full a11y; the only cost is the browser's default calendar-picker indicator styling, which is tuned via `[&::-webkit-calendar-picker-indicator]` so it picks up the design system's hover state.

  Forwards `ref` so it integrates with `react-hook-form` (`{...register("time")}`) and any other controlled form library. `step` accepts standard time-input values: `60` (default, HH:MM), `1` (HH:MM:SS), `300` (5-min steps), `900` (15-min), `1800` (30-min).

  Five tests cover input type + value rendering, onChange wire format, step/min/max forwarding, disabled state, and ref forwarding.

  Registry rebuilt: 56 → 57 components. Theme D pain-point P-030 closed.

- 6eca0c1: feat(components): add `Timeline` — vertical chronological event feed

  A vertical activity-log primitive for audit trails, release notes, notification streams, and any chronological event surface — the request that's lived in [shadcn issues](https://github.com/shadcn-ui/ui/issues) for years (pain-point P-034) without ever shipping.

  Pure semantic HTML — `<ol>` of `<li>` with the required `aria-label` on the list. Each event has a status-colored indicator (`default | success | warning | error | info`), an optional icon override, and three text slots: title, timestamp, description.

  ```tsx
  <Timeline
  	aria-label="Activity"
  	events={[
  		{ id: "1", title: "Pull request opened", timestamp: "2h ago", status: "info" },
  		{ id: "2", title: "CI passed", timestamp: "1h ago", status: "success" },
  		{
  			id: "3",
  			title: "Merged to main",
  			timestamp: "12m ago",
  			description: "Squash + merge by @oscar",
  			status: "success",
  		},
  	]}
  />
  ```

  The connector line and indicator are `aria-hidden` so meaning travels entirely in the title/timestamp/description text. No `aria-current` — events are historical, not navigational. `size="sm" | "md"` controls the indicator size.

  Five tests cover the `<ol>` + `aria-label` shape, surfaced text content, custom icon override, last-event has-no-connector layout, and the `aria-hidden` discipline on the visual rail.

  Registry rebuilt: 54 → 55 components. Theme D pain-point P-034 closed.

## 1.2.1

### Patch Changes

- f21896a: Ship a Tailwind v4 entry point so consumers don't have to hand-wire `@source` for `node_modules`.

  Tailwind v4 doesn't auto-scan installed packages. Without an explicit `@source` directive in the consumer's CSS, utility classes embedded in this package's published bundle (e.g. `inset-ring-foreground/[0.06]` introduced by the v1.2.0 flat-surface fix) appear in the rendered HTML but have no matching CSS rule, leaving Button outline / Input / Card / etc. unstyled. The gap was discovered while validating v1.2.0 in a downstream consumer.

  Adds:
  - `packages/components/tailwind.css` exporting an `@source "./dist/*.js"` directive
  - A new `./tailwind.css` exports entry in `package.json`
  - Install-section update in the README explaining the one-line consumer setup

  Consumer migration (one line):

  ```css
  @import "tailwindcss";
  @import "@hex-core/components/tailwind.css";
  ```

  No runtime API changes. Existing consumers who already added their own `@source "../../node_modules/@hex-core/components/dist/*.js"` can replace it with the `@import` line, but the manual approach continues to work.

## 1.2.0

### Minor Changes

- 22d9416: Fix systemic flat-surface visibility regression across 30 components.

  On flat-white surfaces (any consumer page without a Card-elevated wrapper around the demo), components rendered with ~invisible boundaries because token borders (`border-input`, `border-border`) sit at L=90% — 1.27:1 contrast vs `--color-background`. The v1.0.2→v1.1.1 token rollback (#73) intentionally kept borders subtle and relied on shadow elevation from surrounding Card/Popover/Dialog, but that contract only holds when the surrounding surface IS elevated.

  This release adds a self-borne shape cue to every affected component using Tailwind v4 `inset-ring` / explicit `-foreground/[opacity]` borders. Token contracts are preserved (`border-input` still applies); the inset ring is additive so components remain subtle on already-elevated surfaces and become visible on flat ones.

  Affected:
  - Form controls (Type A): Button outline+secondary, Badge secondary+outline, Input, Switch unchecked, Checkbox, RadioGroupItem, Textarea, SelectTrigger, Toggle outline, InputOTPSlot, Combobox trigger, DatePicker trigger, AlertDialogCancel.
  - Surface containers (Type B): Card, Dialog, Sheet, Drawer, Popover, DropdownMenu, ContextMenu, Menubar, NavigationMenuViewport, AlertDialog, HoverCard, DataTable wrapper, Alert default, Calendar nav, SelectContent.
  - Single-edge dividers (Type C): Accordion, Table (header/row/footer), Tabs (TabsList border), Sidebar, Command (CommandInput border-b).
  - Tracks/separators (Type D): Progress, Slider, Separator, ScrollBar thumb, Skeleton, Resizable handle, NavigationMenu indicator, plus dropdown/menubar/context/command/select separator divs.

## 1.1.1

### Patch Changes

- 0029977: Fix: full rollback of the v1.0.2 light-theme contrast bumps. Restore canonical Button/Badge hover.

  The v1.0.2 release pushed `--secondary`, `--border`, and `--input` to L=58% to satisfy strict WCAG 2.1 SC 1.4.11 (3:1 against the white `--card`). On the live docs site this rendered:
  - Secondary buttons as heavy mid-gray pills (finding #14)
  - Card frames, Tabs, Input borders, and surrounding chrome with a clearly-visible mid-gray that made every framed surface look heavier than the components inside

  The strict reading was correct on paper but produced a layout that real users described as "awful." This PR reverts all three light-theme tokens to their original values:
  - `--secondary` light: 58% → **95.9%**
  - `--border` light: 58% → **90%**
  - `--input` light: 58% → **90%**

  It also restores the canonical `hover:bg-secondary/80` on Button and Badge `secondary` variants — at the lighter fill, the 80%-alpha-over-white composite is the gentle subtle-darken hover (vs the L=58% version which would composite below 3:1).

  **WCAG trade-off**

  `--border` and `--input` at L=90% give ~1.27:1 against the white `--card`, failing strict SC 1.4.11. The team accepts this trade-off because:
  - **Filled controls (Secondary button, Badge):** the near-black `--secondary-foreground` text gives ~16:1 contrast against the L=95.9% fill — that perceivable cue carries the boundary identification.
  - **Framed surfaces (Card, Popover, Dialog):** shadow elevation provides perceivable affordance independent of border color.
  - **Form-control borders (Input, Switch off-state):** these remain the legitimate residual concern; consumers who need strict 1.4.11 compliance can override the three tokens at `:root`. Tracked as a longer-term design decision rather than a hidden bug.

  `--muted-foreground` (L=38%) and the dark-mode values are unchanged. Finding #12 (the original Outline-button-invisible report) is intentionally re-opened in the findings tracker as a known trade-off rather than a closed bug.

  **Other changes carried along:**
  - Three inline copies of the default light theme (mcp-server theme-loader, docs theming snippet, docs installation snippet) sync to the rolled-back values.
  - `Spacer` JSDoc — removed `h-[var(...)]` and `w-[var(...)]` literal examples from the comment block; Tailwind v4's content scanner was attempting to compile them as actual CSS classes and failing PostCSS with `Unexpected token Delim('.')`. No runtime/API change.
  - Registry items for `button` and `badge` regenerate to reflect the restored `hover:bg-secondary/80` source.

## 1.1.0

### Minor Changes

- ec3095b: Adds five headless layout primitives to `@hex-core/components` and four matching tokens to `@hex-core/tokens`.

  **`@hex-core/components`**
  - **`Container`** — centered max-width wrapper with `size` (sm/md/lg/xl/full → bound to `--container-{sm,md,lg,xl}`) and `padding` (none/sm/md/lg → bound to `--space-*`). Supports `asChild` for polymorphic rendering as `<main>`, `<section>`, etc.
  - **`Stack`** — vertical flex flow with `gap`, `align`, `justify` bound to `--gap-*`. Headless equivalent of `<div className="flex flex-col gap-X">`.
  - **`Cluster`** — horizontal flex flow with wrap. Same `gap`/`align`/`justify` surface as Stack but wraps when out of horizontal space; `align` includes `baseline` (for mixed-size siblings) and `stretch` (for equal-height card rows).
  - **`Grid`** — CSS grid with column-count presets (1/2/3/4/6) plus `cols="auto-fit"` + `minColWidth` for responsive grids without media queries.
  - **`Spacer`** — declarative `aria-hidden` whitespace block with `size` (xs–xl, bound to `--space-*`) and `axis` (vertical/horizontal/both). Use when sibling spacing can't come from a parent's `gap`.

  All five are React 19-style components (no `forwardRef`), token-driven (no hardcoded colors or spacings), and ship under `primitives/` with `subcategory: "layout"` so the registry surfaces them as a coherent group. Each schema includes the mandatory `ai` field (whenToUse / whenNotToUse / commonMistakes / relatedComponents / accessibilityNotes / tokenBudget).

  `gap`, `justify`, and `align` variant maps are factored into a shared `_shared/layout-variants.ts` so all three flow primitives stay in lockstep when the gap scale changes.

  Schemas are exported from the package barrel (`containerSchema`, `stackSchema`, `clusterSchema`, `gridSchema`, `spacerSchema`).

  **`@hex-core/tokens`**

  Adds `--gap-xs` (0.25rem), `--gap-xl` (2rem), and `--container-sm/md/lg/xl` (33/40/50/66rem) to `sharedTokens`. The new layout primitives consume these directly; pre-existing components are unaffected.

  Registry rebuilt: 47 → 52 component items.

## 1.0.1

### Patch Changes

- fe050d0: Fix: light-theme `--secondary`, `--border`, and `--input` now meet WCAG 2.1 SC 1.4.11.

  Previously the default theme's light-mode `--secondary` (L=95.9%), `--border` (L=90%), and `--input` (L=90%) sat at ~1.10:1 / ~1.27:1 contrast against `--card` (white) — well below the 3:1 minimum required for non-text UI components. The bug was visible on hex-core.dev/docs/components/button: Outline and Secondary `<Button>` variants were nearly invisible against the white card surface, and form-control borders, Card borders, Switch tracks, Progress tracks, and Slider tracks were all undetectable as discrete UI elements.

  All three tokens now sit at L=58%, giving ~3.2:1 contrast against white — clearing WCAG 1.4.11. The full axe-core audit (`pnpm run a11y-audit`) passes zero critical/serious/moderate/minor violations across every component demo for the **default** theme in light + dark modes.

  `@hex-core/components` also gets a patch: Button (`secondary` variant) and Badge (`secondary` variant) drop their `hover:bg-secondary/80` opacity-shift hover state, because at the new L=58% fill, an 80% alpha composite over white renders the apparent contrast to ~2.44:1 — a hover-state regression below 3:1. Button substitutes shadow elevation (`shadow-sm` → `shadow-md` on hover); Badge keeps the fill at full opacity (badges don't traditionally need a hover affordance — they're not interactive controls).

  **Patch-vs-major rationale** — Theme A (the previous tokens MAJOR bump) required code-level migration: consumers using `--destructive-foreground` on non-destructive surfaces had to re-point those surfaces. This PR only shifts pixel values for a fixed set of tokens; no consumer code change is required. Defenders who want the prior off-white aesthetic can override the three tokens at `:root` (acknowledging they then fail WCAG 1.4.11). That distinction is what makes patch defensible here despite the visible visual change.

  **Audit scope honesty** — `scripts/a11y-audit.ts` only renders the default theme in light + dark, not midnight or ember. The midnight and ember _light_ variants share a similar pattern (~1.18:1 / ~1.17:1 secondary-vs-card) and have the same defect; they're tracked as a follow-up to finding #12 and not gated by this PR's audit run.

  Dark-mode values are unchanged — they already exceeded 3:1 against the dark `--card`. `--secondary-foreground` stayed at L=10% — gives 5.6:1 against the new L=58% fill (passes AA normal text). `--muted` and `--accent` also stayed at L=95.9% — they're text-background tokens, not "non-text UI elements" per 1.4.11.

## 1.0.0

### Major Changes

- 6c8c141: Theme A — WCAG 2.2 AA accessibility compliance.

  Major bump on `@hex-core/components` and `@hex-core/tokens` — there are user-observable behavior and visual changes (see Migration). Everything else is additive or covered by the audit gate.

  ### Migration
  - **Dark `--destructive` lightened, `--destructive-foreground` flipped to dark** across all three theme presets (default / midnight / ember). Required so destructive surfaces and destructive text both pass WCAG 2.2 AA in dark mode. Visual diff: previously a deep red (`hsl(0 62% 30%)`) with white text, now a coral red (`hsl(0 75% 65%)`) with dark text (`hsl(0 75% 15%)`). Consumers who painted `--destructive-foreground` on a _non-destructive_ surface in dark mode (uncommon — most use it inside destructive buttons / alerts) will see dark text instead of white and need to point those surfaces at `--foreground` instead.
  - **`ScrollArea` viewport is now keyboard-focusable by default** (`viewportTabIndex={0}`). Apps that wrap purely decorative content in ScrollArea will see a new tab stop. Pass `viewportTabIndex={-1}` to opt out — the prop is the new opt-out surface and is documented in `scroll-area.schema.ts`.
  - **`CommandSeparator` is no longer the cmdk primitive.** It now renders as `<div role="none" data-cmdk-separator="">` so it can sit inside `CommandList` (`role="listbox"`) without violating ARIA's required-children rule. The `data-cmdk-separator` attribute is preserved for selector compatibility, but anyone reading cmdk's _internal_ Separator state (rare) will need to update.
  - **`DataTable` accessible label prop renamed `ariaLabel` → `aria-label`** (kebab-case quoted prop) to match the convention used elsewhere in Hex UI. This was introduced earlier in the same PR cycle and never shipped publicly, but call it out for anyone tracking pre-release branches.
  - **`Dialog` overflow handling now uses an inner scroll container** (`scrollable={true}` is the default). Long content scrolls inside the focus trap; the close button stays anchored to the (non-scrolling) outer panel. Consumers who previously relied on DialogContent itself being the scroll container (custom `overflow-*` className overrides) should pass `scrollable={false}` and manage scroll themselves — `CommandDialog` does this internally.

  ### Additive changes

  `@hex-core/components`
  - `Combobox`: new `aria-labelledby` prop. Trigger now wires `aria-controls` to a `useId`-stable id pointing at `CommandList`, gated on `open` so it's only set when the listbox is actually mounted.
  - `DataTable`: new `caption?: ReactNode` and `aria-label?: string` props. Previously the table shipped without a caption, leaving screen-reader users without context.
  - `DialogContent`: new `scrollable?: boolean` prop (default `true`). See Migration.
  - `Slider`: new `thumbLabels?: string[]` prop for per-thumb names. Single-thumb sliders auto-mirror the Root's `aria-label`; range sliders fall back to indexed `(N of M)` names if no `thumbLabels` is provided. A dev-mode warning fires when `thumbLabels.length !== value.length`.
  - `ScrollArea`: new `viewportTabIndex?: number` prop. See Migration.
  - `CommandSeparator`: rendered as a presentational div. See Migration.
  - `TableCaption`: now sets `caption-bottom` so the `<caption>` element sits below the table visually while remaining first in document order (announced first by screen readers).

  `@hex-core/tokens`
  - Light `--muted-foreground` tightened to ≥4.5:1 across all three themes.
  - Light `--destructive` darkened so destructive button text passes 4.5:1.
  - Dark destructive flip — see Migration.

  ### Repo
  - New `pnpm run a11y-audit` boots the docs prod build and runs axe-core (`@axe-core/playwright`) against every component demo in light + dark. Fails on critical/serious violations. Wired into CI; report uploaded as a workflow artifact. Hardened against banner-string drift, port collisions, and SIGTERM cancellation.
  - `CONTRIBUTING.md` gains an Accessibility section covering form-control labelling, contrast budget, composite-widget rules, and dialog overflow guidance.

### Patch Changes

- c8a4d52: Fix: published tarballs now correctly pin workspace dependencies.

  Previous releases of `@hex-core/components`, `@hex-core/cli`, and `@hex-core/mcp` shipped `"@hex-core/registry": "workspace:^"` literal in the tarball's `dependencies`, breaking every consumer outside a pnpm workspace with `npm error code EUNSUPPORTEDPROTOCOL`. `@hex-core/tokens` shipped a similar literal for its registry dependency.

  Root cause: `scripts/publish-local.sh` used `npm publish`, which uploads tarballs as-is. Switched to `pnpm publish`, which rewrites `workspace:^` → pinned `^X.Y.Z` automatically.

  `@hex-core/registry` has no workspace dependencies and was not affected, but is bumped to keep the family in lockstep and simplify the release narrative.

  After this release, `npm install @hex-core/components` (and the other published packages) succeeds in any consumer project regardless of package manager.

- Updated dependencies [c8a4d52]
- Updated dependencies [6c8c141]
  - @hex-core/registry@0.2.1

## 0.2.0

### Minor Changes

- 07bea53: Theme B substrate — full custom-tokens surface across the OS.

  **`@hex-core/tokens`** now ships beyond color + radius:
  - Spacing scale (`--space-1` through `--space-16`)
  - Gap presets (`--gap-sm/md/lg`)
  - Control heights (`--control-height-sm/md/lg`)
  - Typography scale (`--text-xs` through `--text-3xl`)
  - Motion duration tokens (`--duration-fast/normal/slow`)

  Shared across the 3 theme presets via `themes/shared.ts`. `themeToTailwindConfig`
  now emits `spacing`, `fontSize`, `transitionDuration`, and `height` maps in
  addition to `colors` and `borderRadius`, so consumers wire the whole token set
  into Tailwind's `theme.extend` in one call.

  **`@hex-core/components`** — all 47 components migrated to read tokens via
  CSS-variable references. Fallbacks match prior Tailwind defaults, so consumers
  without a theme loaded see zero visual change. Override `--space-6` (etc.) in
  your `globals.css` and every component reflows.

  **`@hex-core/registry`** — adds `tokenSetSchema`, `strictTokenSetSchema`,
  `strictThemeSchema`, plus `REQUIRED_COLOR_TOKENS` and `REQUIRED_RADIUS_TOKENS`
  constants. Strict variants validate that a theme defines the 19 color tokens +
  radius needed for components to render correctly. Existing `themeSchema` stays
  loose for runtime parsing.

  **`@hex-core/cli`** — adds `hex theme init` and `hex theme edit`:

  ```bash
  # scaffold globals.css from a preset (full token block, light + dark)
  pnpm dlx @hex-core/cli theme init --name midnight --out app/globals.css

  # override one or more tokens, scoped or both
  pnpm dlx @hex-core/cli theme edit \
    --file app/globals.css \
    --token "primary=240 50% 50%"
  ```

  114 unit tests cover the new surface (was 65 before).

### Patch Changes

- Updated dependencies [07bea53]
  - @hex-core/registry@0.2.0

## 0.1.0

### Minor Changes

- efcdb1b: Initial public release of Hex Core — AI-native component library with MCP-first distribution.
  - `@hex-core/components`: Radix UI + Tailwind components with machine-readable schemas
  - `@hex-core/registry`: Zod schemas and types for the component registry
  - `@hex-core/tokens`: Design token engine (HSL tokens, typography, themes)
  - `@hex-core/cli`: Install components and skills into your project
  - `@hex-core/mcp`: MCP server for component discovery and installation

### Patch Changes

- Updated dependencies [efcdb1b]
  - @hex-core/registry@0.1.0
