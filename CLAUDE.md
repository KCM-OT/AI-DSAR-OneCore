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
  npm, so hosts without Nexus access (for example Vercel) cannot install it.

## Deploy

`npm run deploy:preview` or `npm run deploy` (production). Each runs `vercel build` locally, where
Nexus is reachable, then uploads with `vercel deploy --prebuilt`.
- Vercel project: onetrustpmux-v0/ai-dsar-onecore, set to Node 24.x in the project settings.
  Production: https://ai-dsar-onecore.vercel.app (public; no Vercel sign-in needed).
- The GitHub repo is deliberately not connected, so pushing to GitHub does not deploy. A
  Vercel-side build would fail without Nexus.
- `vercel.json` rewrites every path to `index.html` so deep links work.
- Preview deployments sit behind Vercel Authentication, so viewers sign in to Vercel. `vercel curl <path>
  --deployment <url>` checks one from the command line.
- `.vercel/` and `.env*` (the Vercel OIDC token) are git-ignored.

## Screens

The v0 demo is mapped step by step in `docs/v0-reference.md` (copy, mock data, port decisions).
Mock tenant data lives in `src/app/data/meridian.ts`. Built so far:

- Shell (`src/app/shell/`): left navigation from the DSR 2026 Figma file
  (https://www.figma.com/design/TsBLUuUoHuzy2DyMuN7NuY/DSR-2026?node-id=464-15550), with the
  groups "Privacy Rights: DSAR" and "Workspaces", a user block, and a collapse toggle; plus the
  tenant top bar. Setup opens `/setup` and expands its sub-pages beneath it (`SETUP_LINKS`: Web
  forms, Workflows, Integrations, Response templates, Subtask templates, Redaction preferences, all
  placeholders under `/setup/…`); it stays expanded on any `/setup` page. The sidebar sets `data-mode="dark"`, so it uses dark-mode `--oc-*` tokens. Its
  links are in `shell/nav.ts`. Chat opens the Chat workspace menu (Figma node 467:17316: back,
  New chat, All chats, and the recent chats): the two menus sit on a track that
  slides left, while the header and user block stay put. Clicking Chat (or New chat) opens `/chat`. Any
  `/chat` or `/chats` URL opens the Chat menu, as does any link with router state
  `{ chatMenu: true }` (Setup's "Start with privacy agent" uses it, so `/setup/agent` opens with the
  Chat menu; the state survives reload). The menu lists pinned chats, then the three most recent,
  from `CHAT_THREADS` in `src/app/data/chats.ts`; the pinned Privacy Agent setup chat links to
  `/setup/agent`. Figma assets with no OneCore icon (logo, chat glyph, activity dots, user chevron) are
  in `public/nav/`. Routes without a page render `pages/placeholder.ts`.
- `/setup`: Setup landing (agent-led or manual setup, program overview, configurations).
- `/setup/agent`: Privacy Agent setup, laid out like the AI-assisted RoPA authoring page
  (https://ai-ropa-corie-onecore.vercel.app/ai-assisted-ropa): page header, then a narrow chat
  (30%) beside a wide workflow draft artifact (70%, `workflow-draft.ts`).
  - The agent's turns are scripted in `STAGES` and streamed with `[ocStream]`.
  - Each stage asks one question in a card docked above the composer: regulations in scope,
    documents, playbook rules, intake agents, systems. Every option starts selected. Typing a
    message accepts the current choices.
  - Each answer fills one of the draft's five sections (scope and deadlines, sources, playbook
    rules, intake channels, request paths). The section shows as updating for 1.2s and scrolls into
    view.
  - Request paths are one lane per request type, built from the chosen rules and systems; a type
    with no system shows "No system selected".
  - The artifact header toggles between **Workflow draft** (the sections) and **Flow chart**
    (`flow-chart.ts`, from the DSR 2026 Figma frame "workflow for vercel", node 187:3734).
    - The flow chart is laid out in code from the same answers: Intake → Verify identity →
      opt-out / access / deletion / correction branches (system groups, then the rule steps) →
      Generate response → Deliver.
    - Nodes from the latest answer get an accent outline and an "Updated" tag, and the canvas
      pans to them.
    - Zoom and pan icons are in `public/flow/`.
    - Request-type colours follow the Figma legend (`FLOW_TYPE_COLORS`).
  - When done, the draft is "Ready for review". There's no footer button.
  - Workflow data is in `src/app/data/workflow-draft.ts`, with steps that match the v0 flow chart.
- `/chat`: Chat home, the Privacy Agent's start screen, opened by Chat in the main menu. Its layout
  follows the AI Governance "Corie" home (https://rod-aig-uat.vercel.app/rod/aig/ai-gov/corie/, right-hand content only):
  - greeting
  - composer (the scope bar under it, with All requests, All sources and Prompt library, was removed
    on 2026-11-24; its options are still in `chat-home.ts` data)
  - shortcuts
  - tabs: High priority tasks / You left open / Privacy Agent handled
  Content is in `src/app/data/chat-home.ts`. The main action is finishing the Privacy Agent setup:
  the first shortcut and the first task card both link to `/setup/agent`. Sending a prompt opens
  `/chats/new`, which is a placeholder for now.

- `/chats`: All chats, laid out like the AI Governance "Corie" chats list
  (https://rod-aig-uat.vercel.app/rod/aig/ai-gov/corie/chats/, right-hand content only):
  - breadcrumb and title, with a count of chats and new replies
  - search, an All / New replies / Pinned filter, and a sort menu
  - one row per DSAR chat, showing its opening question, artifact and last activity
  - a row menu with Pin and Delete, which change only the local list

  Chats live in `src/app/data/chats.ts`. Rows open `/chats/<id>` (a placeholder); the pinned
  setup chat opens `/setup/agent`.
- `/command-center`: the privacy leader's home, laid out from Kevin's research-based spec:
  - global filters (date range, organization, request type, jurisdiction)
  - KPI health snapshot
  - Needs attention queue (with filter chips) beside Requests over time, a stacked monthly
    chart with a jurisdiction/source breakdown
  - pipeline, deadlines and team workload
  - an "Assigned to me" `oc-data-grid`
  - setup health, recent activity and saved views

  The data is in `src/app/data/command-center.ts`. The filters change only their labels.
  Request-type chart colours are fixed (Access blue, Deletion pink, Opt-out yellow, Correction
  purple, from `--oc-supportive-*`). That order passed the dataviz colour-blind validator; keep it.

Not built yet: `/setup/flow`, `/setup/workflows`, `/intake`, `/requests/4207` (+ `/subtask`,
`/redaction`), `/report` (page images are in `public/report-pages/`). The v0 `/dashboard` is now `/command-center`.

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
