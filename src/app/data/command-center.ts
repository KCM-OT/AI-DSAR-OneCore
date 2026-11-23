import type { OcIconName } from '@onetrust/onecore/icon';

// Mock data for the Command center home (/command-center). Figures are for the last 30 days of the
// Meridian Brands program; request IDs and people match docs/v0-reference.md. Everything here is
// fictional.

// ---- Global filters ----------------------------------------------------------------------------

export interface FilterOption {
  value: string;
  label: string;
}

export const DATE_RANGES: readonly FilterOption[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
];

export const ORGANIZATIONS: readonly FilterOption[] = [
  { value: 'all', label: 'All organizations' },
  { value: 'meridian', label: 'Meridian Brands' },
  { value: 'northwind', label: 'Northwind Outfitters' },
  { value: 'alpine', label: 'Alpine Rewards' },
];

export const REQUEST_TYPES: readonly FilterOption[] = [
  { value: 'all', label: 'All request types' },
  { value: 'access', label: 'Access' },
  { value: 'deletion', label: 'Deletion' },
  { value: 'opt-out', label: 'Opt-out' },
  { value: 'correction', label: 'Correction' },
];

export const JURISDICTIONS: readonly FilterOption[] = [
  { value: 'all', label: 'All jurisdictions' },
  { value: 'ca', label: 'California, US' },
  { value: 'de', label: 'Germany (GDPR)' },
  { value: 'va', label: 'Virginia, US' },
  { value: 'co', label: 'Colorado, US' },
  { value: 'uk', label: 'United Kingdom' },
];

// ---- 1. Health snapshot -----------------------------------------------------------------------

export type Trend = 'good' | 'bad' | 'neutral';

export interface Kpi {
  label: string;
  value: string;
  detail: string;
  /** Change vs the prior period, already phrased ("+12% vs prior 30 days"). */
  change?: string;
  trend?: Trend;
  /** Optional breakdown shown under the value. */
  parts?: readonly { label: string; value: number }[];
  link?: string;
}

export const KPIS: readonly Kpi[] = [
  {
    label: 'Open requests',
    value: '128',
    detail: 'By status',
    parts: [
      { label: 'New', value: 18 },
      { label: 'Verifying', value: 23 },
      { label: 'In progress', value: 61 },
      { label: 'Responding', value: 26 },
    ],
  },
  {
    label: 'Overdue',
    value: '3',
    detail: '14 more due in the next 7 days',
    trend: 'bad',
    change: '+1 since yesterday',
  },
  {
    label: 'Closed within legal deadline',
    value: '96.4%',
    detail: '397 of 412 closed requests',
    trend: 'good',
    change: '+3.3 pts vs prior 30 days',
  },
  {
    label: 'New requests',
    value: '412',
    detail: '368 in the prior 30 days',
    trend: 'neutral',
    change: '+12% vs prior 30 days',
  },
  {
    label: 'Average time to close',
    value: '11.2 days',
    detail: 'Median 8 days',
    trend: 'good',
    change: '−2.4 days vs prior 30 days',
  },
  {
    label: 'Awaiting identity verification',
    value: '23',
    detail: '5 waiting more than 3 days',
    trend: 'neutral',
  },
];

// ---- 2. Needs attention ----------------------------------------------------------------------

export type AttentionKind =
  | 'overdue'
  | 'due-soon'
  | 'unassigned'
  | 'approval'
  | 'duplicate'
  | 'integration';

export const ATTENTION_KINDS: Record<AttentionKind, { label: string; icon: OcIconName }> = {
  overdue: { label: 'Overdue', icon: 'triangle-exclamation' },
  'due-soon': { label: 'Due within 48 hours', icon: 'clock-nine' },
  unassigned: { label: 'Unassigned', icon: 'user' },
  approval: { label: 'Approval or extension', icon: 'circle-check' },
  duplicate: { label: 'Possible duplicate', icon: 'clone' },
  integration: { label: 'Data discovery failed', icon: 'database' },
};

export interface AttentionItem {
  kind: AttentionKind;
  ref: string;
  title: string;
  detail: string;
  due: string;
  action: string;
  link: string;
}

// Ordered by urgency: overdue first, then the soonest deadlines.
export const NEEDS_ATTENTION: readonly AttentionItem[] = [
  {
    kind: 'overdue',
    ref: 'DR-4191',
    title: 'Deletion request for J. Whitfield',
    detail: 'Awaiting a human decision on the Alpine Rewards account.',
    due: '2 days overdue',
    action: 'Open request',
    link: '/requests/4191',
  },
  {
    kind: 'overdue',
    ref: 'AR-4211 · Subtask',
    title: 'Warehouse extract from Daniel Okafor',
    detail: 'Open 6 days. The agent has reminded him twice in Teams.',
    due: '1 day overdue',
    action: 'Escalate',
    link: '/requests/4211',
  },
  {
    kind: 'due-soon',
    ref: 'AR-4221',
    title: 'Access request for N. Sørensen (GDPR)',
    detail: 'Report drafted. Waiting on redaction sign-off.',
    due: 'Due in 36 hours',
    action: 'Review report',
    link: '/requests/4221',
  },
  {
    kind: 'integration',
    ref: 'AR-4209',
    title: 'Targeted Data Discovery stalled on Marketo',
    detail: 'The connector token expired during the scan. 2 other requests are queued behind it.',
    due: 'Due in 5 days',
    action: 'Retry scan',
    link: '/requests/4209',
  },
  {
    kind: 'duplicate',
    ref: 'DR-4215',
    title: 'Matches DR-4179 on name, email and type',
    detail: 'Both are deletion requests from Priya Anand, 4 days apart.',
    due: 'Due in 41 days',
    action: 'Compare',
    link: '/command-center',
  },
  {
    kind: 'approval',
    ref: 'AR-4200',
    title: 'Extension request for L. Fontaine (GDPR)',
    detail: 'The agent proposes a 2-month extension: the request spans 4 systems.',
    due: 'Decide by Friday',
    action: 'Approve or decline',
    link: '/requests/4200',
  },
  {
    kind: 'unassigned',
    ref: '4 requests',
    title: 'New web form requests with no owner',
    detail: 'AR-4230, AR-4231, OO-4233 and DR-4234 arrived overnight.',
    due: 'Due in 28–44 days',
    action: 'Assign',
    link: '/requests',
  },
];

// ---- 3. Volume and mix -----------------------------------------------------------------------

/** Request types in their fixed chart order (and colour slot). */
export const TYPE_SERIES = ['Access', 'Deletion', 'Opt-out', 'Correction'] as const;
export type RequestType = (typeof TYPE_SERIES)[number];

export interface MonthVolume {
  month: string;
  counts: Record<RequestType, number>;
}

export const MONTHLY_VOLUME: readonly MonthVolume[] = [
  { month: 'Jun', counts: { Access: 128, Deletion: 84, 'Opt-out': 52, Correction: 21 } },
  { month: 'Jul', counts: { Access: 141, Deletion: 90, 'Opt-out': 49, Correction: 24 } },
  { month: 'Aug', counts: { Access: 133, Deletion: 97, 'Opt-out': 58, Correction: 22 } },
  { month: 'Sep', counts: { Access: 152, Deletion: 104, 'Opt-out': 61, Correction: 27 } },
  { month: 'Oct', counts: { Access: 169, Deletion: 111, 'Opt-out': 64, Correction: 24 } },
  { month: 'Nov', counts: { Access: 190, Deletion: 124, 'Opt-out': 66, Correction: 32 } },
];

export interface BarDatum {
  label: string;
  value: number;
  link?: string;
}

export const BY_JURISDICTION: readonly BarDatum[] = [
  { label: 'California, US (CPRA)', value: 128 },
  { label: 'Germany (GDPR)', value: 91 },
  { label: 'Virginia, US (VCDPA)', value: 70 },
  { label: 'Colorado, US (CPA)', value: 49 },
  { label: 'United Kingdom (UK GDPR)', value: 38 },
  { label: 'Other', value: 36 },
];

export const BY_SOURCE: readonly BarDatum[] = [
  { label: 'Web form', value: 268 },
  { label: 'Email', value: 61 },
  { label: 'Customer portal', value: 52 },
  { label: 'Employee portal', value: 21 },
  { label: 'Phone', value: 10 },
];

// ---- 4. Pipeline and deadlines ---------------------------------------------------------------

export const PIPELINE: readonly BarDatum[] = [
  { label: 'Intake', value: 18 },
  { label: 'Verification', value: 23 },
  { label: 'Processing', value: 61 },
  { label: 'Response', value: 26 },
];

export type DeadlineStatus = 'critical' | 'warning' | 'neutral';

export interface DeadlineBucket {
  label: string;
  value: number;
  status: DeadlineStatus;
}

export const DEADLINE_BUCKETS: readonly DeadlineBucket[] = [
  { label: 'Overdue', value: 3, status: 'critical' },
  { label: '0–7 days', value: 14, status: 'warning' },
  { label: '8–30 days', value: 62, status: 'neutral' },
  { label: 'Beyond 30 days', value: 49, status: 'neutral' },
];

// ---- 5. My work and team load ----------------------------------------------------------------

export interface WorkItem {
  id: string;
  item: 'Request' | 'Subtask';
  title: string;
  type: RequestType;
  jurisdiction: string;
  stage: string;
  due: string;
  /** Days until due; negative when overdue. Sorts the Due column. */
  dueIn: number;
}

export const MY_WORK: readonly WorkItem[] = [
  {
    id: 'DR-4191',
    item: 'Request',
    title: 'J. Whitfield',
    type: 'Deletion',
    jurisdiction: 'California, US',
    stage: 'Awaiting human',
    due: '2 days overdue',
    dueIn: -2,
  },
  {
    id: 'AR-4207',
    item: 'Subtask',
    title: 'Review Alpine Rewards history',
    type: 'Access',
    jurisdiction: 'California, US',
    stage: 'Processing',
    due: 'In 3 days',
    dueIn: 3,
  },
  {
    id: 'AR-4221',
    item: 'Subtask',
    title: 'Sign off redactions',
    type: 'Access',
    jurisdiction: 'Germany',
    stage: 'Response',
    due: 'In 2 days',
    dueIn: 2,
  },
  {
    id: 'AR-4200',
    item: 'Request',
    title: 'L. Fontaine',
    type: 'Correction',
    jurisdiction: 'Germany',
    stage: 'Extension requested',
    due: 'In 12 days',
    dueIn: 12,
  },
  {
    id: 'DR-4215',
    item: 'Request',
    title: 'Priya Anand',
    type: 'Deletion',
    jurisdiction: 'California, US',
    stage: 'Duplicate check',
    due: 'In 41 days',
    dueIn: 41,
  },
  {
    id: 'OO-4194',
    item: 'Request',
    title: 'T. Nakamura',
    type: 'Opt-out',
    jurisdiction: 'Colorado, US',
    stage: 'Processing',
    due: 'In 18 days',
    dueIn: 18,
  },
];

export const TEAM_LOAD: readonly BarDatum[] = [
  { label: 'Priya Shah', value: 15 },
  { label: 'Amara Reyes (you)', value: 12 },
  { label: 'Daniel Okafor', value: 9 },
  { label: 'Marco Ruiz', value: 7 },
  { label: 'Leah Kim', value: 4 },
];

// ---- 6. Program setup health -----------------------------------------------------------------

export type SetupState = 'ok' | 'warning' | 'error';

export interface SetupMetric {
  label: string;
  value: string;
  detail: string;
  state: SetupState;
  link: string;
}

export const SETUP_HEALTH: readonly SetupMetric[] = [
  {
    label: 'Published web forms',
    value: '3',
    detail: 'Meridian, Northwind Outfitters, Alpine Rewards',
    state: 'ok',
    link: '/setup',
  },
  {
    label: 'Active custom workflows',
    value: '5',
    detail: '18 subtasks across access, deletion and opt-out',
    state: 'ok',
    link: '/setup/workflows',
  },
  {
    label: 'Integration workflows (DSAR API)',
    value: '4',
    detail: '1 failing: Marketo token expired',
    state: 'error',
    link: '/setup',
  },
  {
    label: 'Redaction reviews',
    value: '37',
    detail: '6 waiting more than 2 days',
    state: 'warning',
    link: '/requests',
  },
];

// ---- 7. Activity and shortcuts ---------------------------------------------------------------

export interface ActivityEvent {
  time: string;
  icon: OcIconName;
  text: string;
  who: string;
}

export const ACTIVITY: readonly ActivityEvent[] = [
  { time: '9:42 AM', icon: 'ticket', text: 'AR-4231 received from the web form', who: 'Intake' },
  { time: '9:15 AM', icon: 'circle-check', text: 'OO-4215 closed within deadline', who: 'Privacy Agent' },
  { time: '8:58 AM', icon: 'user', text: 'AR-4209 reassigned to Marco Ruiz', who: 'Priya Shah' },
  { time: '8:20 AM', icon: 'circle-check', text: 'AR-4203 access report sent', who: 'Privacy Agent' },
  { time: 'Yesterday', icon: 'clone', text: 'DR-4215 flagged as a possible duplicate', who: 'Privacy Agent' },
];

export interface SavedView {
  label: string;
  count: number;
  link: string;
}

export const SAVED_VIEWS: readonly SavedView[] = [
  { label: 'My overdue', count: 1, link: '/requests' },
  { label: 'California requests', count: 128, link: '/requests' },
  { label: 'Awaiting identity verification', count: 23, link: '/requests' },
  { label: 'Deletion requests this month', count: 124, link: '/requests' },
  { label: 'Unassigned', count: 4, link: '/requests' },
];
