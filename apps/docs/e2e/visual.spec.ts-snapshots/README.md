# Visual regression baselines

These PNGs are the source of truth for the visual regression spec at
[`../visual.spec.ts`](../visual.spec.ts). One baseline per component
slug × theme (`light`, `dark`) × platform (`darwin`, `linux`).

## When to update

Whenever a change intentionally shifts how a component renders — token
edit, CSS refactor, demo rewrite, dependency upgrade. Update both
platforms or the next CI run will fail on the platform you skipped.

## Refresh on darwin (your laptop)

```bash
pnpm --filter docs test:visual:update
```

Generates `*-chromium-darwin.png`.

## Refresh on linux (matches CI's ubuntu runner)

The CI runner is x86_64 Ubuntu; rendering differs from darwin enough
that the per-platform suffix is necessary. Use the official Playwright
Docker image to regenerate locally:

```bash
docker run --rm --network host \
  -v "$(pwd)":/host:ro \
  -v "$(pwd)/apps/docs/e2e/visual.spec.ts-snapshots":/snapshots \
  -w /work \
  mcr.microsoft.com/playwright:v1.59.1-jammy bash -c '
    set -e
    corepack enable pnpm
    cp -r /host/. /work/
    rm -rf /work/node_modules /work/apps/*/node_modules /work/packages/*/node_modules
    cd /work
    pnpm install --frozen-lockfile
    pnpm --filter @hex-core/components build
    pnpm --filter docs build
    cd apps/docs
    CI=1 pnpm exec playwright test e2e/visual.spec.ts --update-snapshots
    cp e2e/visual.spec.ts-snapshots/*-chromium-linux.png /snapshots/
  '
```

## When CI fails on visual diff

The workflow uploads `apps/docs/playwright-report/` as the
`playwright-report` artifact. Download, unzip, open `index.html`,
inspect the diff. If the change was intentional, run the refresh
commands above. If unintentional, fix the regression.
