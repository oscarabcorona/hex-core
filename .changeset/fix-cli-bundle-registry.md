---
"@hex-core/cli": patch
---

fix(cli): bundle registry into npm tarball + rewrite imports to alias paths

Resolves the post-init install wall: `hex add` now writes import-correct files into
the consumer's `components/ui/` directory (alias-rewritten, no `.js` suffixes). The
registry tarball-bundled `prebuild` step lets `hex list` / `hex add` work outside
the monorepo. `hex doctor` reports install invariants (Tailwind major, peer deps,
hex.config.json, lib/utils, globals.css shape).

Backfill changeset for PR #88 (`fix: collapse the post-init install wall…`,
commit `0729f38`) — the PR shipped the fixes but no changeset, so cli has been
sitting on main without a release path.
