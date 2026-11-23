import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OcBadge } from '@onetrust/onecore/badge';
import { type OcBreadcrumbItem, OcBreadcrumbs } from '@onetrust/onecore/breadcrumbs';
import { OcButton } from '@onetrust/onecore/button';
import { OcIcon } from '@onetrust/onecore/icon';
import { OcIconButton } from '@onetrust/onecore/icon-button';
import { OcInput } from '@onetrust/onecore/input';
import {
  OcMenu,
  OcMenuItem,
  OcMenuItemRadio,
  OcMenuRadioGroup,
  OcMenuTrigger,
} from '@onetrust/onecore/menu';
import { OcTag } from '@onetrust/onecore/tag';
import {
  OcToggleButtonGroup,
  OcToggleButtonGroupItem,
} from '@onetrust/onecore/toggle-button-group';
import { AGENT_NAME } from '../../data/chat-home';
import { CHATS, type ChatRecord } from '../../data/chats';

type ChatFilter = 'all' | 'new' | 'pinned';
type ChatSort = 'recent' | 'oldest' | 'title';

const SORTS: readonly { value: ChatSort; label: string }[] = [
  { value: 'recent', label: 'Last activity' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title A–Z' },
];

// All chats (/chats): every Privacy Agent chat in the DSAR module. Layout follows the AI Governance
// "Corie" chats list: breadcrumb and title, search with All / New replies / Pinned and a sort
// menu, then one row per chat with its opening question, the artifact it produced and when it
// was last active. Pin and delete only change this page's local list.
@Component({
  selector: 'app-all-chats',
  imports: [
    FormsModule,
    RouterLink,
    OcBadge,
    OcBreadcrumbs,
    OcButton,
    OcIcon,
    OcIconButton,
    OcInput,
    OcMenu,
    OcMenuItem,
    OcMenuItemRadio,
    OcMenuRadioGroup,
    OcMenuTrigger,
    OcTag,
    OcToggleButtonGroup,
    OcToggleButtonGroupItem,
  ],
  templateUrl: './all-chats.html',
  styleUrl: './all-chats.scss',
})
export class AllChats {
  private readonly router = inject(Router);

  protected readonly breadcrumbs: readonly OcBreadcrumbItem[] = [
    { label: 'Chat' },
    { label: 'All chats' },
  ];

  protected readonly chats = signal<readonly ChatRecord[]>(CHATS);
  protected readonly query = signal('');
  protected readonly filter = signal<ChatFilter>('all');
  protected readonly sort = signal<ChatSort>('recent');
  protected readonly sorts = SORTS;
  protected readonly sortLabel = computed(() => SORTS.find((s) => s.value === this.sort())!.label);

  protected readonly summary = computed(() => {
    const all = this.chats();
    const replies = all.filter((c) => c.newReply).length;
    const chats = `${all.length} chat${all.length === 1 ? '' : 's'} with the ${AGENT_NAME}`;
    return replies ? `${chats} · ${replies} with a new reply` : chats;
  });

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    const rows = this.chats().filter(
      (c) =>
        (f === 'all' || (f === 'new' && c.newReply) || (f === 'pinned' && c.pinned)) &&
        (!q || c.title.toLowerCase().includes(q) || c.prompt.toLowerCase().includes(q)),
    );
    const sort = this.sort();
    return [...rows].sort((a, b) =>
      sort === 'title'
        ? a.title.localeCompare(b.title)
        : sort === 'oldest'
          ? b.createdDaysAgo - a.createdDaysAgo
          : a.minutesAgo - b.minutesAgo,
    );
  });

  protected linkFor(c: ChatRecord): string {
    return c.link ?? `/chats/${c.id}`;
  }

  protected onCrumb(item: OcBreadcrumbItem): void {
    if (item.label === 'Chat') this.router.navigateByUrl('/chat');
  }

  protected setFilter(values: readonly string[]): void {
    if (values[0]) this.filter.set(values[0] as ChatFilter);
  }

  protected togglePin(c: ChatRecord): void {
    this.chats.update((all) => all.map((x) => (x.id === c.id ? { ...x, pinned: !x.pinned } : x)));
  }

  protected remove(c: ChatRecord): void {
    this.chats.update((all) => all.filter((x) => x.id !== c.id));
  }
}
