---
"@hex-core/components": minor
"@hex-core/payload": patch
---

DataTable migrates to `@tanstack/react-table` v9; `useAIChat` gains AI SDK v4 support.

**`@hex-core/components`** — **Breaking for `DataTable` consumers.** TanStack Table v9 is a feature-opt-in rewrite, not a drop-in bump: `useReactTable` is gone from the root export (now `useTable`), and `getCoreRowModel()` survives only on the `./legacy` subpath where it is marked `@deprecated`. Because `data-table.tsx` ships verbatim to consumers through `hex add`, half-migrating onto the legacy shim would push deprecated code out to users — so this goes to the real v9 API.

Two signature changes follow from v9's generics. `DataTableProps<TData>` now constrains `TData` to TanStack's `RowData` (an object or array shape), and `columns` takes v9's leading features generic:

```diff
-const columns: ColumnDef<Payment>[] = [ … ]
+import type { DataTableFeatures } from "@hex-core/components";
+const columns: ColumnDef<DataTableFeatures, Payment>[] = [ … ]
```

The new `dataTableFeatures` / `DataTableFeatures` exports name the registered feature set. Registration is load-bearing under v9: `rowSelectionFeature` backs `row.getIsSelected()` and `columnVisibilityFeature` backs `row.getVisibleCells()` — dropping either turns its call site into a compile error rather than a silent no-op. Sorting, filtering, and pagination remain opt-in; consumers compose their own feature set with `createSortedRowModel()` et al.

`@tanstack/table-core` is now a direct (optional) peer, since the component imports the feature modules from it.

`useAIChat` now accepts `@ai-sdk/react` v4 — the peer widens to `^3.0.0 || ^4.0.0`, so v3 consumers are unaffected. The v4 `useChat` contract was verified by mounting the real hook and asserting each field the adapter consumes (`status`, `messages`, `sendMessage`, `stop`, `regenerate`, `error`); the test suite mocks the SDK entirely and could not have caught a rename. Note v4 itself requires Node >= 22.

**`@hex-core/payload`** — `KNOWN_NPM_VERSIONS` re-pinned for scaffolded POC projects: `@tanstack/react-table` moves to `^9.2.4`, `@tanstack/table-core` is added, and the radix ranges advance with the monorepo. These pins are what keep `hex poc` off `latest`, which is how a react-table major broke the data-table POC once before.
