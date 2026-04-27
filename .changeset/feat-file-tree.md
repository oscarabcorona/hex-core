---
"@hex-core/components": minor
---

feat(components): add `FileTree` — WAI-ARIA tree with full keyboard navigation

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
/>
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
