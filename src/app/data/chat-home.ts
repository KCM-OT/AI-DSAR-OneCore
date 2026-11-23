import type { OcIconName } from '@onetrust/onecore/icon';

// Content for the Chat home page (/chat): the Privacy Agent's start screen. The layout follows the
// OneTrust AI Governance "Corie" home; every prompt, task and event here is a DSAR equivalent, using
// the Meridian Brands requests from docs/v0-reference.md.

export const AGENT_NAME = 'Privacy Agent';

/** Rotating placeholder prompts for the composer. */
export const PLACEHOLDER_PROMPTS: readonly string[] = [
  'Which requests are at risk of missing their deadline?',
  'Summarize this month’s DSAR volume for the privacy committee',
  'Draft a response for a deletion request we can’t fully fulfil',
  'Ask the Privacy Agent anything…',
];

export interface ScopeOption {
  value: string;
  label: string;
}

export const REQUEST_SCOPES: readonly ScopeOption[] = [
  { value: 'all', label: 'All requests' },
  { value: 'access', label: 'Access' },
  { value: 'deletion', label: 'Deletion' },
  { value: 'correction', label: 'Correction' },
  { value: 'opt-out', label: 'Opt-out' },
];

export const SOURCE_SCOPES: readonly ScopeOption[] = [
  { value: 'all', label: 'All sources' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'marketo', label: 'Marketo' },
  { value: 'zendesk', label: 'Zendesk' },
  { value: 'warehouse', label: 'Internal warehouse' },
];

/** Suggestion chips under the composer. The first is the page's main action. */
export interface Shortcut {
  label: string;
  /** Opens a page instead of filling the composer. */
  link?: string;
}

export const SHORTCUTS: readonly Shortcut[] = [
  { label: 'Set up the Privacy Agent', link: '/setup/agent' },
  { label: 'Find requests at deadline risk' },
  { label: 'Verify a requester’s identity' },
  { label: 'Check for duplicate requests' },
  { label: 'Draft a response letter' },
];

export type TaskPriority = 'high' | 'medium';

export interface PriorityTask {
  title: string;
  priority: TaskPriority;
  body: string;
  kind: string;
  icon: OcIconName;
  waiting: string;
  action: string;
  link: string;
  /** The page's main action: shown as a primary button instead of a text link. */
  primary?: boolean;
}

export const PRIORITY_TASKS: readonly PriorityTask[] = [
  {
    title: 'Finish setting up the Privacy Agent',
    priority: 'high',
    body: 'Intake, your playbook and system connections aren’t configured, so new requests can’t be routed or fulfilled automatically.',
    kind: 'Setup',
    icon: 'ai-sparkles',
    waiting: 'About 10 minutes',
    action: 'Continue setup',
    link: '/setup/agent',
    primary: true,
  },
  {
    title: 'AR-4211 is at risk of missing its deadline',
    priority: 'high',
    body: 'The warehouse extract has been open 6 days with 9 left. I’ve reminded Daniel Okafor twice in Teams.',
    kind: 'Request',
    icon: 'ticket',
    waiting: 'Waiting on you 2 days',
    action: 'Escalate',
    link: '/requests/4211',
  },
  {
    title: 'DR-4215 may be a duplicate',
    priority: 'high',
    body: 'Name and email match DR-4179, a deletion request submitted 4 days ago. Confirm before I process both.',
    kind: 'Request',
    icon: 'clone',
    waiting: 'Waiting on you 1 day',
    action: 'Compare requests',
    link: '/command-center',
  },
  {
    title: 'Low-confidence identity match on AR-4198',
    priority: 'medium',
    body: 'Two Salesforce records match “J. Whitfield”: same email, different addresses. I paused before disclosure.',
    kind: 'Verification',
    icon: 'id-card',
    waiting: 'Waiting on you 1 day',
    action: 'Review match',
    link: '/requests/4198',
  },
  {
    title: 'Sign off redactions for AR-4207',
    priority: 'medium',
    body: 'I redacted third-party data from Marcus Bell’s access report. It needs privacy sign-off before release.',
    kind: 'Redaction',
    icon: 'eraser',
    waiting: 'Waiting on you today',
    action: 'Review redactions',
    link: '/requests/4207/redaction',
  },
];

export type OpenItemState = 'new-reply' | 'needs-you' | 'in-progress';

export interface OpenItem {
  title: string;
  state: OpenItemState;
  body: string;
  kind: string;
  icon: OcIconName;
  ready: string;
  link: string;
  /** Percent complete, shown as a progress bar. */
  progress?: number;
}

export const OPEN_ITEMS: readonly OpenItem[] = [
  {
    title: 'Privacy Agent setup',
    state: 'in-progress',
    body: 'Company profile and documents are done. Your playbook, agents and system connections are next.',
    kind: 'Setup',
    icon: 'ai-sparkles',
    ready: '2 of 5 steps done',
    link: '/setup/agent',
    progress: 40,
  },
  {
    title: 'AR-4207 · Marcus Bell access request',
    state: 'new-reply',
    body: 'Daniel Okafor returned the warehouse extract. The Alpine Rewards history is flagged for your review.',
    kind: 'Request',
    icon: 'ticket',
    ready: 'Extract received',
    link: '/requests/4207/subtask',
  },
  {
    title: 'CPRA deadlines in the playbook',
    state: 'needs-you',
    body: 'California allows a 45-day extension. Decide whether the agent may apply it without asking.',
    kind: 'Playbook',
    icon: 'book',
    ready: 'Draft rule ready',
    link: '/setup/workflows',
  },
];

export type HandledState = 'completed' | 'needs-review';

export interface HandledEvent {
  time: string;
  state: HandledState;
  title: string;
  detail: string;
  link?: string;
}

export const HANDLED_EVENTS: readonly HandledEvent[] = [
  {
    time: '6:47 AM',
    state: 'completed',
    title: 'Verified identity for 4 requesters',
    detail: 'Each matched one Salesforce record',
  },
  {
    time: '4:05 AM',
    state: 'completed',
    title: 'Drafted the access report for AR-4207',
    detail: '9 pages from Salesforce, Zendesk and the internal warehouse',
  },
  {
    time: '2:38 AM',
    state: 'completed',
    title: 'Closed 3 opt-out requests',
    detail: 'Marketo suppression list updated',
  },
  {
    time: '1:14 AM',
    state: 'needs-review',
    title: 'Flagged DR-4215 as a possible duplicate',
    detail: 'Matches DR-4179 on name, email and request type',
    link: '/command-center',
  },
  {
    time: '11:02 PM',
    state: 'needs-review',
    title: 'Paused disclosure on AR-4198',
    detail: 'Two records match the requester’s email',
    link: '/requests/4198',
  },
];
