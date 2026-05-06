# @hex-core/registry

[![npm](https://img.shields.io/npm/v/@hex-core/registry.svg)](https://www.npmjs.com/package/@hex-core/registry)
[![downloads](https://img.shields.io/npm/dm/@hex-core/registry.svg)](https://www.npmjs.com/package/@hex-core/registry)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/oscarabcorona/hex-core/blob/main/LICENSE)

Zod schemas + TypeScript types for the Hex Core component registry.

This package is the **shared contract** between `@hex-core/components`, `@hex-core/cli`, and `@hex-core/mcp`. It doesn't ship runtime UI — it's schemas describing what a component is (props, variants, examples, AI hints).

## Install

```bash
pnpm add @hex-core/registry
```

## Usage

```ts
import { RegistryItemSchema, type RegistryItem } from "@hex-core/registry/schema";

const result = RegistryItemSchema.safeParse(json);
if (result.success) {
  const item: RegistryItem = result.data;
  // …
}
```

## Intent metadata (0.4.0+)

The schemas describe **shape** AND **intent** so LLMs can pick the right component without guessing from training-data heuristics.

### Per-variant `useWhen`

```ts
{ value: "destructive",
  description: "Red button with shadow for dangerous actions",
  useWhen: "irreversible actions: delete, archive, deactivate, leave, force-quit" }
```

### Structured anti-patterns

`aiHintSchema.antiPatterns` complements the free-form `commonMistakes` with a typed channel that names a registry slug to redirect to:

```ts
{ mistake: "Using a Slider with min=0/max=1 to represent on/off",
  insteadUse: "switch",
  why: "Slider semantics are 'continuous range' — assistive tech announces step values, not on/off." }
```

The `insteadUse` field MUST be a registry slug, so `@hex-core/mcp`'s `describe_intent` tool can follow the link and return the suggested alternative as a real registry entry rather than free text.

### Composition-tagged examples

`usageExampleSchema.composition?: string[]` tags the surrounding context an example demonstrates (`["dialog", "destructive", "confirm"]`, `["form", "form-action"]`). MCP's `search_compositions` ranks examples by tag overlap so a query like `["destructive", "confirm"]` returns the canonical AlertDialog-with-delete-Button example instead of a bare `<Button variant="destructive">`.

### Semantic tokens

`semanticTokenSetSchema` (paired with `defaultSemanticTokens` in `@hex-core/tokens`) is the intent layer over raw tokens:

```ts
"button.destructive.bg": {
  value: "{color.destructive}",
  useWhen: "irreversible actions",
  type: "color"
}
```

LLMs asked "what's the right token for a delete button background" reach for `button.destructive.bg` instead of guessing `bg-red-500`.

## Notes

Most users of Hex Core never touch this package directly. If you're building a custom tool that reads the registry JSON (`registry/registry.json` in the repo, or `/registry.json` on the docs site), this is your source of truth for the schema.

## Docs

[hex-core.dev](https://hex-core.dev)

## License

MIT
