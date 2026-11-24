// The DSAR intake workflow the Privacy Agent drafts during setup (/setup/agent). The draft panel
// builds it up from the user's answers; the steps match the v0 flow chart (docs/v0-reference.md,
// /setup/flow) so the flow chart screen can reuse them. Everything here is fictional.

/** Statutory response windows for the regulations the agent found in scope. */
export interface Regulation {
  id: string;
  label: string;
  region: string;
  deadline: string;
  extension: string;
}

export const REGULATIONS: readonly Regulation[] = [
  {
    id: 'cpra',
    label: 'CCPA/CPRA',
    region: 'California',
    deadline: '45 days',
    extension: '+45 days with notice',
  },
  { id: 'vcdpa', label: 'VCDPA', region: 'Virginia', deadline: '45 days', extension: '+45 days with notice' },
  { id: 'cpa', label: 'CPA', region: 'Colorado', deadline: '45 days', extension: '+45 days with notice' },
  { id: 'gdpr', label: 'GDPR', region: 'Germany, Austria', deadline: '1 month', extension: '+2 months if complex' },
];

/** A playbook rule the user can apply, and where it lands in the workflow. */
export interface WorkflowRule {
  id: string;
  text: string;
  source: string;
  /** Where the rule shows up, in words. */
  appliesTo: string;
}

export const WORKFLOW_RULES: readonly WorkflowRule[] = [
  {
    id: 'verify',
    text: 'Verify identity before any data handling',
    source: 'SOP §2.1',
    appliesTo: 'Every path, right after intake',
  },
  {
    id: 'redact',
    text: 'Redact third-party data in support transcripts; privacy sign-off before disclosure',
    source: 'SOP §4.2',
    appliesTo: 'Access path, before the response',
  },
  {
    id: 'legal-hold',
    text: 'Accounts with open disputes route to Legal before deletion',
    source: 'SOP §5.3',
    appliesTo: 'Deletion path, after the system deletions',
  },
  {
    id: 'voice',
    text: 'Responses use the Meridian letter structure and brand voice',
    source: 'Brand + Tone Guide',
    appliesTo: 'Every path, in the response letter',
  },
];

export type RequestType = 'Access' | 'Deletion' | 'Opt-out' | 'Correction';

export const REQUEST_TYPES: readonly RequestType[] = ['Access', 'Deletion', 'Opt-out', 'Correction'];

export const REQUEST_TYPE_PURPOSE: Record<RequestType, string> = {
  Access: 'Retrieve, redact and review personal data before delivery',
  Deletion: 'Delete data across all systems; route edge cases to Legal',
  'Opt-out': 'Suppress marketing preferences across systems',
  Correction: 'Update source records where the data lives',
};

/** What each request type does in each system. */
export const SYSTEM_ACTIONS: Record<string, Partial<Record<RequestType, string>>> = {
  Salesforce: { Access: 'Customer records', Deletion: 'Delete records', Correction: 'Update records' },
  Marketo: {
    Access: 'Marketing profiles',
    Deletion: 'Delete profiles',
    'Opt-out': 'Suppress marketing',
    Correction: 'Update profiles',
  },
  Zendesk: { Access: 'Tickets + transcripts', Deletion: 'Delete support data', Correction: 'Update contact' },
  'Internal warehouse': { Access: 'Transactions + rewards', Deletion: 'Delete transactions' },
};

/** The five draft sections, one per setup step, in order. */
export type DraftSection = 'scope' | 'sources' | 'rules' | 'intake' | 'paths';

export const DRAFT_SECTIONS: readonly { id: DraftSection; title: string; waitingFor: string }[] = [
  { id: 'scope', title: 'Scope and deadlines', waitingFor: 'Confirm what’s in scope in the conversation.' },
  { id: 'sources', title: 'Sources', waitingFor: 'Attach the documents that describe how you work.' },
  { id: 'rules', title: 'Playbook rules', waitingFor: 'Choose the rules every request follows.' },
  { id: 'intake', title: 'Intake channels', waitingFor: 'Approve the branded intake agents.' },
  { id: 'paths', title: 'Request paths', waitingFor: 'Choose the systems the agent works in.' },
];
