import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  OcAssistantActions,
  OcAssistantComposer,
  OcAssistantInput,
  OcAssistantMessage,
  OcAssistantScrollToBottom,
  OcAssistantSubmit,
  OcAssistantSuggestion,
  OcAssistantThinking,
  OcAssistantThread,
  OcAssistantViewport,
} from '@onetrust/onecore/assistant';
import { OcAvatar } from '@onetrust/onecore/avatar';
import { OcBadge } from '@onetrust/onecore/badge';
import { OcButton } from '@onetrust/onecore/button';
import { OcStreamDirective, type ChoreoState } from '@onetrust/onecore/choreography';
import { OcIcon } from '@onetrust/onecore/icon';
import { OcIconButton } from '@onetrust/onecore/icon-button';
import { OcTag } from '@onetrust/onecore/tag';
import { OcTextarea } from '@onetrust/onecore/textarea';
import {
  COMPANY_PROFILE,
  INTAKE_AGENTS,
  PLAYBOOK,
  SETUP_DOCUMENTS,
  SETUP_STEPS,
  SIGNED_IN_USER,
  SYSTEMS,
} from '../../../data/meridian';
import { PageHeader } from '../../../shell/page-header';

// Rich content shown under a turn once its text has streamed.
type Block = 'profile' | 'uploads' | 'playbook' | 'agents' | 'systems' | 'handoff';

interface Turn {
  id: number;
  from: 'user' | 'assistant';
  text: string;
  block?: Block;
  /** Assistant turns: the token source [ocStream] reveals. */
  source?: AsyncIterable<string>;
}

interface Stage {
  reply: string;
  block?: Block;
  /** What the user can send to move on (a suggestion chip), if anything. */
  next?: string;
}

// The agent's side of the setup conversation (v0 steps 2–8). Each stage is one
// agent turn; the user moves the script on by sending anything.
const STAGES: readonly Stage[] = [
  {
    reply: `Welcome, ${SIGNED_IN_USER.firstName}. Before we set anything up, I researched Meridian Brands. Here's what I found. Confirm or correct anything.`,
    block: 'profile',
    next: 'That all looks right.',
  },
  {
    reply:
      "Next: the documents that describe how Meridian actually works. A DSAR procedure, retention policies, data flow diagrams, past response letters, brand guidelines: anything you'd hand a new privacy hire, hand to me.",
  },
  {
    reply:
      "I've read them. Here's your operating playbook as I understand it. This is the context I'll follow on every request.",
    block: 'playbook',
    next: "Looks right. What's next?",
  },
  {
    reply:
      'Based on your brands and jurisdictions, I suggest four branded intake agents: structured request experiences that can also answer requesters\' questions. One per consumer brand, one for employees.',
    block: 'agents',
  },
  {
    reply:
      "To fulfill requests I'll work in your systems. Your data map and your data flow diagram agree on four: Salesforce, Marketo, Zendesk, and your internal warehouse. The first three have OneTrust connectors. The warehouse doesn't, so I'll work with its owner.",
    block: 'systems',
  },
  {
    reply:
      "That's everything I need. I've drafted your DSAR intake workflow as a flow chart: one path per request type, with the rules from your playbook built in. Review it, and ask me for any changes.",
    block: 'handoff',
  },
];

const THINK_MS = 900;
const WORD_MS = 28;

/** Streams a scripted reply word by word after a short "thinking" pause. */
async function* typed(text: string): AsyncIterable<string> {
  await new Promise((r) => setTimeout(r, THINK_MS));
  const words = text.split(/(\s+)/);
  for (const w of words) {
    if (!w) continue;
    yield w;
    if (w.trim()) await new Promise((r) => setTimeout(r, WORD_MS));
  }
}

// Privacy Agent setup conversation (v0 Act 1, steps 2–8): research, document
// upload, playbook, intake agents, systems, then hand-off to the flow chart.
@Component({
  selector: 'app-setup-agent',
  imports: [
    RouterLink,
    OcAssistantThread,
    OcAssistantViewport,
    OcAssistantMessage,
    OcAssistantThinking,
    OcAssistantScrollToBottom,
    OcAssistantSuggestion,
    OcAssistantComposer,
    OcAssistantInput,
    OcAssistantActions,
    OcAssistantSubmit,
    OcAvatar,
    OcBadge,
    OcButton,
    OcIcon,
    OcIconButton,
    OcStreamDirective,
    OcTag,
    OcTextarea,
    PageHeader,
  ],
  templateUrl: './setup-agent.html',
  styleUrl: './setup-agent.scss',
})
export class SetupAgent {
  protected readonly user = SIGNED_IN_USER;
  protected readonly profile = COMPANY_PROFILE;
  protected readonly documents = SETUP_DOCUMENTS;
  protected readonly playbook = PLAYBOOK;
  protected readonly agents = INTAKE_AGENTS;
  protected readonly systems = SYSTEMS;
  protected readonly steps = SETUP_STEPS;

  protected readonly turns = signal<Turn[]>([]);
  /** Index of the latest agent stage started. */
  protected readonly stage = signal(-1);
  /** Turn ids whose text has finished streaming (their block is shown). */
  protected readonly settled = signal<ReadonlySet<number>>(new Set());
  protected readonly busy = signal(false);
  protected readonly streamStates = signal<Record<number, ChoreoState>>({});
  protected readonly agentsApproved = signal(false);
  protected readonly systemsConnected = signal(false);

  /** Setup steps completed: each agent stage finishes the step before it. */
  protected readonly stepsDone = computed(() => {
    const s = this.stage();
    const last = STAGES.length - 1;
    // The hand-off stage completes the last step once its text has streamed.
    if (s === last && !this.busy()) return SETUP_STEPS.length;
    return Math.max(0, Math.min(s, SETUP_STEPS.length));
  });

  /** What the composer's suggestion chip sends now, if anything. */
  protected readonly suggestion = computed(() => {
    if (this.busy()) return undefined;
    switch (this.stage()) {
      case 0:
        return STAGES[0].next;
      case 2:
        return STAGES[2].next;
      default:
        return undefined;
    }
  });

  #nextId = 1;

  constructor() {
    this.#reply(0);
  }

  protected streamState(id: number): ChoreoState | undefined {
    return this.streamStates()[id];
  }

  protected setStreamState(id: number, state: ChoreoState): void {
    this.streamStates.update((s) => ({ ...s, [id]: state }));
  }

  protected onStreamComplete(id: number): void {
    this.settled.update((s) => new Set(s).add(id));
    this.busy.set(false);
  }

  protected isSettled(id: number): boolean {
    return this.settled().has(id);
  }

  /** Anything the user sends moves the script to the next agent turn. */
  protected onSend(text: string): void {
    const message = text.trim();
    if (!message || this.busy() || this.stage() >= STAGES.length - 1) return;
    this.#say(message);
    this.#reply(this.stage() + 1);
  }

  /** Stage 1: attach the four Meridian documents (the demo's "upload"). */
  protected attachDocuments(): void {
    if (this.busy()) return;
    this.#say('Here are our DSAR procedure, data flows, response letter examples and brand guide.', 'uploads');
    this.#reply(2);
  }

  protected approveAgents(): void {
    if (this.busy() || this.agentsApproved()) return;
    this.agentsApproved.set(true);
    this.#say('Approve all four.');
    this.#reply(4);
  }

  protected connectSystems(): void {
    if (this.busy() || this.systemsConnected()) return;
    this.systemsConnected.set(true);
    this.#say('Connect them.');
    this.#reply(5);
  }

  #say(text: string, block?: Block): void {
    this.turns.update((ts) => [...ts, { id: this.#nextId++, from: 'user', text, block }]);
  }

  #reply(stage: number): void {
    const s = STAGES[stage];
    this.stage.set(stage);
    this.busy.set(true);
    this.turns.update((ts) => [
      ...ts,
      { id: this.#nextId++, from: 'assistant', text: s.reply, block: s.block, source: typed(s.reply) },
    ]);
  }
}
