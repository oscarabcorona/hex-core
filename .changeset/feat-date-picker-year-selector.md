---
"@hex-core/components": minor
---

feat(components): forward `captionLayout`, `startMonth`, `endMonth` on `DatePicker` for year-dropdown navigation

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
