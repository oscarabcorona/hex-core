---
"@hex-core/components": minor
---

feat(components): tier-1 catalog gaps — 7 new components

Audit-driven batch closing the highest-leverage gaps surfaced by
comparing the catalog against shadcn/Radix Themes/Mantine/Park UI/Ariakit:

**Feedback-state primitives** (F2-11 consumer-feedback trio + Tag):

- **`Empty`** — zero-state surface for lists / dashboards / search
  results with no content. icon + title + description + action slot.
  Region landmark labeled by the title for screen readers.
- **`Loading`** — composed loading-placeholder pattern. Skeleton is the
  atom (one shaped pulse), Loading is the molecule (canonical multi-row
  patterns: list / card / stack). `role="status"` + sr-only label.
- **`ErrorState`** — failure surface with optional retry button.
  `role="alert"` so screen readers announce on first render. Restrained
  default tone + alarm-bias destructive variant.
- **`Tag`** — interactive tag/chip primitive. Mirrors Badge's CVA
  variants but adds a built-in dismiss `×` when `onRemove` is provided.
  Auto-derived `aria-label` from string children.

**Composition primitives**:

- **`Tree`** — generic hierarchical list with roving-tabindex keyboard
  navigation (↑↓ move, → expand, ← collapse, Home/End first/last,
  Enter/Space activate). Distinct from `FileTree` — content-agnostic
  for org charts, taxonomy pickers, navigation trees.
- **`Toolbar`** — group of controls with arrow-key roving focus.
  Wraps `@radix-ui/react-toolbar` (NEW dep). Exposes `Toolbar`,
  `ToolbarButton`, `ToolbarLink`, `ToolbarToggleGroup`,
  `ToolbarToggleItem`, `ToolbarSeparator`. Horizontal + vertical.

**AI category extension**:

- **`Attachment`** — file/image thumbnail with optional remove
  affordance + upload-progress overlay. Auto-detects image vs file
  variant from MIME + preview URL. Composes with `Composer` for
  multimodal message drafts.

All seven ship with full intent metadata: variant `useWhen` per
schema, structured `antiPatterns[]` with `insteadUse` slugs pointing to
the right alternative for each canonical mistake, `composition` tags on
every example so MCP `search_compositions` finds them, and the standard
`whenToUse` / `whenNotToUse` / `accessibilityNotes` per CLAUDE.md.

Visual signature alignment: every component reads as part of the new
modern-minimalist palette (graphite primary, 0.375rem radius, restrained
chroma) — no magic HSL values, all semantic tokens.

**New dep:** `@radix-ui/react-toolbar@latest` — small Radix package,
runtime dep matching the pattern of the 30+ other Radix peers.

**Tests:** 56 new test cases (Empty 6, Loading 5, ErrorState 7, Tag 7,
Toolbar 5, Tree 6, Attachment 8).
