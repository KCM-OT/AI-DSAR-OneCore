import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { findNavLink } from '../shell/nav';
import { PageHeader } from '../shell/page-header';

// Stand-in for every route that doesn't have its own page yet.
@Component({
  selector: 'app-placeholder',
  imports: [PageHeader],
  template: `
    <app-page-header [title]="label" />
    <div class="empty">
      <p class="title">Not built yet</p>
      <p>This screen from the v0 demo hasn't been rebuilt yet (see <code>docs/v0-reference.md</code>).</p>
    </div>
  `,
  styles: `
    .empty {
      max-width: 28rem;
      margin: auto;
      padding: var(--oc-spacing-8);
      text-align: center;
      font-size: var(--oc-font-size-sm);
      color: var(--oc-muted-foreground);
    }
    .title {
      font-size: var(--oc-font-size-md);
      font-weight: var(--oc-font-weight-emphasis);
      color: var(--oc-foreground);
    }
    code {
      padding: 0 var(--oc-spacing-1);
      border-radius: var(--oc-control-radius-sm);
      background: var(--oc-secondary);
    }
  `,
})
export class Placeholder {
  protected readonly label = findNavLink(inject(Router).url.split('?')[0])?.label ?? 'Not found';
}
