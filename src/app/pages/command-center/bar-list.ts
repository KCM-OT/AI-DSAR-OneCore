import { Component, computed, input } from '@angular/core';

export interface BarListItem {
  label: string;
  value: number;
  /** CSS colour for this bar; defaults to the list's colour. */
  color?: string;
  /** Visually hidden prefix, e.g. a status word, so meaning never rests on colour alone. */
  note?: string;
}

// Horizontal bars with the label above and the value at the end: one hue, direct-labelled, so it
// needs no legend or axis. Bars are scaled to the largest value in the list.
@Component({
  selector: 'app-bar-list',
  template: `
    <ul [attr.aria-label]="label()">
      @for (item of rows(); track item.label) {
        <li [title]="item.label + ': ' + item.value">
          <span class="name">
            @if (item.note) {
              <span class="visually-hidden">{{ item.note }}:</span>
            }
            {{ item.label }}
          </span>
          <span class="track" aria-hidden="true">
            <span
              class="fill"
              [style.width.%]="item.pct"
              [style.background]="item.color ?? color()"
            ></span>
          </span>
          <span class="value">{{ item.value }}</span>
        </li>
      }
    </ul>
  `,
  styles: `
    ul {
      display: flex;
      flex-direction: column;
      gap: var(--oc-spacing-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: var(--oc-spacing-1) var(--oc-spacing-3);
      font-size: var(--oc-font-size-sm);
    }
    .name {
      grid-column: 1 / -1;
      color: var(--oc-foreground);
    }
    .track {
      height: 8px;
      border-radius: var(--oc-control-radius-full);
      background: var(--oc-secondary);
    }
    .fill {
      display: block;
      height: 100%;
      min-width: 4px;
      border-radius: var(--oc-control-radius-full);
    }
    .value {
      min-width: 2.5em;
      color: var(--oc-foreground);
      font-variant-numeric: tabular-nums;
      font-weight: var(--oc-font-weight-emphasis);
      text-align: right;
    }
  `,
})
export class BarList {
  readonly items = input.required<readonly BarListItem[]>();
  readonly label = input.required<string>();
  readonly color = input('var(--oc-supportive-blue)');

  protected readonly rows = computed(() => {
    const max = Math.max(...this.items().map((i) => i.value), 1);
    return this.items().map((i) => ({ ...i, pct: (i.value / max) * 100 }));
  });
}
