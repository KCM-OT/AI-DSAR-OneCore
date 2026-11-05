import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OcBadge } from '@onetrust/onecore/badge';
import { OcButton } from '@onetrust/onecore/button';
import {
  OcCard,
  OcCardContent,
  OcCardDescription,
  OcCardFooter,
  OcCardHeader,
  OcCardTitle,
} from '@onetrust/onecore/card';
import { OcIcon, type OcIconName } from '@onetrust/onecore/icon';
import { OcStatus } from '@onetrust/onecore/status';
import { PageHeader } from '../../shell/page-header';

interface Configuration {
  name: string;
  detail: string;
  icon: OcIconName;
}

// Setup landing (v0 step 1): choose agent-led or manual setup.
@Component({
  selector: 'app-setup',
  imports: [
    RouterLink,
    OcBadge,
    OcButton,
    OcCard,
    OcCardHeader,
    OcCardTitle,
    OcCardDescription,
    OcCardContent,
    OcCardFooter,
    OcIcon,
    OcStatus,
    PageHeader,
  ],
  templateUrl: './setup.html',
  styleUrl: './setup.scss',
})
export class Setup {
  protected readonly overview = [
    { label: 'Jurisdictions configured', value: '0', note: 'None set up yet' },
    { label: 'Request types enabled', value: '0 of 12', note: 'Access, deletion, portability/…' },
    { label: 'Automation coverage', value: '—', note: 'Available after setup' },
    { label: 'Avg. resolution time', value: '—', note: 'No requests processed' },
  ];

  protected readonly configurations: readonly Configuration[] = [
    { name: 'Webforms', detail: 'Public intake forms', icon: 'window' },
    { name: 'Workflows', detail: 'Routing & approvals', icon: 'sitemap' },
    { name: 'Integrations', detail: 'Connected systems', icon: 'chain' },
    { name: 'Response templates', detail: 'Notices & letters', icon: 'envelope' },
    { name: 'Subtask templates', detail: 'Internal task steps', icon: 'list-check' },
    { name: 'Redaction preferences', detail: 'Default rules', icon: 'eraser' },
  ];
}
