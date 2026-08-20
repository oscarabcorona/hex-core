---
"@hex-core/components": patch
---

Fix `alert-dialog`'s `ai.relatedComponents` pointing at a non-existent `toast` slug — the catalog's toast item is `sonner`. Caught by the new graph build's dangling-edge validation.
