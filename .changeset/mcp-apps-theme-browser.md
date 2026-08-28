---
"@hex-core/mcp": minor
---

MCP Apps (SEP-1865) support: `list_themes` now declares an interactive theme browser via `_meta.ui.resourceUri`, served as the self-contained `ui://hex-core/theme-browser.html` resource. Hosts that support MCP Apps (Claude, ChatGPT, VS Code) render a palette-previewing theme picker; the tool's text output — and every token ceiling — is unchanged, since the HTML travels over `resources/read`, never through tool results.
