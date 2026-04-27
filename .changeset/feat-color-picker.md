---
"@hex-core/components": minor
---

Adds `ColorPicker` — an HSL-native color editor that round-trips losslessly through the `@hex-core/tokens` HSL triplet format (`"<H> <S>% <L>%"`).

The picker edits an HSL triplet directly via three labeled sliders (Hue / Saturation / Lightness). A hex input sits beside them as a display adapter — sliders are the source of truth, so the value never loses precision when round-tripping triplet → hex → triplet during slider drags. Invalid hex input is held in a local buffer and not committed until it parses cleanly. The buffer also resists clobbering while the input is focused, so users can type intermediate states without parent re-renders snapping the caret.

Each `<ColorPicker>` instance generates a stable internal `id` via `React.useId()`, so multiple pickers can render on the same page (e.g. one per token in a theme editor) without label-collision.

API:

```tsx
const [color, setColor] = React.useState("240 5.9% 10%");
<ColorPicker value={color} onChange={setColor} aria-label="Primary color" />
```

Composition: `Popover` (trigger + body) + three `Slider` rows + an `Input` for hex + a swatch preview. Per-axis `aria-label`s (Hue / Saturation / Lightness) on the sliders; the trigger requires an explicit `aria-label` describing the role of the color being edited.

Also exports the underlying color utilities — `parseHslTriplet`, `formatHslTriplet`, `hslToRgb`, `rgbToHsl`, `hslTripletToHex`, `hexToHslTriplet` plus `HslTriplet` and `RgbColor` types — under `@hex-core/components`. These are pure, testable functions for any consumer that needs to bridge between hex and triplet formats outside the picker UI.

Registry rebuilt: 52 → 53 component items.
