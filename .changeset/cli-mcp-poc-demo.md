---
"@hex-core/cli": minor
"@hex-core/mcp": minor
---

`hex poc` and MCP `scaffold_poc` now produce an app that demos itself: one floating panel switching role (`viewer` / `member` / `admin`) and data state (with data / empty), both held in cookies so a selection survives clicking through the frames.

The generated `app/globals.css` also scopes Tailwind's content scan to the app's own directories. A POC is normally scaffolded inside an existing repository, where Tailwind's automatic detection walked up to the enclosing git root and read binary files as class candidates — every route 500'd with unparseable CSS until the scan was scoped.

Both changes arrive through the vendored payload builder, so no CLI or MCP code changed — but the generated output did. `scaffold_poc` responses grow roughly 36% (the harness plus the `empty` and `select` sources every tree now copies).
