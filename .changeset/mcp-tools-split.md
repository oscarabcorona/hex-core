---
"@hex-core/mcp": patch
---

Split the server entry point into one file per tool.

`src/index.ts` was 1,312 lines with all nineteen `registerTool` calls inline;
it is now 27 lines that wire a manifest to a transport, and each tool owns a
file under `src/tools/` declaring its own dependencies. No tool schema,
description or behaviour changed — the contract suite passes unchanged.
