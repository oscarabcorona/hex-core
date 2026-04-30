# Release process

Hex Core has two release paths:

1. **Default — CI release via GitHub Actions** (uses OIDC trusted publishing + npm provenance, no long-lived token).
2. **Fallback — manual local publish** via `scripts/publish-local.sh` (kept for emergencies when CI is unavailable).

Both paths use [Changesets](https://github.com/changesets/changesets) for versioning + per-package CHANGELOG generation.

## Adding a changeset

Every PR that changes a published package should include a changeset:

```bash
pnpm changeset
```

The CLI asks:

1. **Which packages** are affected (space to select, enter to confirm)
2. **Bump type** per package: `patch` / `minor` / `major`
3. **Summary** — one line that lands in `CHANGELOG.md`

It writes `.changeset/<random-name>.md`. Commit it with the rest of your PR.

## Default: CI release via GitHub Actions

Workflow: [`.github/workflows/release.yml`](./.github/workflows/release.yml).

**Trigger:** `workflow_dispatch` only (manual). The maintainer triggers each release run from the Actions tab. This is intentional for the initial roll-out — it lets us configure npm Trusted Publishers before the first publish attempt and avoids surprise releases from unrelated `main` merges. Flip to `push: [main]` in a follow-up PR once the first CI release has succeeded.

Two-phase flow driven by [`changesets/action`](https://github.com/changesets/action):

1. **While `.changeset/*.md` files exist on `main`:** the workflow opens (or updates) a `chore: version packages` PR that consumes the changesets, bumps versions, and regenerates `CHANGELOG.md` files. Review and merge that PR when you're ready to release.
2. **When the version PR is merged (no changesets remain):** trigger the workflow again from Actions → Release → Run workflow. It executes `pnpm changeset publish`, which publishes every changed package to npm with provenance attestation (`NPM_CONFIG_PROVENANCE=true`) signed via OIDC.

No `NPM_TOKEN` secret is configured — auth happens at publish time via the GitHub OIDC token.

### One-time setup: npm Trusted Publisher

For each `@hex-core/*` package, configure a trusted publisher on npmjs.com **once**:

1. Go to `https://www.npmjs.com/package/<pkg>/access`
2. Trusted publishers → Add → GitHub Actions
3. Repository: `oscarabcorona/hex-core`
4. Workflow: `.github/workflows/release.yml`
5. Environment: *(leave blank)*

Packages to configure: `@hex-core/registry`, `@hex-core/tokens`, `@hex-core/themes`, `@hex-core/components`, `@hex-core/cli`, `@hex-core/payload`, `@hex-core/mcp`, `@hex-core/preview`.

After this, every CI release is signed with provenance and visible on each package's npm page under "Provenance".

## Fallback: manual local publish

Use only when CI is unavailable. Releases will not carry provenance.

```bash
# 1. Consume changesets locally
pnpm run version

# 2. Review + commit the version bumps
git diff
git add -A
git commit -m "chore(release): version packages"
git push origin main

# 3. Publish to npm
export NPM_TOKEN=npm_xxx   # granular token, R/W to @hex-core scope
./scripts/publish-local.sh
```

The script:

- Validates `NPM_TOKEN`, working-tree state, and current branch
- Creates a temporary `.npmrc` (auto-cleaned on exit; git-ignored)
- Verifies auth via `npm whoami`
- Builds all `@hex-core/*` packages
- Publishes in dependency order (`registry → tokens → themes → components → cli → payload → mcp-server → preview`)
- **Skips versions already on npm** (idempotent — safe to re-run if one package fails mid-way)
- Prints a summary with npm URLs

Flags:

- `--dry-run` — simulate without publishing
- `--yes` / `-y` — skip confirmations (non-interactive)

### Required access (manual path)

Your npm account must be an **Owner** of the `hex-core` org (https://www.npmjs.com/settings/hex-core/members).

Generate a **Granular Access Token** at https://www.npmjs.com/settings/~YOUR_USER/tokens with:

- Packages and scopes: **Read and write** on **All packages**
- Organizations: **Read and write** to `hex-core`
- Bypass 2FA: ✓
- Expiration: 90 days (npm's cap for write tokens)

## Troubleshooting

- **CI release didn't publish** — check that the version PR was merged AND that no `.changeset/*.md` files remain on `main` other than `config.json` and `README.md`.
- **CI publish fails with `OIDC token exchange failed`** — Trusted Publisher isn't configured for that package on npmjs.com. See "One-time setup" above.
- **`npm whoami` fails (manual path)** — token expired or missing write permission. Regenerate at npmjs.com.
- **404 on publish (manual path)** — token doesn't have scope write access OR your npm account isn't an owner of the `hex-core` org.
- **`pnpm run version` says "No unreleased changesets"** — no files in `.changeset/` beyond `config.json` and `README.md`. Add one with `pnpm changeset`.
