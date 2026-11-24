import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { findNavLink } from '../shell/nav';
import { PageHeader } from '../shell/page-header';

// Stand-in for every route that doesn't have its own page yet.
@Component({
  selector: 'app-placeholder',
  imports: [PageHeader],
  template: `
    <app-page-header [title]="label()" />
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
  // The '**' route reuses this component between placeholder pages, so follow the URL.
  readonly #router = inject(Router);
  protected readonly label = toSignal(
    this.#router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.#labelFor(this.#router.url)),
    ),
    { initialValue: this.#labelFor(this.#router.url) },
  );

  #labelFor(url: string): string {
    return findNavLink(url.split('?')[0])?.label ?? 'Not found';
  }
}
