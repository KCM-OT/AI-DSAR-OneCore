import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { OcAvatar } from '@onetrust/onecore/avatar';
import { OcButton } from '@onetrust/onecore/button';
import { OcIcon } from '@onetrust/onecore/icon';
import { OcIconButton } from '@onetrust/onecore/icon-button';
import { filter } from 'rxjs';
import { CHAT_THREADS } from '../data/chats';
import { SIGNED_IN_USER, TENANT } from '../data/meridian';
import { MODULE_LINKS, WORKSPACE_LINKS } from './nav';

// OneTrust application chrome: the dark left navigation and the tenant top bar. OneCore has no
// side nav or app bar, so both are native HTML styled with --oc-* tokens. The sidebar renders in
// OneCore dark mode (data-mode="dark"), so its tokens resolve to their dark values.
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, OcAvatar, OcButton, OcIcon, OcIconButton],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly moduleLinks = MODULE_LINKS;
  protected readonly workspaceLinks = WORKSPACE_LINKS;
  protected readonly chats = CHAT_THREADS;
  protected readonly user = SIGNED_IN_USER;
  protected readonly tenant = TENANT;

  /** Icon-only sidebar, toggled from the header button. */
  protected readonly collapsed = signal(false);
  /** The Chat workspace menu is showing in place of the main menu. */
  protected readonly chatOpen = signal(false);

  private readonly router = inject(Router);
  private readonly chatButton = viewChild.required<ElementRef<HTMLButtonElement>>('chatButton');
  private readonly backButton = viewChild.required<ElementRef<HTMLButtonElement>>('backButton');

  constructor() {
    // Landing on a chat page (a reload or a deep link) shows the Chat menu.
    const router = this.router;
    router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        if (/^\/chats?(\/|$|\?)/.test(e.urlAfterRedirects)) this.chatOpen.set(true);
      });
  }

  // Focus follows the slide, so keyboard users land in the menu that just appeared.
  // Chat opens its menu and the Chat home page (/chat).
  protected openChat(): void {
    this.chatOpen.set(true);
    this.router.navigateByUrl('/chat');
    setTimeout(() => this.backButton().nativeElement.focus({ preventScroll: true }));
  }

  protected closeChat(): void {
    this.chatOpen.set(false);
    setTimeout(() => this.chatButton().nativeElement.focus({ preventScroll: true }));
  }
}
