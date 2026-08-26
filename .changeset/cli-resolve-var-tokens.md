---
"@hex-core/cli": patch
---

Resolve `var()` indirection when parsing a `globals.css`.

`hex theme edit -i` annotates each token with its AA contrast, which needs
the colour rather than a pointer to it. A palette-backed theme writes
`--primary: var(--slate-900)` and puts the triplet on the ramp entry, so the
parser now follows the reference. Files that declare literals throughout are
unaffected.
