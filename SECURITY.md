# Security Policy

## Reporting a vulnerability

If you find a security issue in any Hex Core package, please **do not open a public issue**. Instead, open a [GitHub Security Advisory](https://github.com/oscarabcorona/hex-core/security/advisories/new) on this repo. We'll respond via the advisory thread within 72 hours.

Please include:

- Which package (`@hex-core/components`, `@hex-core/cli`, `@hex-core/mcp`, etc.)
- A minimal reproduction
- Impact assessment (who's affected, what access / data the exploit exposes)
- Your preferred disclosure timeline

## What we consider in scope

- Remote code execution via the CLI (`hex add`, `hex init`)
- MCP server tool-call escalation (path traversal, arbitrary file read/write)
- Supply-chain issues in our published npm packages
- XSS in the docs site (`hex-core.dev`)

## What we consider out of scope

- Issues in consumer apps using copied components (you own the code after `hex add`)
- Vulnerabilities in upstream dependencies that have no patched version (we'll track them, but please file upstream)
- Denial-of-service from running the CLI on adversarial workspaces

## Response

We'll acknowledge receipt within 72 hours and aim to issue a patched release within 14 days for high-severity issues.

Thanks for helping keep Hex Core safe.
