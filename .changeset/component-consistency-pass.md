---
"@hex-core/components": minor
"@hex-core/registry": patch
---

fix(components): normalize interaction states and size scales

Brings 49 components to one consistency bar — the interaction-state matrix
(canonical focus rings incl. `ring-offset-2`, `transition-all` with duration +
ease, menu `hover:` paired with every `focus:`, `active:scale-[0.98]`, complete
`disabled:` pairs) and the two canonical size families.

**Size scales (the minor bit):** `loading-indicator`, `stepper`, and `timeline`
rename their `md` size key to `default` and add an `lg`. `default` inherits the
previous `md` rendering, so any component used without an explicit `size` looks
identical; `lg` is purely additive. If you set it explicitly, update
`size="md"` → `size="default"` on these three.

The rest are pure visual/interaction fixes (no API change) across diagram
primitives, study-card surfaces, menus/overlays, nav controls, and page blocks.
No new dependencies.
