---
"@hex-core/components": minor
---

feat(components): add `Timeline` — vertical chronological event feed

A vertical activity-log primitive for audit trails, release notes, notification streams, and any chronological event surface — the request that's lived in [shadcn issues](https://github.com/shadcn-ui/ui/issues) for years (pain-point P-034) without ever shipping.

Pure semantic HTML — `<ol>` of `<li>` with the required `aria-label` on the list. Each event has a status-colored indicator (`default | success | warning | error | info`), an optional icon override, and three text slots: title, timestamp, description.

```tsx
<Timeline
  aria-label="Activity"
  events={[
    { id: "1", title: "Pull request opened", timestamp: "2h ago", status: "info" },
    { id: "2", title: "CI passed", timestamp: "1h ago", status: "success" },
    { id: "3", title: "Merged to main", timestamp: "12m ago",
      description: "Squash + merge by @oscar", status: "success" },
  ]}
/>
```

The connector line and indicator are `aria-hidden` so meaning travels entirely in the title/timestamp/description text. No `aria-current` — events are historical, not navigational. `size="sm" | "md"` controls the indicator size.

Five tests cover the `<ol>` + `aria-label` shape, surfaced text content, custom icon override, last-event has-no-connector layout, and the `aria-hidden` discipline on the visual rail.

Registry rebuilt: 54 → 55 components. Theme D pain-point P-034 closed.
