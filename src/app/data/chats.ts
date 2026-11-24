import type { OcIconName } from '@onetrust/onecore/icon';

// Chats with the Privacy Agent in the Privacy Rights: DSAR module. They feed the All chats page
// (/chats) and the recent threads in the Chat menu. Requests and people match
// docs/v0-reference.md; everything here is fictional.

export interface ChatArtifact {
  label: string;
  icon: OcIconName;
}

export interface ChatRecord {
  id: string;
  title: string;
  /** The question the chat started with. */
  prompt: string;
  /** What the agent produced in the chat. */
  artifact: ChatArtifact;
  /** Minutes since the last message, for sorting. */
  minutesAgo: number;
  lastActivity: string;
  /** Opened days ago, for the "Oldest first" sort. */
  createdDaysAgo: number;
  newReply?: boolean;
  pinned?: boolean;
  /** Where the chat opens. Defaults to /chats/<id>. */
  link?: string;
}

export const CHATS: readonly ChatRecord[] = [
  {
    id: 'privacy-agent-setup',
    title: 'Privacy Agent setup',
    prompt: 'Help me set up DSAR intake for Meridian Brands',
    artifact: { label: 'Workflow draft', icon: 'sitemap' },
    minutesAgo: 25,
    lastActivity: '25 minutes ago',
    createdDaysAgo: 18,
    pinned: true,
    link: '/setup/agent',
  },
  {
    id: 'ar-4207',
    title: 'AR-4207 · Marcus Bell access request',
    prompt: 'What did we find for Marcus Bell across our systems?',
    artifact: { label: 'Access report', icon: 'file-lines' },
    minutesAgo: 120,
    lastActivity: '2 hours ago',
    createdDaysAgo: 4,
    newReply: true,
  },
  {
    id: 'dr-4215',
    title: 'DR-4215 possible duplicate',
    prompt: 'Is DR-4215 the same person as DR-4179?',
    artifact: { label: 'Duplicate comparison', icon: 'clone' },
    minutesAgo: 60 * 20,
    lastActivity: 'yesterday',
    createdDaysAgo: 1,
  },
  {
    id: 'cpra-playbook',
    title: 'CPRA deadlines in the playbook',
    prompt: 'When can we extend a CPRA request by 45 days?',
    artifact: { label: 'Playbook rule', icon: 'book' },
    minutesAgo: 60 * 24 * 2,
    lastActivity: '2 days ago',
    createdDaysAgo: 6,
  },
  {
    id: 'ar-4211',
    title: 'AR-4211 warehouse extract at risk',
    prompt: 'Why is AR-4211 at risk of missing its deadline?',
    artifact: { label: 'Escalation note', icon: 'triangle-exclamation' },
    minutesAgo: 60 * 24 * 3,
    lastActivity: '3 days ago',
    createdDaysAgo: 3,
  },
  {
    id: 'dr-4191-response',
    title: 'Partial deletion response for J. Whitfield',
    prompt: 'Draft a response for a deletion request we can’t fully fulfil',
    artifact: { label: 'Response letter', icon: 'envelope' },
    minutesAgo: 60 * 24 * 5,
    lastActivity: '5 days ago',
    createdDaysAgo: 7,
  },
  {
    id: 'october-volume',
    title: 'October DSAR volume for the privacy committee',
    prompt: 'Summarize this month’s DSAR volume for the privacy committee',
    artifact: { label: 'Committee summary', icon: 'chart-column' },
    minutesAgo: 60 * 24 * 12,
    lastActivity: '12 days ago',
    createdDaysAgo: 12,
  },
  {
    id: 'ar-4198-identity',
    title: 'Identity match for AR-4198',
    prompt: 'Which Salesforce record belongs to J. Whitfield?',
    artifact: { label: 'Identity check', icon: 'id-card' },
    minutesAgo: 60 * 24 * 19,
    lastActivity: '19 days ago',
    createdDaysAgo: 21,
  },
];

export interface ChatThread {
  id: string;
  title: string;
  /** Has activity the user hasn't seen (filled dot in the Chat menu). */
  unread: boolean;
  /** Where the chat opens; `/chats/<id>` by default. */
  link: string;
}

const byRecency = (a: ChatRecord, b: ChatRecord) => a.minutesAgo - b.minutesAgo;

/** The Chat menu lists pinned chats, then the three most recent unpinned ones. */
export const CHAT_THREADS: readonly ChatThread[] = [
  ...CHATS.filter((c) => c.pinned).sort(byRecency),
  ...CHATS.filter((c) => !c.pinned).sort(byRecency).slice(0, 3),
].map((c) => ({ id: c.id, title: c.title, unread: !!c.newReply, link: c.link ?? `/chats/${c.id}` }));
