---
"@hex-core/components": minor
"@hex-core/cli": minor
"@hex-core/registry": minor
---

feat(ai): 5 new AI Elements components + CLI heavy-peer prompt

Closes the AI Elements parity gap from 13/40 → 18/40 by adding the Code, Voice, and Workflow categories. Each component is a thin headless wrapper around an opt-in engine declared as a heavy peer dep.

**New components (`@hex-core/components`):**

- **`Terminal`** — xterm.js wrapper. Headless data flow: pass `output` (diffed against prior render), receive typed bytes via `onInput`. Peer: `@xterm/xterm@^5.5.0` (~150 KB gzip).
- **`Canvas`** — reactflow node-graph canvas for agent workflows / RAG document graphs. Default Background + Controls; slot for MiniMap and Panels. Peer: `reactflow@^11.11.0` (~80 KB gzip).
- **`AudioPlayer`** — wavesurfer.js playback control with play/pause + waveform progress + duration. Peer: `wavesurfer.js@^7.8.0` (~50 KB gzip, shared with AudioWaveform).
- **`AudioWaveform`** — standalone non-interactive waveform display for voice-message previews and recording indicators. Peer: `wavesurfer.js@^7.8.0`.
- **`Diagram`** — Mermaid renderer for AI-emitted flowcharts / sequence / class diagrams. Engine sanitizes SVG via `securityLevel: "strict"`. Peer: `mermaid@^11.0.0` (~700 KB gzip).

**CLI heavy-peer flow (`@hex-core/cli`):**

`hex add <component>` now detects heavy peer deps declared in the registry and prompts before installing. Single batched UX for multi-component installs:

```
This sprint installs 2 components with heavy peer dependencies:

  → @xterm/xterm@^5.5.0  (~150 KB gzip)  for terminal
     Renders the terminal grid + handles input/output
  → mermaid@^11.0.0      (~700 KB gzip)  for diagram

  Total: ~850 KB gzip added to your bundle.

Install now? [Y/n]:
```

`--yes` skips the prompt. `--no-install` prints the manual install command. Decline keeps the component source on disk so you can install the peer later.

**Schema (`@hex-core/registry`):**

New `dependencies.heavyPeer` array on `dependencySchema`: `{ name, version, bundleKbGzip?, reason? }[]`. Optional — existing schema files don't need changes.

All 5 components ship as optional peers in `@hex-core/components/package.json` (peerDependenciesMeta.optional: true), mirroring the existing pattern for vaul/sonner/cmdk.
