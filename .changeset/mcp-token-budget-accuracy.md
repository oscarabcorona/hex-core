---
"@hex-core/mcp": patch
---

Report token budgets the tokenizer actually agrees with.

The registry build measured `ai.tokenBudget` with gpt-tokenizer 2.9.0 while
this server ran 3.4.0, so the budgets it reported to a model were counted by
a different tokenizer than the one doing the counting. Both are now pinned
to one version through the workspace catalog; 159 of 187 budgets moved by
roughly a percent, to the numbers this server measures.
