# AI-assisted DSAR prototype on OneCore

Angular 21 prototype (standalone components, zoneless, SCSS, Vitest) for AI-assisted Data Subject
Access Request (DSAR) handling, built on OneTrust's OneCore design system (`@onetrust/onecore`,
pinned to 1.0.1, with `@angular/cdk` 21.1.6; OneCore brings its own `ng-primitives`, so don't add
it to `package.json`).

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

- Shell (`src/app/shell/`): left navigation from the DSR 2026 Figma file
  (https://www.figma.com/design/TsBLUuUoHuzy2DyMuN7NuY/DSR-2026?node-id=464-15550), with the
  groups "Privacy Rights: DSAR" and "Workspaces", a user block, and a collapse toggle; plus the
  tenant top bar. The sidebar sets `data-mode="dark"`, so it uses dark-mode `--oc-*` tokens. Its
  links are in `shell/nav.ts`. Chat opens the Chat workspace menu (Figma node 467:17316: back,
  New chat, All chats, and the chat list from `CHAT_THREADS`): the two menus sit on a track that
  slides left, while the header and user block stay put. Any `/chats` URL opens it. Figma assets
  with no OneCore icon (logo, chat glyph, activity dots, user chevron) are in `public/nav/`.
  Routes without a page render `pages/placeholder.ts`.
- `/setup`: Setup landing (agent-led or manual setup, program overview, configurations).
- `/setup/agent`: Privacy Agent conversation (`oc-assistant-thread`) with a steps rail. The agent's
  turns are scripted in `STAGES` and streamed word by word with `[ocStream]`; anything the user sends
  (or a suggestion / block button) moves to the next stage. Ends with a link to `/setup/flow`.

- `/chats`: Chat home, the Privacy Agent's start screen. Its layout follows the AI Governance
  "Corie" home (https://rod-aig-uat.vercel.app/rod/aig/ai-gov/corie/, right-hand content only):
  - greeting
  - composer with request-type and source scope menus
  - shortcuts
  - tabs: High priority tasks / You left open / Privacy Agent handled
  Content is in `src/app/data/chat-home.ts`. The main action is finishing the Privacy Agent setup:
  the first shortcut and the first task card both link to `/setup/agent`. Sending a prompt opens
  `/chats/new`, which is a placeholder for now.

Not built yet: `/setup/flow`, `/setup/workflows`, `/intake`, `/requests/4207` (+ `/subtask`,
`/redaction`), `/report` (page images are in `public/report-pages/`), `/dashboard`.

## OneCore

- Docs ship in the package: `npx onecore list`, `npx onecore docs <component>`,
  `npx onecore rules`. The `onecore` MCP server in `.mcp.json` serves the same docs. Guides are
  on the hosted Storybook (for example the Angular setup guide at
  https://onecore.1trust.app/iframe.html?id=guides-engineers-angular-setup--docs&viewMode=docs).
- Upgrade with `npx onecore upgrade-guide`: bump the version, install with npm 11, then run
  `npx ng update @onetrust/onecore --migrate-only --from=<old> --to=<new> --allow-dirty` (plain
  `ng update` would install with npm 10.8). Work through `onecore-upgrade-report.md`, then delete it.
- Import from per-component entry points (`@onetrust/onecore/button`), never the package root.
- Foundation styles load in `src/styles.scss` with `@use '@onetrust/onecore/foundation/styles' as oc`
  and `@include oc.base` on `html`.
- Icons are tree-shaken: register each one in `provideOcIcons` in `src/app/app.config.ts`, importing
  from `@onetrust/onecore/icon`. An unregistered icon renders nothing. In buttons, put the icon in
  `slot="leading"` or `slot="trailing"`.
- Style with `--oc-*` tokens only, including font weights (`--oc-font-weight-emphasis`, not `500`).
  `--oc-muted` is dark; for light surfaces use `--oc-secondary` or `--oc-secondary-light-hover`.
- Since 1.0 OneCore has `oc-data-grid` (tables), `oc-tabs`, `oc-drawer`, `oc-stepper`,
  `oc-breadcrumbs`, `oc-alert` and `oc-toast`: use them for the remaining screens. It still has no
  side nav or page header component; those are native HTML styled with tokens (`src/app/shell/`).
- If the dev server logs `NG0203: inputFunction() can only be used within an injection context`
  right after a new OneCore entry point is first imported, Vite re-bundled its deps mid-session;
  reload the page (or stop the server and delete `.angular/cache`).
- AI conversation UI: `oc-assistant-*` components, with `[ocStream]` (needs
  `provideChoreography()`, already registered).

## Git

Kevin pushes from GitHub Desktop; command-line git has no GitHub credentials. Confirm before any
push, and after each commit remind him to Push origin.
