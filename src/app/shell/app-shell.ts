import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { OcAvatar } from '@onetrust/onecore/avatar';
import { OcButton } from '@onetrust/onecore/button';
import { OcIcon } from '@onetrust/onecore/icon';
import { OcIconButton } from '@onetrust/onecore/icon-button';
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
  protected readonly user = SIGNED_IN_USER;
  protected readonly tenant = TENANT;

  /** Icon-only sidebar, toggled from the header button. */
  protected readonly collapsed = signal(false);
  /** Chat's secondary menu. The menu itself is still to be designed; this only tracks the toggle. */
  protected readonly chatOpen = signal(false);
}
