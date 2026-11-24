import { Component, computed, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  OcAssistantActions,
  OcAssistantComposer,
  OcAssistantInput,
  OcAssistantMessage,
  OcAssistantScrollToBottom,
  OcAssistantSubmit,
  OcAssistantThinking,
  OcAssistantThread,
  OcAssistantViewport,
} from '@onetrust/onecore/assistant';
import { OcAvatar } from '@onetrust/onecore/avatar';
import { OcButton } from '@onetrust/onecore/button';
import { OcCheckbox } from '@onetrust/onecore/checkbox';
import { OcStreamDirective, type ChoreoState } from '@onetrust/onecore/choreography';
import { OcIcon } from '@onetrust/onecore/icon';
import { OcIconButton } from '@onetrust/onecore/icon-button';
import { OcTextarea } from '@onetrust/onecore/textarea';
import { AgentWorkflows } from '../../../data/agent-workflows';
import { INTAKE_AGENTS, SETUP_DOCUMENTS, SIGNED_IN_USER, SYSTEMS } from '../../../data/meridian';
import { type DraftSection, REGULATIONS, WORKFLOW_RULES } from '../../../data/workflow-draft';
import { PageHeader } from '../../../shell/page-header';
import { type DraftState, WorkflowDraft } from './workflow-draft';

interface Turn {
  id: number;
  from: 'user' | 'assistant';
  text: string;
  /** User turns: show the attached documents under the message. */
  attachments?: boolean;
  /** Assistant turns: the token source [ocStream] reveals. */
  source?: AsyncIterable<string>;
}

/** The question the agent asks at each stage, answered in the card above the composer. */
type Question = 'scope' | 'documents' | 'rules' | 'agents' | 'systems';

interface Stage {
  reply: string;
  question?: Question;
}

interface Option {
  id: string;
  label: string;
  detail?: string;
}

// The agent's side of the setup conversation (v0 steps 2–8). Each stage asks one question; the
// answer updates one section of the workflow draft beside the chat.
const STAGES: readonly Stage[] = [
  {
    reply: `Welcome, ${SIGNED_IN_USER.firstName}. Before we set anything up, I researched Meridian Brands: three consumer brands, customers in the US, Germany and Austria, and employees in the US and Germany. That puts four privacy regulations in scope. Confirm which ones the workflow should cover.`,
    question: 'scope',
  },
  {
    reply:
      "I've added the scope and response deadlines to the draft. Next: the documents that describe how Meridian actually works. A DSAR procedure, data flows, past response letters, your brand guide: anything you'd hand a new privacy hire.",
    question: 'documents',
  },
  {
    reply:
      "I've read them. Your procedure sets a few rules every request should follow. Choose the ones to build into the workflow, and I'll show where each one lands.",
    question: 'rules',
  },
  {
    reply:
      "Rules applied. For intake, I suggest branded intake agents: structured request experiences that can also answer requesters' questions. One per consumer brand, and one for employees.",
    question: 'agents',
  },
  {
    reply:
      "To fulfil requests I'll work in your systems. Your data map and data flows agree on four. Salesforce, Marketo and Zendesk have OneTrust connectors. The internal warehouse doesn't, so I'll work with its owner, Daniel Okafor.",
    question: 'systems',
  },
  {
    reply:
      "That's everything I need. The draft now has one path per request type, with your playbook rules built in, and I've saved each path as a draft workflow in Setup › Workflows. Open it as a flow chart to review it, or tell me what to change.",
  },
];

/** The first reply when the conversation starts from the Chat home's setup prompt. */
const FROM_PROMPT_REPLY = `Thanks, ${SIGNED_IN_USER.firstName}. I'll build the workflow from that, one step at a time, and you can adjust each choice as we go. I also checked Meridian Brands' public footprint, and it matches what you said: four privacy regulations are in scope. Confirm which ones the workflow should cover.`;

const THINK_MS = 900;
const WORD_MS = 28;
/** How long a draft section shows as updating before its new content appears. */
const UPDATE_MS = 1200;

/** Streams a scripted reply word by word after a short "thinking" pause. */
async function* typed(text: string): AsyncIterable<string> {
  await new Promise((r) => setTimeout(r, THINK_MS));
  for (const w of text.split(/(\s+)/)) {
    if (!w) continue;
    yield w;
    if (w.trim()) await new Promise((r) => setTimeout(r, WORD_MS));
  }
}

function list(labels: readonly string[]): string {
  if (labels.length <= 1) return labels[0] ?? 'none';
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

// Privacy Agent setup (v0 Act 1, steps 2–8), laid out like the AI-assisted RoPA authoring page:
// a narrow conversation on the left and the wide workflow draft it builds on the right.
@Component({
  selector: 'app-setup-agent',
  imports: [
    RouterLink,
    OcAssistantThread,
    OcAssistantViewport,
    OcAssistantMessage,
    OcAssistantThinking,
    OcAssistantScrollToBottom,
    OcAssistantComposer,
    OcAssistantInput,
    OcAssistantActions,
    OcAssistantSubmit,
    OcAvatar,
    OcButton,
    OcCheckbox,
    OcIcon,
    OcIconButton,
    OcStreamDirective,
    OcTextarea,
    PageHeader,
    WorkflowDraft,
  ],
  templateUrl: './setup-agent.html',
  styleUrl: './setup-agent.scss',
})
export class SetupAgent {
  protected readonly user = SIGNED_IN_USER;
  protected readonly documents = SETUP_DOCUMENTS;

  protected readonly turns = signal<Turn[]>([]);
  /** Index of the latest agent stage started. */
  protected readonly stage = signal(-1);
  protected readonly busy = signal(false);
  protected readonly streamStates = signal<Record<number, ChoreoState>>({});

  // ---- The workflow draft
  protected readonly draft = signal<DraftState>({
    regulations: null,
    documents: null,
    rules: null,
    agents: null,
    systems: null,
  });
  protected readonly updating = signal<DraftSection | null>(null);
  /** The section the latest answer changed; the flow chart keeps it highlighted. */
  protected readonly changed = signal<DraftSection | null>(null);
  protected readonly ready = computed(() => this.stage() === STAGES.length - 1 && !this.busy());

  // ---- Finished setup: the agent's drafts go to Setup › Workflows
  readonly #agentWorkflows = inject(AgentWorkflows);
  protected readonly savedCount = computed(() => this.#agentWorkflows.workflows().length);

  // ---- The open question and its choices (all suggested options start selected)
  protected readonly question = computed<Question | undefined>(() =>
    this.busy() ? undefined : STAGES[this.stage()]?.question,
  );
  protected readonly optionsBase: Record<Exclude<Question, 'documents'>, readonly Option[]> = {
    scope: REGULATIONS.map((r) => ({ id: r.id, label: r.label, detail: `${r.region} · ${r.deadline}` })),
    rules: WORKFLOW_RULES.map((r) => ({ id: r.id, label: r.text, detail: r.source })),
    agents: INTAKE_AGENTS.map((a) => ({ id: a.brand, label: a.brand, detail: a.regulations.join(' · ') })),
    systems: SYSTEMS.map((s) => ({ id: s.name, label: s.name, detail: s.connector ? s.holds : `${s.holds} · via Daniel Okafor` })),
  };
  /** Options for each question; intake agents list only the regulations kept in scope. */
  protected readonly options = computed<Record<Exclude<Question, 'documents'>, readonly Option[]>>(() => {
    const scope = new Set(
      REGULATIONS.filter((r) => this.draft().regulations?.includes(r.id)).map((r) => r.label),
    );
    return {
      ...this.optionsBase,
      agents: INTAKE_AGENTS.map((a) => ({
        id: a.brand,
        label: a.brand,
        detail: (scope.size ? a.regulations.filter((r) => scope.has(r)) : a.regulations).join(' · '),
      })),
    };
  });

  protected readonly selected = signal<Record<string, ReadonlySet<string>>>({
    scope: new Set(REGULATIONS.map((r) => r.id)),
    rules: new Set(WORKFLOW_RULES.map((r) => r.id)),
    agents: new Set(INTAKE_AGENTS.map((a) => a.brand)),
    systems: new Set(SYSTEMS.map((s) => s.name)),
  });

  protected readonly questionTitle: Record<Question, string> = {
    scope: 'Which regulations should the workflow cover?',
    documents: 'Attach your process documents',
    rules: 'Which rules should every request follow?',
    agents: 'Which intake agents should I create?',
    systems: 'Which systems should I work in?',
  };

  #nextId = 1;
  #timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.#timer));
    // Each time setup finishes, save one draft workflow per request type.
    effect(() => {
      if (this.ready()) untracked(() => this.#agentWorkflows.publish(this.draft()));
    });
    // Opened from the Chat home's "Set up the Privacy Agent" prompt: that prompt opens the
    // conversation, and the agent's first reply answers it.
    const router = inject(Router);
    const state = (router.currentNavigation()?.extras.state ?? history.state) as { prompt?: unknown } | null;
    const prompt = typeof state?.prompt === 'string' ? state.prompt : '';
    if (prompt) {
      this.#say(prompt);
      this.stage.set(0);
      this.#replyText(FROM_PROMPT_REPLY);
    } else {
      this.#reply(0);
    }
  }

  protected streamState(id: number): ChoreoState | undefined {
    return this.streamStates()[id];
  }

  protected setStreamState(id: number, state: ChoreoState): void {
    this.streamStates.update((s) => ({ ...s, [id]: state }));
  }

  protected onStreamComplete(): void {
    this.busy.set(false);
  }

  protected isChecked(q: Question, id: string): boolean {
    return this.selected()[q]?.has(id) ?? false;
  }

  protected toggle(q: Question, id: string, on: boolean): void {
    this.selected.update((all) => {
      const next = new Set(all[q]);
      if (on) next.add(id);
      else next.delete(id);
      return { ...all, [q]: next };
    });
  }

  protected count(q: Question): number {
    return this.selected()[q]?.size ?? 0;
  }

  /** Typed messages answer the open question with its current choices. */
  protected onSend(text: string): void {
    const message = text.trim();
    if (!message || this.busy()) return;
    const q = this.question();
    if (q) {
      this.answer(q, message);
    } else {
      this.#say(message);
      this.#replyText(
        'Open the flow chart to review the full workflow. You can ask me for changes there, and I’ll update each path.',
      );
    }
  }

  /** Confirms the open question: records the answer, updates its draft section, moves on. */
  protected answer(q: Question, typed?: string): void {
    if (this.busy()) return;
    const chosen = [...(this.selected()[q] ?? [])];
    const labelOf = (id: string) => this.options()[q as Exclude<Question, 'documents'>].find((o) => o.id === id)!.label;

    switch (q) {
      case 'scope':
        this.#say(typed ?? `Cover ${list(chosen.map(labelOf))}.`);
        this.#update('scope', { regulations: chosen });
        break;
      case 'documents':
        this.#say(typed ?? 'Here are our DSAR procedure, data flows, response letter examples and brand guide.', true);
        this.#update('sources', { documents: SETUP_DOCUMENTS });
        break;
      case 'rules':
        this.#say(typed ?? (chosen.length ? `Apply ${chosen.length} of the ${WORKFLOW_RULES.length} rules.` : 'Don’t apply any of them yet.'));
        this.#update('rules', { rules: chosen });
        break;
      case 'agents':
        this.#say(typed ?? (chosen.length ? `Create ${list(chosen)}.` : 'No intake agents for now.'));
        this.#update('intake', { agents: chosen });
        break;
      case 'systems':
        this.#say(typed ?? (chosen.length ? `Connect ${list(chosen)}.` : 'No systems yet.'));
        this.#update('paths', { systems: chosen });
        break;
    }
    this.#reply(this.stage() + 1);
  }

  #update(section: DraftSection, patch: Partial<DraftState>): void {
    this.draft.update((d) => ({ ...d, ...patch }));
    this.updating.set(section);
    this.changed.set(section);
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.updating.set(null), UPDATE_MS);
  }

  #say(text: string, attachments = false): void {
    this.turns.update((ts) => [...ts, { id: this.#nextId++, from: 'user', text, attachments }]);
  }

  #reply(stage: number): void {
    this.stage.set(stage);
    this.#replyText(STAGES[stage].reply);
  }

  #replyText(text: string): void {
    this.busy.set(true);
    this.turns.update((ts) => [...ts, { id: this.#nextId++, from: 'assistant', text, source: typed(text) }]);
  }
}

