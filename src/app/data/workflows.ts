// Setup › Workflows (/setup/workflows): the workflows requests move through. Laid out like the
// OneTrust DSAR Workflows list (qa.1trust.app/dsar/workflows). The regulation templates and the
// two hand-built drafts are fixed; the Privacy Agent's drafts are added by AgentWorkflows
// (src/app/data/agent-workflows.ts) once setup finishes. Everything here is fictional.

import type { RequestType } from './workflow-draft';

export type WorkflowStatus = 'Draft' | 'Activated' | 'Deactivated';

/** Who created or last changed a workflow. `null` is OneTrust (a shipped template). */
export interface WorkflowPerson {
  name: string;
  email: string;
  initials: string;
}

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  organization: string;
  updatedBy: WorkflowPerson | null;
  /** ISO timestamp, for sorting. */
  updatedAt: string;
  createdBy: WorkflowPerson | null;
  /** Drafted by the Privacy Agent during setup. */
  agent?: boolean;
  /** Agent drafts: the request type, the regulations and the systems the workflow covers. */
  requestType?: RequestType;
  summary?: string;
}

export const AMARA: WorkflowPerson = {
  name: 'Amara Reyes',
  email: 'areyes@meridianbrands.com',
  initials: 'AR',
};

const DEV: WorkflowPerson = {
  name: 'Devon Park',
  email: 'dpark@meridianbrands.com',
  initials: 'DP',
};

/** Shipped regulation templates (created by OneTrust) and two hand-built drafts. */
export const WORKFLOWS: readonly Workflow[] = [
  wf('access-manual', 'Access Workflow', 'Draft', '2025-08-04T15:49', AMARA, AMARA),
  wf('access-manual-2', 'Access Workflow 2', 'Draft', '2025-04-03T10:44', DEV, DEV),
  wf('ccpa-correct', 'CCPA (as amended) Right to Correction - 1.0', 'Activated', '2026-02-27T07:10'),
  wf('ccpa-port', 'CCPA (as amended) Right to Data Portability - 1.0', 'Activated', '2026-11-05T07:05'),
  wf('ccpa-delete', 'CCPA (as amended) Right to Deletion - 1.0', 'Activated', '2026-02-27T07:10'),
  wf('ccpa-know-cat', 'CCPA (as amended) Right to Know (Categories of PI) - 1.0', 'Activated', '2026-02-27T07:10'),
  wf('ccpa-know-sell', 'CCPA (as amended) Right to Know (Selling & Sharing) - 1.0', 'Activated', '2026-02-27T07:10'),
  wf('ccpa-know-pi', 'CCPA (as amended) Right to Know (Specific PI) - 1.0', 'Activated', '2026-02-27T07:10'),
  wf('ccpa-limit', 'CCPA (as amended) Right to Limit Use & Disclosure - 1.0', 'Activated', '2026-02-27T07:10'),
  wf('ccpa-optout', 'CCPA (as amended) Right to Opt Out - 1.0', 'Activated', '2026-02-27T07:10'),
  wf('cpa-appeals', 'CPA Appeals Workflow', 'Activated', '2026-01-31T19:03'),
  wf('cpa-optout', 'CPA Opt Out Workflow', 'Activated', '2026-01-31T19:03'),
  wf('cpa-access', 'CPA Right of Access', 'Activated', '2026-01-31T19:03'),
  wf('cpa-correct', 'CPA Right to Correction', 'Activated', '2026-01-31T19:03'),
  wf('cpa-delete', 'CPA Right to Deletion', 'Activated', '2026-01-31T19:03'),
  wf('gdpr-access', 'GDPR Art. 15 Right of Access', 'Activated', '2026-03-12T09:20'),
  wf('gdpr-rectify', 'GDPR Art. 16 Right to Rectification', 'Activated', '2026-03-12T09:20'),
  wf('gdpr-erase', 'GDPR Art. 17 Right to Erasure', 'Activated', '2026-03-12T09:20'),
  wf('gdpr-port', 'GDPR Art. 20 Right to Data Portability', 'Activated', '2026-03-12T09:20'),
  wf('gdpr-object', 'GDPR Art. 21 Right to Object', 'Deactivated', '2025-10-02T14:31', DEV),
  wf('vcdpa-access', 'VCDPA Right to Access', 'Activated', '2026-01-31T19:03'),
  wf('vcdpa-correct', 'VCDPA Right to Correct', 'Activated', '2026-01-31T19:03'),
  wf('vcdpa-delete', 'VCDPA Right to Delete', 'Activated', '2026-01-31T19:03'),
  wf('vcdpa-optout', 'VCDPA Right to Opt Out', 'Activated', '2026-01-31T19:03'),
  wf('vcdpa-appeal', 'VCDPA Appeals Workflow', 'Activated', '2026-01-31T19:03'),
];

function wf(
  id: string,
  name: string,
  status: WorkflowStatus,
  updatedAt: string,
  updatedBy: WorkflowPerson | null = null,
  createdBy: WorkflowPerson | null = null,
): Workflow {
  return { id, name, status, organization: 'All organizations', updatedBy, updatedAt, createdBy };
}

/** Saved views in the view menu (reference: "My workflows"). */
export type WorkflowView = 'all' | 'agent' | 'draft' | 'activated';

export const WORKFLOW_VIEWS: readonly { id: WorkflowView; label: string }[] = [
  { id: 'all', label: 'My workflows' },
  { id: 'agent', label: 'Privacy Agent drafts' },
  { id: 'draft', label: 'Drafts' },
  { id: 'activated', label: 'Activated' },
];

/** "08/04/2025 03:49 PM", as in the reference list. */
export function formatWorkflowDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = d.getHours() % 12 || 12;
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(h)}:${pad(d.getMinutes())} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}
