---
"@hex-core/components": minor
---

feat(components): add `Dropzone` — drag-and-drop file input with full keyboard a11y

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
