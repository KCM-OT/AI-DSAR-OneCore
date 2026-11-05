import { Component } from '@angular/core';
import { OcButton } from '@onetrust/onecore/button';
import {
  OcCard,
  OcCardContent,
  OcCardDescription,
  OcCardFooter,
  OcCardHeader,
  OcCardTitle,
} from '@onetrust/onecore/card';
import { OcIcon } from '@onetrust/onecore/icon';

// Placeholder start page. Replaced by the screens ported from the v0 prototype.
@Component({
  selector: 'app-home',
  imports: [OcButton, OcCard, OcCardHeader, OcCardTitle, OcCardDescription, OcCardContent, OcCardFooter, OcIcon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
