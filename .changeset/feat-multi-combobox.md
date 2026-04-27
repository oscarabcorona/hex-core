---
"@hex-core/components": minor
---

feat(components): add `MultiCombobox` — searchable multi-select on Popover + Command

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
/>
```

A `maxSelected` cap is supported as a UX hint — once reached, unselected options carry `aria-disabled="true"` and clicks are ignored. `closeOnSelect` defaults to `false` to match the Linear/Notion multi-select pattern; set it `true` for one-shot pickers.

ARIA wiring matches the existing `Combobox`: trigger is `role="combobox"` with `aria-expanded`, `aria-haspopup="listbox"`, and `aria-controls` only set while the popover is open (the listbox is portal-mounted, so a permanent `aria-controls` would point at a non-existent id). Each list item carries `aria-selected` reflecting the controlled `value` set.

Six tests cover trigger a11y wiring, picking + toggling-off, the `maxSelected` cap, per-option `aria-selected`, and the trigger's `"{n} selected"` + `title` mirror.

Registry rebuilt: 53 → 54 components. Theme D pain-point P-031 closed.
