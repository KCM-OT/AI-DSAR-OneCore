import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  OcAssistantActions,
  OcAssistantComposer,
  OcAssistantInput,
  OcAssistantSubmit,
  OcAssistantSuggestion,
  OcAssistantThread,
} from '@onetrust/onecore/assistant';
import { OcBadge, type OcBadgeColor } from '@onetrust/onecore/badge';
import { OcButton } from '@onetrust/onecore/button';
import { OcIcon } from '@onetrust/onecore/icon';
import { OcIconButton } from '@onetrust/onecore/icon-button';
import { OcProgress } from '@onetrust/onecore/progress';
import { OcTabButton, OcTabList, OcTabPanel, OcTabs } from '@onetrust/onecore/tabs';
import { OcTextarea } from '@onetrust/onecore/textarea';
import {
  AGENT_NAME,
  HANDLED_EVENTS,
  OPEN_ITEMS,
  type OpenItemState,
  PLACEHOLDER_PROMPTS,
  PRIORITY_TASKS,
  SHORTCUTS,
  type Shortcut,
} from '../../data/chat-home';
import { SIGNED_IN_USER } from '../../data/meridian';

const VISIBLE_TASKS = 3;

const OPEN_STATE: Record<OpenItemState, { label: string; color: OcBadgeColor }> = {
  'new-reply': { label: 'New reply', color: 'info' },
  'needs-you': { label: 'Needs you', color: 'warning' },
  'in-progress': { label: 'In progress', color: 'purple' },
};

// Chat home (/chat, opened by Chat in the main menu): the Privacy Agent's start screen. Layout follows the AI Governance "Corie"
// home: greeting, composer, shortcuts, then tabs of work waiting on the user.
// The main action, here and in the first task card, is finishing the Privacy Agent setup.
@Component({
  selector: 'app-chat-home',
  imports: [
    RouterLink,
    OcAssistantThread,
    OcAssistantComposer,
    OcAssistantInput,
    OcAssistantActions,
    OcAssistantSubmit,
    OcAssistantSuggestion,
    OcBadge,
    OcButton,
    OcIcon,
    OcIconButton,
    OcProgress,
    OcTabs,
    OcTabList,
    OcTabButton,
    OcTabPanel,
    OcTextarea,
  ],
  templateUrl: './chat-home.html',
  styleUrl: './chat-home.scss',
})
export class ChatHome {
  private readonly router = inject(Router);

  protected readonly agentName = AGENT_NAME;
  protected readonly greeting = `${greetingFor(new Date())}, ${SIGNED_IN_USER.firstName}`;
  protected readonly shortcuts = SHORTCUTS;
  protected readonly openItems = OPEN_ITEMS;
  protected readonly openState = OPEN_STATE;
  protected readonly handled = HANDLED_EVENTS;

  protected readonly tab = signal('priority');

  protected readonly showAllTasks = signal(false);
  protected readonly tasks = computed(() =>
    this.showAllTasks() ? PRIORITY_TASKS : PRIORITY_TASKS.slice(0, VISIBLE_TASKS),
  );
  protected readonly taskTotal = PRIORITY_TASKS.length;

  /** The composer's placeholder cycles through example prompts. */
  private readonly promptIndex = signal(0);
  protected readonly placeholder = computed(() => PLACEHOLDER_PROMPTS[this.promptIndex()]);

  constructor() {
    const timer = setInterval(
      () => this.promptIndex.update((i) => (i + 1) % PLACEHOLDER_PROMPTS.length),
      4000,
    );
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected openShortcut(s: Shortcut): void {
    if (s.link) this.router.navigateByUrl(s.link);
  }

  // Conversations aren't built yet: a sent prompt opens a new chat.
  protected onSend(): void {
    this.router.navigateByUrl('/chats/new');
  }
}

function greetingFor(now: Date): string {
  const h = now.getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

