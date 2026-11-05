import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { OcAvatar } from '@onetrust/onecore/avatar';
import { OcButton } from '@onetrust/onecore/button';
import { OcIcon } from '@onetrust/onecore/icon';
import { OcIconButton } from '@onetrust/onecore/icon-button';
import { SIGNED_IN_USER } from '../data/meridian';
import { NAV_LINKS } from './nav';

// OneTrust application chrome: dark module sidebar on the left, tenant top bar
// across the content. OneCore has no side nav or app bar, so both are native
// HTML styled with --oc-* tokens.
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, OcAvatar, OcButton, OcIcon, OcIconButton],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly links = NAV_LINKS;
  protected readonly user = SIGNED_IN_USER;
}
