import { Injectable, signal } from '@angular/core';
import { TENANT } from './meridian';
import { FLOW_ORDER, REGULATIONS, type RequestType, SYSTEM_ACTIONS } from './workflow-draft';
import type { Workflow, WorkflowPerson } from './workflows';

/** What the Privacy Agent setup hands over when its draft is ready (a subset of DraftState). */
export interface AgentDraft {
  regulations: readonly string[] | null;
  systems: readonly string[] | null;
}

export const PRIVACY_AGENT: WorkflowPerson = {
  name: 'Privacy Agent',
  email: 'Drafted with Amara Reyes',
  initials: 'PA',
};

const STORAGE_KEY = 'dsar.agentWorkflows';

/**
 * The workflows the Privacy Agent drafts during setup (/setup/agent), one per request type. They
 * show at the top of Setup › Workflows. Kept in localStorage so a reload or a later visit still
 * shows them; the prototype has no backend.
 */
@Injectable({ providedIn: 'root' })
export class AgentWorkflows {
  readonly #workflows = signal<readonly Workflow[]>(read());
  readonly workflows = this.#workflows.asReadonly();

  /** Replace the agent's drafts with ones built from the finished setup. */
  publish(draft: AgentDraft): void {
    const regs = REGULATIONS.filter((r) => draft.regulations?.includes(r.id)).map((r) => r.label);
    const systems = draft.systems ?? [];
    const now = new Date();
    now.setSeconds(0, 0);
    const updatedAt = now.toISOString();

    const workflows = FLOW_ORDER.map((type): Workflow => {
      const used = systems.filter((s) => SYSTEM_ACTIONS[s]?.[type]);
      return {
        id: `agent-${type.toLowerCase()}`,
        name: `${type} requests · ${TENANT}`,
        status: 'Draft',
        organization: 'All organizations',
        updatedBy: PRIVACY_AGENT,
        updatedAt,
        createdBy: PRIVACY_AGENT,
        agent: true,
        requestType: type as RequestType,
        summary: [regs.join(', ') || 'No regulations', used.join(', ') || 'No system selected'].join(' · '),
      };
    });
    this.#workflows.set(workflows);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
    } catch {
      // Storage blocked (private window): the drafts last until reload.
    }
  }

  /** Clear the drafts (starting setup over). */
  clear(): void {
    this.#workflows.set([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing stored.
    }
  }
}

function read(): readonly Workflow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Workflow[]) : [];
  } catch {
    return [];
  }
}
