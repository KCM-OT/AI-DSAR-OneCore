import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OcBadge, type OcBadgeColor } from '@onetrust/onecore/badge';
import { OcButton } from '@onetrust/onecore/button';
import {
  OcCard,
  OcCardContent,
  OcCardDescription,
  OcCardHeader,
  OcCardTitle,
} from '@onetrust/onecore/card';
import {
  type ColumnDef,
  createSortedRowModel,
  injectTable,
  OcDataGrid,
  OcDataGridCellDef,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
} from '@onetrust/onecore/data-grid';
import { OcIcon } from '@onetrust/onecore/icon';
import { OcMenu, OcMenuItemRadio, OcMenuRadioGroup, OcMenuTrigger } from '@onetrust/onecore/menu';
import { OcStatus, type OcStatusIntent } from '@onetrust/onecore/status';
import {
  OcToggleButtonGroup,
  OcToggleButtonGroupItem,
} from '@onetrust/onecore/toggle-button-group';
import {
  ACTIVITY,
  ATTENTION_KINDS,
  type AttentionKind,
  BY_JURISDICTION,
  BY_SOURCE,
  DATE_RANGES,
  DEADLINE_BUCKETS,
  type DeadlineStatus,
  type FilterOption,
  JURISDICTIONS,
  KPIS,
  MONTHLY_VOLUME,
  MY_WORK,
  NEEDS_ATTENTION,
  ORGANIZATIONS,
  PIPELINE,
  REQUEST_TYPES,
  SAVED_VIEWS,
  SETUP_HEALTH,
  type SetupState,
  TEAM_LOAD,
  type WorkItem,
} from '../../data/command-center';
import { PageHeader } from '../../shell/page-header';
import { type BarListItem, BarList } from './bar-list';
import { TYPE_COLORS, VolumeChart } from './volume-chart';

const ATTENTION_COLOR: Record<AttentionKind, OcBadgeColor> = {
  overdue: 'destructive',
  'due-soon': 'warning',
  unassigned: 'neutral',
  approval: 'info',
  duplicate: 'purple',
  integration: 'destructive',
};

// Deadline buckets use status colours, always alongside their text label.
const DEADLINE_COLOR: Record<DeadlineStatus, string> = {
  critical: 'var(--oc-destructive)',
  warning: 'var(--oc-supportive-orange)',
  neutral: 'var(--oc-supportive-grey)',
};

const SETUP_INTENT: Record<SetupState, { intent: OcStatusIntent; label: string }> = {
  ok: { intent: 'success', label: 'Healthy' },
  warning: { intent: 'warning', label: 'Needs attention' },
  error: { intent: 'error', label: 'Failing' },
};

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
});

const WORK_COLUMNS: ColumnDef<typeof features, WorkItem, any>[] = [
  { id: 'id', accessorKey: 'id', header: 'ID' },
  { id: 'item', accessorKey: 'item', header: 'Item' },
  { id: 'title', accessorKey: 'title', header: 'Data subject or subtask' },
  { id: 'type', accessorKey: 'type', header: 'Type' },
  { id: 'jurisdiction', accessorKey: 'jurisdiction', header: 'Jurisdiction' },
  { id: 'stage', accessorKey: 'stage', header: 'Stage' },
  { id: 'due', accessorKey: 'dueIn', header: 'Due', sortFn: 'basic' },
];

// Command center (/command-center): the privacy leader's home. Top: global filters and the health
// snapshot. Middle: what needs action (left) and volume (right). Bottom: pipeline and deadlines,
// my work and team load, program setup health, activity and saved views.
@Component({
  selector: 'app-command-center',
  imports: [
    RouterLink,
    PageHeader,
    BarList,
    VolumeChart,
    OcBadge,
    OcButton,
    OcCard,
    OcCardHeader,
    OcCardTitle,
    OcCardDescription,
    OcCardContent,
    OcDataGrid,
    OcDataGridCellDef,
    OcIcon,
    OcMenu,
    OcMenuTrigger,
    OcMenuRadioGroup,
    OcMenuItemRadio,
    OcStatus,
    OcToggleButtonGroup,
    OcToggleButtonGroupItem,
  ],
  templateUrl: './command-center.html',
  styleUrl: './command-center.scss',
})
export class CommandCenter {
  // ---- Global filters (the prototype's figures don't change with them).
  protected readonly filters = [
    { id: 'range', icon: 'calendar-days', options: DATE_RANGES, value: signal('30d') },
    { id: 'org', icon: 'buildings', options: ORGANIZATIONS, value: signal('all') },
    { id: 'type', icon: 'ticket', options: REQUEST_TYPES, value: signal('all') },
    { id: 'jurisdiction', icon: 'earth-americas', options: JURISDICTIONS, value: signal('all') },
  ] as const;

  protected labelOf(options: readonly FilterOption[], value: string): string {
    return options.find((o) => o.value === value)?.label ?? '';
  }

  // ---- 1. Health snapshot
  protected readonly kpis = KPIS;

  // ---- 2. Needs attention
  protected readonly attentionKinds = ATTENTION_KINDS;
  protected readonly attentionColor = ATTENTION_COLOR;
  protected readonly attentionFilter = signal<AttentionKind | 'all'>('all');
  protected readonly attention = computed(() => {
    const f = this.attentionFilter();
    return f === 'all' ? NEEDS_ATTENTION : NEEDS_ATTENTION.filter((a) => a.kind === f);
  });
  protected readonly attentionCounts = computed(() => {
    const counts = new Map<AttentionKind, number>();
    for (const a of NEEDS_ATTENTION) counts.set(a.kind, (counts.get(a.kind) ?? 0) + 1);
    return [...counts.entries()].map(([kind, count]) => ({ kind, count }));
  });
  protected readonly attentionTotal = NEEDS_ATTENTION.length;

  // ---- 3. Volume and mix
  protected readonly monthly = MONTHLY_VOLUME;
  protected readonly mix = signal<'jurisdiction' | 'source'>('jurisdiction');
  protected readonly mixItems = computed<readonly BarListItem[]>(() =>
    this.mix() === 'jurisdiction' ? BY_JURISDICTION : BY_SOURCE,
  );
  protected readonly typeShare = computed(() => {
    const latest = MONTHLY_VOLUME[MONTHLY_VOLUME.length - 1].counts;
    const total = Object.values(latest).reduce((a, b) => a + b, 0);
    return (Object.keys(latest) as (keyof typeof latest)[]).map((t) => ({
      type: t,
      pct: Math.round((latest[t] / total) * 100),
      color: TYPE_COLORS[t],
    }));
  });

  // ---- 4. Pipeline and deadlines
  protected readonly pipeline = PIPELINE;
  protected readonly deadlines: readonly BarListItem[] = DEADLINE_BUCKETS.map((b) => ({
    label: b.label,
    value: b.value,
    color: DEADLINE_COLOR[b.status],
    note: b.status === 'critical' ? 'Critical' : b.status === 'warning' ? 'Warning' : undefined,
  }));

  // ---- 5. My work and team load
  protected readonly work = injectTable(() => ({
    features,
    columns: WORK_COLUMNS,
    data: MY_WORK as WorkItem[],
    getRowId: (row: WorkItem) => row.id + row.title,
  }));
  protected readonly typeColors = TYPE_COLORS;
  protected readonly teamLoad = TEAM_LOAD;

  // ---- 6. Program setup health
  protected readonly setupHealth = SETUP_HEALTH;
  protected readonly setupIntent = SETUP_INTENT;

  // ---- 7. Activity and shortcuts
  protected readonly activity = ACTIVITY;
  protected readonly savedViews = SAVED_VIEWS;
}
