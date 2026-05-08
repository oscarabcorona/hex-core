# @hex-core/regression — use-case regression suite

Post-publish gate that bootstraps fresh consumer projects, pulls
`@hex-core/*@latest` from the npm registry, and exercises every canonical
adoption flow (`hex init`, `hex add`, `hex recipe add`, `hex theme apply`,
`hex migrate`, `hex doctor`, `hex skills install`, plus MCP tool
round-trips and heavy-peer flows). Failures are graded by severity and
written to `.claude/findings/regression-<YYYY-MM-DD>.md` for maintainer
review.

## When to run it

Run **after** `publish-local.sh` lands the tarballs on npm, **before**
tagging the GitHub release. Failures block the tag.

```bash
# Full pre-tag flow
pnpm regression:full     # ~10 min a11y + visual, then ~45 min consumer suite

# Just the consumer suite (this directory)
pnpm regression:use-cases
```

Not wired to CI — total runtime exceeds the 5-min CI timeout, and per
project memory regression stays local-only.

## Structure

```
tests/regression/
├── package.json            # private workspace
├── vitest.config.ts        # serial runner, 5-min timeout
├── scripts/run.ts          # orchestrator + findings doc emit
└── src/
    ├── runners/            # bootstrap, install, assert, mcp-client, finding
    ├── fixtures/hosts/     # 4 framework templates (Next App/Pages, Vite, CRA)
    └── use-cases/
        ├── cli/            # 7 files, ~33 cases
        ├── mcp/            # contract round-trips
        ├── heavy-peers/    # xterm/mermaid/reactflow/wavesurfer/d3-chord
        └── hosts/          # per-host smoke
```

## Hosts

Every host fixture is a minimal scaffold (no `node_modules`). The
bootstrap helper copies it into a tmpdir, runs `npm install` once
(`--no-audit --no-fund`, ~30s), then becomes the cwd for the test's
`pnpm dlx @hex-core/cli` invocations.

| Fixture | Framework |
|---|---|
| `next-app-src/` | Next.js 16 App Router, `--src-dir` layout, Tailwind v4 |
| `next-pages-src/` | Next.js 16 Pages Router, `--src-dir` layout |
| `vite-react/` | Vite 6 + React 19 + Tailwind v4 (`@tailwindcss/vite`) |
| `cra/` | Create React App (`react-scripts@5`), Tailwind v3 |

## Filters

`scripts/run.ts` forwards the first positional arg to vitest as a path
filter. Vitest also accepts `-t <name>` for test-name filters.

```bash
pnpm regression:use-cases -- src/use-cases/cli/init.test.ts
pnpm regression:use-cases -- -t "default theme"
pnpm regression:use-cases -- src/use-cases/mcp
```

## Findings doc

Each run writes (or overwrites) `.claude/findings/regression-<date>.md`
with:

- Run header (date, duration, pass/fail/skip counts).
- Severity-graded failure list (`Blocker` / `High` / `Medium` / `Low`).
  Severity is heuristic — see `src/runners/finding.ts:classifySeverity`.
- Pass list with per-case duration.
- Skipped list (if any).
- Environment summary: Node version, pnpm version, the `@hex-core/*`
  versions resolved from npm at run start.

The shape mirrors `.qa/spec-driven-layer-findings.md` so review is
consistent across all internal QA outputs.

## Adding a new use case

1. Pick the right group: `cli/`, `mcp/`, `heavy-peers/`, or `hosts/`.
2. Create or extend a `*.test.ts`. Each `it(...)` block should:
   - Bootstrap a host (`bootstrapHost` + `makeTmpDir`).
   - Run `runHexCli(cwd, ["<cmd>", "<args...>"])`.
   - Assert with `assertFileExists` / `assertFileContains` / `assertProcessOk` / `assertNoUnresolvedImports`.
3. Use `--no-install` whenever possible — keeps the suite fast. Tests
   that specifically validate auto-install (heavy-peer prompt path) can
   omit it but should set their own timeout via `runHexCli(opts)`.
4. Run the new test in isolation:
   ```bash
   pnpm regression:use-cases -- src/use-cases/<group>/<your>.test.ts
   ```

## Limitations (v1)

- Interactive prompt path (heavy peers' `y/N` prompt) is not exercised —
  the suite only covers `--no-install`. v2 will wire a TTY-PTY for the
  prompt branch.
- No browser-driven smoke (does the rendered Button visually look right
  after `hex add` + `pnpm dev`?). Today the suite stops at "command
  succeeded + import resolves"; visual confirmation stays in the
  existing `pnpm regression` a11y/visual layer.
- Failures are classified by message-substring heuristic. Edge cases may
  end up in the wrong severity bucket; the maintainer can re-grade in
  the doc by hand.
