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

## Screens

The v0 demo is mapped step by step in `docs/v0-reference.md` (copy, mock data, port decisions).
Mock tenant data lives in `src/app/data/meridian.ts`. Built so far:

- Shell (`src/app/shell/`): dark module sidebar (Privacy Rights Automation) and tenant top bar.
  Routes without a page render `pages/placeholder.ts`.
- `/setup`: Setup landing (agent-led or manual setup, program overview, configurations).
- `/setup/agent`: Privacy Agent conversation (`oc-assistant-thread`) with a steps rail. The agent's
  turns are scripted in `STAGES` and streamed word by word with `[ocStream]`; anything the user sends
  (or a suggestion / block button) moves to the next stage. Ends with a link to `/setup/flow`.

Not built yet: `/setup/flow`, `/setup/workflows`, `/intake`, `/requests/4207` (+ `/subtask`,
`/redaction`), `/report` (page images are in `public/report-pages/`), `/dashboard`.

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
- If the dev server logs `NG0203: inputFunction() can only be used within an injection context`
  right after a new OneCore entry point is first imported, Vite re-bundled its deps mid-session;
  reload the page (or stop the server and delete `.angular/cache`).
- AI conversation UI: `oc-assistant-*` components, with `[ocStream]` (needs
  `provideChoreography()`, already registered).

## Git

Kevin pushes from GitHub Desktop; command-line git has no GitHub credentials. Confirm before any
push, and after each commit remind him to Push origin.
