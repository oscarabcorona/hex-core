# Release process

Hex Core publishes manually from a maintainer's machine. There is no CI publish workflow — the tradeoff is a 30-second local command instead of debugging broken CI auth on every release.

## Tooling

- [Changesets](https://github.com/changesets/changesets) for versioning + CHANGELOG generation
- [`scripts/publish-local.sh`](./scripts/publish-local.sh) for the actual publish

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

## Cutting a release

When you're ready to publish accumulated changesets:

```bash
# 1. Consume changesets → bump versions + generate CHANGELOG.md files
pnpm run version

# 2. Review + commit the version bumps
git diff            # inspect version bumps and CHANGELOGs
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
- Builds all 8 `@hex-core/*` packages
- Publishes in dependency order (`registry → tokens → themes → components → cli → payload → mcp-server → preview`)
- **Skips versions already on npm** (idempotent — safe to re-run if one package fails mid-way)
- Prints a summary with npm URLs

Flags:

- `--dry-run` — simulate without publishing
- `--yes` / `-y` — skip confirmations (non-interactive)

## Required access

Your npm account must be an **Owner** of the `hex-core` org (https://www.npmjs.com/settings/hex-core/members).

Generate a **Granular Access Token** at https://www.npmjs.com/settings/~YOUR_USER/tokens with:

- Packages and scopes: **Read and write** on **All packages**
- Organizations: **Read and write** to `hex-core`
- Bypass 2FA: ✓
- Expiration: 90 days (npm's cap for write tokens)

## Provenance

Provenance is **not** attached to current releases because it requires OIDC from a CI/CD provider. To re-enable in the future:

- Option A: configure [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) per package (now that packages exist) and rebuild a CI workflow around it — no token needed.
- Option B: use `npm publish --provenance` from a GitHub Actions runner with `id-token: write` permission.

For now, releases are token-authenticated without provenance. Contributors can verify integrity via the published shasum + integrity hash in each release's npm page.

## Troubleshooting

- **`npm whoami` fails** — token expired or missing write permission. Regenerate at npmjs.com.
- **404 on publish** — token doesn't have scope write access OR your npm account isn't an owner of the `hex-core` org.
- **`pnpm run version` says "No unreleased changesets"** — no files in `.changeset/` beyond `config.json` and `README.md`. Add one with `pnpm changeset`.
- **Script skips a package** — that version is already on npm. Bump the version or delete the skip check for re-publishing (rarely needed; npm disallows republishing the same version anyway).
