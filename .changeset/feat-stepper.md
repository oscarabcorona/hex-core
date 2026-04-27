---
"@hex-core/components": minor
---

feat(components): add `Stepper` — linear progress for multi-step flows with per-step error state

`Stepper` is a semantic-HTML primitive for form wizards, onboarding, checkout, and any sequenced flow where the user needs to know where they are and what's next. shadcn has had two long-running discussions (#1422, #4276 — pain-point P-036) about adding one and never has.

The component renders an `<ol>` with the required `aria-label`, one `<li>` per step, and per-step status derived from the controlled `current` index — except when the consumer pins a step's `status` explicitly. The status union is `"complete" | "current" | "upcoming" | "error"`; `"error"` lets a wizard surface a validation failure on the current or a prior step without lying about its index.

```tsx
<Stepper
  aria-label="Checkout"
  current={2}
  steps={[
    { id: "cart", label: "Cart" },
    { id: "shipping", label: "Shipping", status: "error" },
    { id: "payment", label: "Payment" },
  ]}
/>
```

The current step's interactive child carries `aria-current="step"`. Completed steps prefix the label with a visually-hidden `"Completed: "`; error steps prefix `"Error: "` and set `aria-invalid="true"` on the indicator. When `onStepClick` is omitted the steps are non-interactive `<span>`s — no fake button roles. When provided, each step renders as a real `<button>` with focus-ring tokens; `step.disabled` no-ops the click.

`size="sm" | "md"` and `orientation="horizontal" | "vertical"` are CVA variants — the vertical layout flips the connector to a 1px column rather than a row. All theming hooks token-based (`--control-height-sm`, `--gap-md`, `--space-3`, `--space-1`, `--duration-normal` plus `primary`, `destructive`, `input`, `muted-foreground`, `ring` semantic tokens).

Six tests cover the `<ol>` + `aria-label` shape, `aria-current` on the current step + `Completed:` prefix on prior ones, the non-interactive `<span>` path, the interactive `<button>` path with disabled steps, the `status="error"` override + `aria-invalid`, and the vertical orientation root class.

Registry rebuilt: 53 → 54 components. Theme D pain-point P-036 closed.
