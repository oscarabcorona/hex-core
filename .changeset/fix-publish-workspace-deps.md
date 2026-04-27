---
"@hex-core/registry": patch
"@hex-core/tokens": patch
"@hex-core/components": patch
"@hex-core/cli": patch
"@hex-core/mcp": patch
---

Fix: published tarballs now correctly pin workspace dependencies.

Previous releases of `@hex-core/components`, `@hex-core/cli`, and `@hex-core/mcp` shipped `"@hex-core/registry": "workspace:^"` literal in the tarball's `dependencies`, breaking every consumer outside a pnpm workspace with `npm error code EUNSUPPORTEDPROTOCOL`. `@hex-core/tokens` shipped a similar literal for its registry dependency.

Root cause: `scripts/publish-local.sh` used `npm publish`, which uploads tarballs as-is. Switched to `pnpm publish`, which rewrites `workspace:^` → pinned `^X.Y.Z` automatically.

`@hex-core/registry` has no workspace dependencies and was not affected, but is bumped to keep the family in lockstep and simplify the release narrative.

After this release, `npm install @hex-core/components` (and the other published packages) succeeds in any consumer project regardless of package manager.
