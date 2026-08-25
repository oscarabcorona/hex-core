---
"@hex-core/themes": patch
---

Generate the brief-loader map instead of hand-writing 71 `switch` arms.

`loadThemeBrief` is unchanged for callers. Imports stay static so esbuild
keeps code-splitting each brief out of the main chunk.
