---
"@hex-core/cli": patch
---

`hex poc` now scaffolds app-shaped page recipes that compile. `hex poc --recipe app-page` previously emitted a route with an undefined `DataTable`, failing `next build`; screens composing `timeline`, `data-table`, `input-otp`, `stepper` or `canvas` were skipped or broken. The CLI picks this up through its vendored registry, so no CLI code changed — but the user-visible behaviour did.
