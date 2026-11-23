import { Component, computed, input, signal } from '@angular/core';
import { OcButton } from '@onetrust/onecore/button';
import { type MonthVolume, TYPE_SERIES, type RequestType } from '../../data/command-center';

/** Fixed colour per request type (validated for colour-blind separation in this order). */
export const TYPE_COLORS: Record<RequestType, string> = {
  Access: 'var(--oc-supportive-blue)',
  Deletion: 'var(--oc-supportive-pink)',
  'Opt-out': 'var(--oc-supportive-yellow)',
  Correction: 'var(--oc-supportive-purple)',
};

interface Hover {
  month: string;
  type: RequestType;
  value: number;
  total: number;
  /** Column index, to place the tooltip. */
  index: number;
}

// Requests over time, stacked by request type (monthly). Thin columns with a 2px surface gap
// between segments, a rounded top, a legend, a hover tooltip per segment, and a table view.
@Component({
  selector: 'app-volume-chart',
  imports: [OcButton],
  template: `
    <div class="head">
      <ul class="legend" aria-label="Request types">
        @for (t of series; track t) {
          <li><span class="swatch" [style.background]="colors[t]"></span>{{ t }}</li>
        }
      </ul>
      <button oc-button variant="tertiary" size="sm" (click)="asTable.set(!asTable())">
        {{ asTable() ? 'Show chart' : 'Show table' }}
      </button>
    </div>

    @if (asTable()) {
      <table class="table">
        <caption class="visually-hidden">Requests per month by type</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            @for (t of series; track t) {
              <th scope="col">{{ t }}</th>
            }
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          @for (m of columns(); track m.month) {
            <tr>
              <th scope="row">{{ m.month }}</th>
              @for (t of series; track t) {
                <td>{{ m.counts[t] }}</td>
              }
              <td>{{ m.total }}</td>
            </tr>
          }
        </tbody>
      </table>
    } @else {
      <div class="plot" role="img" [attr.aria-label]="summary()" (mouseleave)="hover.set(null)">
        <div class="grid" aria-hidden="true">
          @for (t of ticks(); track t) {
            <div class="gridline" [style.bottom.%]="(t / scaleMax()) * 100">
              <span>{{ t }}</span>
            </div>
          }
        </div>
        <div class="columns">
          @for (m of columns(); track m.month; let i = $index; let last = $last) {
            <div class="column">
              <div class="stack" [style.height.%]="(m.total / scaleMax()) * 100">
                @if (last) {
                  <span class="total">{{ m.total }}</span>
                }
                @for (s of m.segments; track s.type) {
                  <span
                    class="segment"
                    [style.flex-grow]="s.value"
                    [style.background]="colors[s.type]"
                    (mouseenter)="
                      hover.set({ month: m.month, type: s.type, value: s.value, total: m.total, index: i })
                    "
                  ></span>
                }
              </div>
              <span class="month">{{ m.month }}</span>
            </div>
          }
        </div>
        @if (hover(); as h) {
          <div class="tooltip" [style.left.%]="((h.index + 0.5) / columns().length) * 100">
            <strong>{{ h.month }}</strong>
            <span><span class="swatch" [style.background]="colors[h.type]"></span>{{ h.type }}: {{ h.value }}</span>
            <span class="muted">{{ h.total }} requests in total</span>
          </div>
        }
      </div>
    }
  `,
  styleUrl: './volume-chart.scss',
})
export class VolumeChart {
  readonly data = input.required<readonly MonthVolume[]>();

  protected readonly series = TYPE_SERIES;
  protected readonly colors = TYPE_COLORS;
  protected readonly asTable = signal(false);
  protected readonly hover = signal<Hover | null>(null);

  protected readonly columns = computed(() =>
    this.data().map((m) => ({
      month: m.month,
      counts: m.counts,
      // Access sits at the bottom of each stack, so list segments top-down.
      segments: [...TYPE_SERIES].reverse().map((type) => ({ type, value: m.counts[type] })),
      total: TYPE_SERIES.reduce((sum, t) => sum + m.counts[t], 0),
    })),
  );

  protected readonly scaleMax = computed(() => {
    const max = Math.max(...this.columns().map((c) => c.total));
    return Math.ceil(max / 100) * 100;
  });

  protected readonly ticks = computed(() => {
    const step = this.scaleMax() / 4;
    return [0, 1, 2, 3, 4].map((i) => i * step);
  });

  protected readonly summary = computed(() => {
    const cols = this.columns();
    const first = cols[0];
    const last = cols[cols.length - 1];
    return `Requests per month by type, ${first.month} to ${last.month}: from ${first.total} to ${last.total}. Use Show table for the figures.`;
  });
}
