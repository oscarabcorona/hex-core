---
"@hex-core/components": minor
---

feat(components): add `TimePicker` — token-styled native time input

`TimePicker` ships the #1 most-reacted [shadcn feature request](https://github.com/shadcn-ui/ui/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc) (pain-point P-030). It's a **styled wrapper around the native `<input type="time">`** — the browser handles 12/24-hour locale based on user system settings, keyboard arrow spinning across hour/minute (and seconds) segments, and screen-reader announcement of each segment. The wire format is always 24-hour `"HH:MM"` (or `"HH:MM:SS"` when `step={1}`), so values round-trip cleanly through forms.

```tsx
const [time, setTime] = useState<string>();

<TimePicker
  value={time}
  onChange={setTime}
  step={300}            // 5-minute step
  min="09:00"
  max="17:00"
  aria-label="Working hours start"
/>
```

Why native: the alternative (Popover with hour/minute scroll columns) needs a substantial custom interaction layer with locale-specific 12/24-hour toggling, screen-reader-friendly announcements, and arrow-key spinning of each segment. The native input gives all of that for free with full a11y; the only cost is the browser's default calendar-picker indicator styling, which is tuned via `[&::-webkit-calendar-picker-indicator]` so it picks up the design system's hover state.

Forwards `ref` so it integrates with `react-hook-form` (`{...register("time")}`) and any other controlled form library. `step` accepts standard time-input values: `60` (default, HH:MM), `1` (HH:MM:SS), `300` (5-min steps), `900` (15-min), `1800` (30-min).

Five tests cover input type + value rendering, onChange wire format, step/min/max forwarding, disabled state, and ref forwarding.

Registry rebuilt: 56 → 57 components. Theme D pain-point P-030 closed.
