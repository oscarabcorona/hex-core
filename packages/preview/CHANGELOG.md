# @hex-core/preview

## 0.2.0

### Minor Changes

- 22d9416: Initial release. Exports `<DemoSurface>` — the elevated container recipe (`bg-muted/30` + subtle inner shadow) used by the official Hex UI docs preview wrapper, packaged for downstream consumption.

  Hex UI components are tuned to read against a Card-elevated surface; on flat pages they appear washed out. Wrap any demo in `<DemoSurface>` to get the same elevated context the docs site uses, without copying markup.

  ```tsx
  import { DemoSurface } from "@hex-core/preview";
  import { Button } from "@hex-core/components";

  <DemoSurface>
  	<Button variant="outline">Visible on white pages</Button>
  </DemoSurface>;
  ```

  Peer deps: react ^18 || ^19. No runtime dependencies on `@hex-core/components`.
