# v0 prototype reference

Source: https://dsr-trustweek-demo-v3.vercel.app (v0 / Next.js, "Meridian Brands — Privacy Rights").
Captured 2026-11-05 from the live deploy. The v0 source code was not available, so this is the
screen-by-screen map and copy used to rebuild the demo in OneCore.

The demo is a scripted TrustWeek story driven by a bottom "Prototype guide" strip of 41 steps
(arrow keys navigate). Persona: Amara (privacy lead, Meridian Brands). Data subject: Marcus Bell.

## App chrome

OneTrust shell: dark left sidebar "Privacy Rights Automation" (Dashboard, Reports, Subtasks, Setup ›,
Settings) and a top bar (Meridian Brands, search, "Ask Copilot", notifications, "Privacy Group"
org switcher, settings, avatar AR, help). The /intake page has no OneTrust chrome: it is the
requester-facing, brand-styled page (Northwind Outfitters).

## Step map

| # | Act · screen | Route | Step |
|---|---|---|---|
| 1 | Act 1 · Agent setup | /setup | Initial state |
| 2 | | /setup | Greeting + profile card |
| 3 | | /setup | Document request |
| 4 | | /setup | Uploads appear |
| 5 | | /setup | Decomposed playbook |
| 6 | | /setup | Intake agent proposal |
| 7 | | /setup | Systems & integrations |
| 8 | | /setup | Handoff to flow chart |
| 9 | Act 1 · Generated flow chart | /setup/flow | Flow chart (interactive) |
| 10 | | /setup/flow | Agent escalates high-risk requests to Legal |
| 11 | Act 1 · Generated workflows | /setup/workflows | Workflows generated |
| 12 | Act 2 · Meridian intake agent | /intake | Initial state |
| 13 | | /intake | Identity autofilled |
| 14 | | /intake | Assistant exchange |
| 15 | | /intake | California note + submit |
| 16 | Act 3 · Request detail | /requests/4207 | Request tab, initial state |
| 17 | | /requests/4207 | Transition to Workflow tab (steps appear) |
| 18 | | /requests/4207 | Items 1–4 complete |
| 19 | | /requests/4207/subtask | Handoff to split screen |
| 20 | Act 3 · Agent collaboration | /requests/4207/subtask | Initial state |
| 21 | | /requests/4207/subtask | Agent asks in Teams |
| 22 | | /requests/4207/subtask | Daniel's question |
| 23 | | /requests/4207/subtask | Agent's answer |
| 24 | | /requests/4207/subtask | Extract returned |
| 25 | | /requests/4207/subtask | Systems synchronize |
| 26 | Act 3 · Redaction summary | /requests/4207/redaction | Awaiting privacy sign-off |
| 27 | | /requests/4207/redaction | Report ready |
| 28–36 | Act 3/5 · PDF report viewer | /report | Pages 1–9 (static PNGs at /report-pages/page-N.png) |
| 37 | Act 4 · Program dashboard | /dashboard | Dashboard overview |
| 38 | | /dashboard | Needs your attention |
| 39 | | /dashboard | Compare duplicate request |
| 40 | | /dashboard | Reject duplicate → learn prompt |
| 41 | | /dashboard | Confirm learn and auto-reject |

## Screens and copy

### /setup — landing (step 1)

Title "Setup". Subtitle: "Configure Data Subject Rights intake so your Privacy Agent can route,
resolve, and report on requests automatically."

- Card (RECOMMENDED) "Set up with Privacy Agent": "Answer a few guided questions and your AI Privacy
  Agent configures jurisdictions, data subject rights, response workflows, and templates for you -
  in minutes." Checks: Jurisdiction & regulation mapping · Request type recommendations ·
  Ready-to-edit workflow draft. Button "Start with privacy agent".
- Card "Set up manually": "Configure jurisdictions, data subject rights, and intake rules yourself
  using full control over every setting." Checks: Full control over every field · No AI-generated
  defaults · Best if you already have a plan. Button "Configure manually".
- Program overview KPIs: Jurisdictions configured 0 (None set up yet) · Request types enabled 0 of 12
  · Automation coverage --- (Available after setup) · Avg. resolution time --- (No requests processed).
- Configurations list, all "Not configured": Webforms (Public intake forms), Workflows (Routing &
  approvals), Integrations (Connected systems), Response templates (Notices & letters), Subtask
  templates (Internal task steps), Redaction preferences (Default rules).

### /setup — Privacy Agent conversation (steps 2–8)

Breadcrumb Setup › Privacy Agent. Title "Privacy Agent", subtitle "AI Assisted configuration for
jurisdiction, data subject rights, response templates, and workflows." Conversation on the left with
a composer ("Message to privacy agent goes here…", attach, "Send now"); right rail "Privacy intake
steps": 1 Research & identification · 2 Document upload · 3 Operational playbook · 4 Suggested
agents · 5 Integrations (each checks off as reached).

Agent turns, in order:

1. "Welcome, Amara. Before we set anything up, I researched Meridian Brands. Here's what I found —
   confirm or correct anything." Profile card: Brands (Northwind Outfitters, Cascade Home, Alpine
   Rewards) · Privacy regulations in scope (CCPA/CPRA (California), VCDPA (Virginia), CPA
   (Colorado), GDPR (Germany)) · Customer countries (United States, Germany, Austria) · Employees
   (United States, Germany).
2. "Next: the documents that describe how Meridian actually works. A DSAR procedure, retention
   policies, data flow diagrams, past response letters, brand guidelines — anything you'd hand a new
   privacy hire, hand to me."
3. Uploads: DSAR Standard Operating Procedure.pdf · Customer Data Flows.pdf · Response Letter
   Examples.docx · Meridian Brand + Tone Guide.pdf.
4. "I've read them. Here's your operating playbook as I understand it — this is the context I'll
   follow on every request." Each item cites its source:
   - PROCESS RULES: Access packages containing support transcripts: redact third-party personal
     information; privacy sign-off required before disclosure (SOP §4.2) · Identity verification
     required before any data handling (SOP §2.1) · Deletion holds: accounts with open disputes
     route to Legal (SOP §5.3).
   - DATA LANDSCAPE (Customer Data Flows): Customer records: Salesforce · Marketing profiles:
     Marketo · Support tickets + transcripts: Zendesk · Transactions + Alpine Rewards balances:
     internal warehouse (owner: Daniel Okafor).
   - VOICE & BRAND: Plain, warm, direct; short sentences; no legalese in body text (Brand + Tone
     Guide) · Loyalty program is always 'Alpine Rewards' (Brand + Tone Guide) · Response letters
     follow the Meridian letter structure (Response Letter Examples).
5. "Based on your brands and jurisdictions, I suggest four branded intake agents — structured request
   experiences that can also answer requesters' questions. One per consumer brand, one for
   employees." Cards: Northwind Outfitters, Cascade Home, Alpine Rewards (each Access · Deletion ·
   Correction · Opt-Out; CCPA/CPRA, VCDPA, CPA, GDPR), Meridian Employees (same types; CCPA/CPRA,
   GDPR). Button "Approve all four".
6. "To fulfill requests I'll work in your systems. Your data map and your data flow diagram agree on
   four: Salesforce, Marketo, Zendesk, and your internal warehouse…" (systems + integrations, then
   hands off to the flow chart).

### /setup/flow — generated flow chart (steps 9–10)

Breadcrumb Setup › Privacy Agent › DSAR Intake Workflow. Title "DSAR Intake Workflow", subtitle
"Data subject access request - intake path overview". Legend row: OPT-OUT (Suppress marketing
preferences across systems (e.g. Marketo)) · ACCESS (Retrieve, redact, and review personal data
before delivery) · DELETION (Delete data across all systems; route edge cases to legal) ·
CORRECTION (Update source records where data lives). Zoomable canvas (50%, zoom in/out, pan).

Graph: Intake (Branded intake agents) → Verify identity (Before any data handling) → branches:
- opt-out → Suppress marketing (Marketo)
- access → [Internal warehouse (Owner: Daniel Okafor), Customer records (Salesforce), Marketing
  profiles (Marketo), Support tickets & transcripts (Zendesk)] → Redact third-party personal
  information → Privacy sign-off: redactions → (step 10 adds) Escalate to legal (High-risk flags)
- deletion → [Delete records (Salesforce), Delete profiles (Marketo), Delete support data (Zendesk),
  Internal warehouse (Owner: Daniel Okafor)] → Route to legal (Accounts with open disputes)
- correction → Update source records (Where the data lives)
- all → Generate response → Deliver

"Ask the agent" panel (floating, bottom-right): "Ask me to update this workflow — try the suggestion
below, or type your own request." Suggestion: "Escalate flagged high-risk access requests to Legal".
Reply: "Done — I added an "Escalate to legal" step after the privacy sign-off, for high-risk access
requests flagged in review." Composer "Ask for a change…". (v0 misspells "Danial" in the chart.)

### /setup/workflows — generated workflows (step 11)

Title "Generated workflows", "Four request-type workflows, drafted from your flow chart. Review each
before publishing." Button "Review all". Table: Workflow · Request type · Subtasks · Steps · Status.

| Workflow | Request type | Subtasks | Steps | Status |
|---|---|---|---|---|
| Opt-out — Suppress marketing preferences across systems | Do Not Sell/Share, Opt-out of marketing | Suppress marketing preferences in Marketo | 1 | READY FOR REVIEW |
| Access — Retrieve, redact, and review personal data before delivery | Access / Know | Retrieve data from internal warehouse; Salesforce; Marketo; Zendesk | 6 | READY FOR REVIEW |
| Deletion — Delete data across all systems; route edge cases to legal | Delete | Delete data from Salesforce; Marketo; Zendesk; internal warehouse; Route legal-hold edge cases to Legal | 5 | READY FOR REVIEW |
| Correction — Validate, update, and confirm source records where data lives | Correct | Validate and update record in Salesforce; Marketo; Zendesk; Confirm corrected data with requester | 4 | READY FOR REVIEW |

### /intake — Northwind Outfitters intake agent (steps 12–15)

Requester-facing, brand-styled (cream background, Northwind logo, rust accent). Heading "Your data,
your call." Sub: "Ask us for a copy of your data, or ask us to delete it. We'll handle the rest."
Steps: Identify → Request → Confirm.

- Identify: Full name, Email, Where you live, Customer of (autofills "Alpine Rewards member").
  Continue. Footer: "Questions about your request? Ask here."
- Request: four choice cards — See my data (Get a copy of everything we have about you.) · Delete my
  data (Permanently erase your account and information.) · Fix my data (Correct something we got
  wrong.) · Stop marketing to me (No more marketing emails from us.). Submit.
- Assistant exchange (Delete selected): Q "If I delete my account, do I lose my loyalty points?"
  A "Yes — deleting your account permanently forfeits your Alpine Rewards balance (currently 12,480
  points), and we can't restore it later. If you'd like to see everything we have about you first —
  including your points history — you can request a copy of your data instead, and decide about
  deletion after." Button "Switch to "See my data"".
- After switch: "Changed to: See my data. You can request deletion any time after." WHY WE ASK:
  "Because you're a California resident, your report will include the categories of information we
  collect, where it comes from, why we use it, and who we share it with — along with the data itself.
  (CCPA/CPRA)" Submit.

### /requests/4207 — request detail (steps 16–18)

Breadcrumb Requests › AR-4207. Title "Data subject request details", status tag AGENT FULFILLING.
Header actions: Results summary, overflow. Left summary column: Data subject Marcus Bell · Request
type Access request · Jurisdiction California, US (CCPA/CPRA tag) · Received Jul 8 · Deadline 41
days remaining · Preferred language English (US) · "Fulfilled by Privacy Agent". Tabs: Workflow ·
Activity · Request.

- Request tab: Request ID AR-4207 · Data subject Marcus Bell · Email marcus.bell@—mail.com ·
  Customer ID C-102-448-871 · Request type Access request · Jurisdiction California, US (CCPA/CPRA) ·
  Received Jul 8 · Alpine Rewards 12,480 points · Member since Mar 14. Red alert "Suspected Agent
  Detection": Risky IP from submission 203.142.65.87 (Last seen: Recently flagged) · Multiple
  requests from IP 12 requests (Past 7 days) · Rate of submission 1.7 per day (Unusual pattern).
- Workflow tab: "Workflow · selected from Generated workflows" — Access / Access / Know, "Retrieve,
  redact, and review personal data before delivery", IN PROGRESS. Stage path: Open · Processing ·
  Review · Exceptions · Complete. "Step N of 6". Steps, each with system + source citations and a
  status (RUNNING / DONE + timestamp / AWAITING HUMAN):
  1. Verify identity — ID verification · CCPA §1798.130 · SOP §2.1 — DONE Jul 8, 4:02 PM
  2. Retrieve customer records — Salesforce · Customer Data Flows — DONE Jul 9, 9:14 AM
  3. Retrieve marketing profile + engagement history — Marketo — DONE Jul 9, 9:21 AM
  4. Retrieve support transcripts + redact third-party data — Zendesk · SOP §4.2 — DONE Jul 9,
     11:47 AM — "Redaction summary ready"
  5. Verify Alpine Rewards history — Internal warehouse — AWAITING HUMAN, "In progress with Daniel
     Okafor", "Alpine Rewards history found — flagged to privacy team for review"

### /requests/4207/subtask — agent collaboration (steps 19–25)

Split screen. Left card: Requests · AR-4207 › Subtask "Verify Alpine Rewards history"; Assignee
Daniel Okafor · Data Platform Engineering; Linked ticket SNOW-88412 (Open → Resolved); Status
IN PROGRESS → COMPLETE Jul 10, 2:14 PM. Right: a Microsoft Teams–style chat window (Meridian
Privacy Agent → Daniel Okafor) and an ITSM card (SNOW-88412, OPEN → RESOLVED, "Verify Alpine
Rewards history", Assignment group: Data Platform Engineering; resolved work note "Extract delivered
via Teams; verified by Privacy Agent. Auto-resolved.").

Chat:
- Agent (Jul 9, 11:52 AM): "Hi Daniel — I'm fulfilling privacy request AR-4207 (access request,
  CCPA). I need Marcus Bell's records from the warehouse: tables txn_orders, txn_refunds, and
  loyalty_ledger, filtered to customer_id C-102-448-871, full history. Return as CSV here and I'll
  take it from there. Ticket SNOW-88412 is tracking this — I'll keep it updated so you don't have to."
- Daniel: "does loyalty_ledger include the points expiry rows or do you need those separately from
  loyalty_expiry?"
- Agent: "Good catch — include loyalty_expiry too. Marcus specifically cares about his points, so
  expiry history is in scope for "specific pieces of personal information.""
- Daniel (Jul 10, 2:14 PM): attachment AR-4207_warehouse_extract.csv, "done"
- Agent: "Thanks — verified 214 rows, all four tables. You're done."

### /requests/4207/redaction — redaction summary (steps 26–27)

"Redaction complete — awaiting your sign-off". "Source: 6 Zendesk support transcripts (2019–2026)
included in the access package. I redacted other people's personal information per SOP §4.2.
Review my work below." Table Category · Instances · Confidence:
- Support agent names & email signatures — 14 — High
- Another customer's name + order details (shared purchase, Dec 2023) — 3 — High
- Internal account identifiers — "Some identifier formats were ambiguous between internal IDs and
  order references — I redacted all candidates. Worth a spot-check." — 7 — Medium — View excerpts

Actions: Approve & sign off · Return to agent with note. After sign-off: report card "MERIDIAN ·
Access report for Marcus Bell · English (US) · 9 pages · Generated to Meridian brand + tone guide ·
All six sources included · Redactions applied", button "Open report".

### /report — PDF report viewer (steps 28–36)

Header: Requests › AR-4207 › Access report; "English (US) · 9 pages · Generated to Meridian brand +
tone guide"; Page N of 9; Open in new tab. Dark canvas with one page image at a time. Pages:
1 Cover · 2 A letter, not a form ("Here's everything we have.") · 3 What we collect and why ·
4 Sources, purposes, sharing · 5 Profile & accounts · 6 Alpine Rewards history · 7 Orders &
transactions · 8 Marketing & support history · 9 What you can do next.

### /dashboard — program dashboard (steps 37–41)

Title "Dashboard", "Your privacy request program at a glance — throughput, fulfilment, and what needs
a human." Button "Create request". AI summary: "47 requests came in. I fulfilled 39 end-to-end; 8
need you — the top one is a deadline risk on AR-4211." (View needs-attention). Range: Today · Since
yesterday · 7 days · 30 days.

- KPIs: Requests received 47 (7% vs yesterday) · Fulfilled end-to-end by agent 39 (from 31/day avg
  over 30 days) · Median time to fulfil 2.1 days (61% vs prior 30 days) · Awaiting human 8 (→ 7
  after step 41).
- Fulfilment trend chart (Agent-fulfilled vs Needed human, Jul 4–Jul 10). Request types: Access 46%,
  Deletion 30%, Opt-Out 16%, Correction 8%. Top jurisdictions: California, US 31 · Germany 22 ·
  Virginia, US 17 · Colorado, US 12 · Other US 18.
- Request queue (14 items, "All Requests", search, Add filter): Request ID · Data Subject · Request
  Type · Jurisdiction · Stage · Days left.

| ID | Subject | Type | Jurisdiction | Stage | Days left |
|---|---|---|---|---|---|
| AR-4188 | S. Alvarez | Access | California, US | AGENT FULFILLING | 15 |
| DR-4191 | J. Whitfield | Deletion | California, US | AWAITING HUMAN | 17 |
| OO-4194 | T. Nakamura | Opt-Out | Colorado, US | AGENT FULFILLING | 18 |
| AR-4197 | P. Osei-Bonsu | Access | Virginia, US | COMPLETE | 35 |
| AR-4200 | L. Fontaine | Correction | Germany | AGENT FULFILLING | 12 |
| AR-4203 | D. Brandt | Access | Germany | COMPLETE | 32 |
| DR-4206 | K. Marsh | Deletion | California, US | AWAITING HUMAN | 32 |
| AR-4209 | A. Puri | Access | Virginia, US | AGENT FULFILLING | 37 |
| AR-4212 | C. Weiss | Access | Germany | COMPLETE | 41 |
| OO-4215 | R. Delgado | Opt-Out | California, US | COMPLETE | 24 |
| AR-4207 | M. Bell | Access | California, US | AWAITING HUMAN | 41 |
| AR-4221 | N. Sørensen | Access | Germany | AGENT FULFILLING | 8 |
| DR-4224 | H. Vance | Deletion | Colorado, US | AGENT FULFILLING | 15 |
| AR-4227 | E. Okoro | Access | California, US | COMPLETE | 42 |

- Needs your attention ("9 raised by the agent"), cards with a tag and action:
  - Identity match — low confidence (Needs review): "Request AR-4198 · I found two candidate records
    for "J. Whitfield" in Salesforce — same email, different addresses. I paused before disclosure.
    Review the match." → Review match
  - Stalled — deadline risk (Deadline risk): "Request AR-4211 · Warehouse extract open 6 days;
    deadline in 9. I've reminded Daniel Okafor twice in Teams. Recommend escalating to his manager."
    → Escalate
  - Possible duplicate request (Possible duplicate): "Request DR-4215 · Name and email on this
    deletion request match DR-4179, also a data deletion request submitted 4 days ago. Confirm these
    are the same person before I process both." → Compare requests
  - Unusual scope — household request (Needs review): "Request AR-4201 · Requester asked for data
    about themselves and their spouse. …" (truncated in capture)
- Compare dialog (step 39): "Possible duplicate request — DR-4215 matches DR-4179 on name, email, and
  request type." Side-by-side DR-4215 vs DR-4179 (Name Priya Anand, …). Reject as duplicate.
- Learn prompt (step 40): "Learn from this decision? DR-4215 was rejected as a duplicate. Should I
  automatically reject future requests that match on nam[e, email and request type]…"
- Confirmed (step 41): "Rejected as duplicate · DR-4215 closed, referencing DR-4179. Agent will
  auto-reject matching duplicates going forward." Awaiting human drops to 7.

## Port decisions (2026-11-05)

- Free-click prototype: no "Prototype guide" step strip. Screens are navigated normally and the
  agent's scripted turns play on click.
- /intake: OneCore components with `--oc-*` colour and font tokens overridden on that page so it
  reads as Northwind Outfitters.
- /report: reuse the v0 page images, copied to `public/report-pages/page-1.png` … `page-9.png`.
- Build order: OneTrust shell + Act 1 Setup first (landing, Privacy Agent conversation), then the
  flow chart and generated workflows, intake, request detail, subtask, redaction, report, dashboard.
