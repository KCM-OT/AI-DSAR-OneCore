# AI-assisted DSAR prototype on OneCore

Angular 21 prototype (standalone components, zoneless, SCSS, Vitest) for AI-assisted Data Subject
Access Request (DSAR) handling, built on OneTrust's OneCore design system (`@onetrust/onecore`,
pinned to 0.7.0, with `@angular/cdk` 21.1.6 and `ng-primitives` 0.131.0).

The starting point is an earlier prototype made in v0 (React/Next.js). Its screens are rebuilt here
with OneCore components; its code is a reference, not something to copy in.

## Run

- `npm start -- --port 4300` → http://localhost:4300 (4300 so it can run beside the RoPA OneCore
  app on 4200). The `.claude/launch.json` entry `ai-dsar-onecore` does this.
- `npm run build`, `npm test`
- Install with npm 11 (`npx npm@11 install`). npm 10.8 crashes with an `edgesOut` error on this
  dependency tree.
- `@onetrust/onecore` comes from OneTrust Nexus (configured in `~/.npmrc`) and is not on public
  npm, so hosts without Nexus access (for example Vercel) cannot install it. Deploy by building
  locally and uploading with `vercel deploy --prebuilt` (not set up yet).

## OneCore

- Docs ship in the package: `npx onecore list`, `npx onecore docs <component>`,
  `npx onecore rules`. The `onecore` MCP server in `.mcp.json` serves the same docs. The hosted
  Storybook needs a GitLab sign-in, so read the bundled docs instead.
- Import from per-component entry points (`@onetrust/onecore/button`), never the package root.
- Foundation styles load in `src/styles.scss` with `@use 'foundation/styles'`, resolved through
  `stylePreprocessorOptions.includePaths` in `angular.json` (the package exports hide foundation/).
- Icons are tree-shaken: register each one in `provideOcIcons` in `src/app/app.config.ts`, importing
  from `@onetrust/onecore/icon`. An unregistered icon renders nothing. In buttons, put the icon in
  `slot="leading"` or `slot="trailing"`.
- Style with `--oc-*` tokens only. `--oc-muted` is dark; for light surfaces use `--oc-secondary`
  or `--oc-secondary-light-hover`.
- OneCore has no table, side nav or page header component. Build those from native HTML styled with
  tokens (the RoPA OneCore app at `~/Documents/privacy/RoPA/ropa-onecore` has working examples:
  `.data-table` in its `styles.scss`, and its `shell/` sidebar).
- AI conversation UI: `oc-assistant-*` components, with `[ocStream]` (needs
  `provideChoreography()`, already registered).

## Git

Kevin pushes from GitHub Desktop; command-line git has no GitHub credentials. Confirm before any
push, and after each commit remind him to Push origin.
