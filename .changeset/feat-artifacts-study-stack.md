---
"@hex-core/components": minor
---

feat(artifacts): study stack — Flashcard, Cloze, ImageOcclusion, Quiz, CompareTable, Deck, SpacedRepetition

Fifth `artifacts/` batch, stacked on the time stack. Adds the **study / pedagogy** family — primitives a learner or AI tutor reaches for when the content's job is to be *learned*, not just displayed. Web research consensus on best-of-2026 study formats (`reviewjane.com`, `aitooldiscovery.com`, `dev.to/anki`, `help.remnote.com`, `retain.cards`) lands on the four Anki note types as the universal floor; this batch ships those plus three popular layered helpers.

**Components (`packages/components/src/artifacts/`):**

- **`Flashcard`** — front/back card with a CSS 3D flip on click / Enter / Space. Controlled or uncontrolled. Pure CSS transform, no animation peer.
- **`Cloze`** — fill-in-the-blank text with click-to-reveal blanks. Each `{ hidden }` token in the `parts` array becomes a redacted span. `revealMode: "click" | "all"` toggles a "Reveal all" escape hatch.
- **`ImageOcclusion`** — image with rectangular regions hidden behind opaque overlays. Coordinates are 0–1 fractions so the layout stays correct at any rendered size. Dev-only console.warn when coords escape `[0, 1]` (the "passed pixels not fractions" footgun).
- **`Quiz`** — single-question multiple-choice. `selectionMode: "single" | "multi"`. After submit, each option is tagged `data-state="correct|incorrect|missed"` so consumers can theme right / wrong / unselected-but-correct independently. Per-option `explanation` renders below the option after submit.
- **`CompareTable`** — side-by-side comparison. Subjects as columns, attributes as rows, optional difference highlighting against the row's first non-empty cell. Dev-only console.warn when an attribute references a subjectId that isn't in the subjects array.
- **`Deck`** — paged sequence of flashcards with optional shuffle, prev/next, progress bar, and a `ratingSlot` render-prop for SpacedRepetition composition. Order recomputes only on `cards` identity change — never re-shuffles mid-session.
- **`SpacedRepetition`** — Anki-style four-button rating row (Again / Hard / Good / Easy). Headless on scheduling: emits `(rating, cardId)`, consumer wires SM-2 / FSRS / hand-rolled.

**Patterns shared with prior stacks:**

- `useMemo` over any layout pass; keyboard activation (Enter / Space with `preventDefault` on Space)
- `data-*` attributes for theming and test introspection (`data-flipped`, `data-revealed`, `data-state`, `data-row`, `data-rating`)
- `aria-pressed` / `aria-label` / `role="button"` / `role="status"` / `role="group"` where applicable
- Dev-only `console.warn` for invalid-shape inputs (ImageOcclusion fractional coords, CompareTable orphaned subjectIds)

**Composition story:** `<Deck cards={…} ratingSlot={(card) => <SpacedRepetition cardId={card.id} onRate={…} />} />` is the reference Anki-flow integration. Quiz, Cloze, and ImageOcclusion can also live inside a Deck via the `front`/`back` props since both accept `ReactNode`.

**No registry / MCP / build-pipeline plumbing changes.** The `artifact` category enum was widened in the hierarchy stack and all five families since (hierarchy → flow → relational → time → study) reuse it. No new heavy peer dependencies — all 7 primitives are pure HTML / CSS.

This is the fifth and final stack of the initial `artifacts/` rollout. Total artifact primitives ship at 23 across 5 sub-families: hierarchy (5) + flow (4) + relational (4) + time (3) + study (7).
