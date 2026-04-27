---
"@hex-core/tokens": patch
"@hex-core/components": patch
---

Fix: full rollback of the v1.0.2 light-theme contrast bumps. Restore canonical Button/Badge hover.

The v1.0.2 release pushed `--secondary`, `--border`, and `--input` to L=58% to satisfy strict WCAG 2.1 SC 1.4.11 (3:1 against the white `--card`). On the live docs site this rendered:

- Secondary buttons as heavy mid-gray pills (finding #14)
- Card frames, Tabs, Input borders, and surrounding chrome with a clearly-visible mid-gray that made every framed surface look heavier than the components inside

The strict reading was correct on paper but produced a layout that real users described as "awful." This PR reverts all three light-theme tokens to their original values:

- `--secondary` light: 58% → **95.9%**
- `--border` light: 58% → **90%**
- `--input` light: 58% → **90%**

It also restores the canonical `hover:bg-secondary/80` on Button and Badge `secondary` variants — at the lighter fill, the 80%-alpha-over-white composite is the gentle subtle-darken hover (vs the L=58% version which would composite below 3:1).

**WCAG trade-off**

`--border` and `--input` at L=90% give ~1.27:1 against the white `--card`, failing strict SC 1.4.11. The team accepts this trade-off because:

- **Filled controls (Secondary button, Badge):** the near-black `--secondary-foreground` text gives ~16:1 contrast against the L=95.9% fill — that perceivable cue carries the boundary identification.
- **Framed surfaces (Card, Popover, Dialog):** shadow elevation provides perceivable affordance independent of border color.
- **Form-control borders (Input, Switch off-state):** these remain the legitimate residual concern; consumers who need strict 1.4.11 compliance can override the three tokens at `:root`. Tracked as a longer-term design decision rather than a hidden bug.

`--muted-foreground` (L=38%) and the dark-mode values are unchanged. Finding #12 (the original Outline-button-invisible report) is intentionally re-opened in the findings tracker as a known trade-off rather than a closed bug.

**Other changes carried along:**

- Three inline copies of the default light theme (mcp-server theme-loader, docs theming snippet, docs installation snippet) sync to the rolled-back values.
- `Spacer` JSDoc — removed `h-[var(...)]` and `w-[var(...)]` literal examples from the comment block; Tailwind v4's content scanner was attempting to compile them as actual CSS classes and failing PostCSS with `Unexpected token Delim('.')`. No runtime/API change.
- Registry items for `button` and `badge` regenerate to reflect the restored `hover:bg-secondary/80` source.
