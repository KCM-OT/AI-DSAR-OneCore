import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OcAlert } from '@onetrust/onecore/alert';
import { OcAvatar } from '@onetrust/onecore/avatar';
import { OcButton } from '@onetrust/onecore/button';
import {
  type ColumnDef,
  columnFacetingFeature,
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  injectTable,
  OcDataGrid,
  OcDataGridCellDef,
  OcDataGridColumnMenu,
  OcDataGridFooter,
  OcDataGridNoResultsDef,
  OcDataGridSearch,
  OcDataGridToolbar,
  ocFilterFnOneOf,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
} from '@onetrust/onecore/data-grid';
import { OcIcon } from '@onetrust/onecore/icon';
import { OcIconButton } from '@onetrust/onecore/icon-button';
import { OcMenu, OcMenuItem, OcMenuItemRadio, OcMenuRadioGroup, OcMenuTrigger } from '@onetrust/onecore/menu';
import { OcTag, type OcTagColor } from '@onetrust/onecore/tag';
import { AgentWorkflows } from '../../../data/agent-workflows';
import { FLOW_TYPE_COLORS } from '../../../data/workflow-draft';
import {
  formatWorkflowDate,
  type Workflow,
  WORKFLOW_VIEWS,
  WORKFLOWS,
  type WorkflowStatus,
  type WorkflowView,
} from '../../../data/workflows';
import { PageHeader } from '../../../shell/page-header';

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  globalFilteringFeature,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString, oneOf: ocFilterFnOneOf },
  columnFacetingFeature,
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  columnVisibilityFeature,
  columnSizingFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const COLUMNS: ColumnDef<typeof features, Workflow, any>[] = [
  { id: 'name', accessorKey: 'name', header: 'Workflow name', minSize: 240, size: 260, meta: { oc: { rowHeader: true } } },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    filterFn: 'oneOf',
    enableGlobalFilter: false,
    meta: { oc: { filter: 'select' } },
  },
  { id: 'organization', accessorKey: 'organization', header: 'Organization', size: 150, enableGlobalFilter: false },
  {
    id: 'updatedBy',
    accessorFn: (w) => w.updatedBy?.name ?? 'OneTrust',
    header: 'Last updated by',
    size: 180,
    filterFn: 'oneOf',
    meta: { oc: { filter: 'select' } },
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: 'Last updated date',
    size: 170,
    sortFn: 'basic',
    enableGlobalFilter: false,
  },
  {
    id: 'createdBy',
    accessorFn: (w) => w.createdBy?.name ?? 'OneTrust',
    header: 'Created by',
    size: 180,
    filterFn: 'oneOf',
    meta: { oc: { filter: 'select' } },
  },
];

const STATUS_COLOR: Record<WorkflowStatus, OcTagColor | undefined> = {
  Draft: undefined,
  Activated: 'green',
  Deactivated: 'gray',
};

// Setup › Workflows (/setup/workflows), laid out like the OneTrust DSAR Workflows list
// (qa.1trust.app/dsar/workflows): page header with Create workflow, two notices, a view menu and
// search above the list, and a paged table. The Privacy Agent's drafts from setup (/setup/agent)
// are listed first, marked "Privacy Agent".
@Component({
  selector: 'app-workflows',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    PageHeader,
    OcAlert,
    OcAvatar,
    OcButton,
    OcDataGrid,
    OcDataGridCellDef,
    OcDataGridColumnMenu,
    OcDataGridFooter,
    OcDataGridNoResultsDef,
    OcDataGridSearch,
    OcDataGridToolbar,
    OcIcon,
    OcIconButton,
    OcMenu,
    OcMenuItem,
    OcMenuItemRadio,
    OcMenuRadioGroup,
    OcMenuTrigger,
    OcTag,
  ],
  templateUrl: './workflows.html',
  styleUrl: './workflows.scss',
})
export class Workflows {
  readonly #agent = inject(AgentWorkflows);
  protected readonly agentDrafts = this.#agent.workflows;

  protected readonly views = WORKFLOW_VIEWS;
  protected readonly view = signal<WorkflowView>('all');
  protected readonly viewLabel = computed(() => WORKFLOW_VIEWS.find((v) => v.id === this.view())!.label);

  /** The two notices above the list (reference: automation wizard, workflow templates). */
  protected readonly showAgentNotice = signal(true);
  protected readonly showTemplatesNotice = signal(true);

  protected statusColor(w: Workflow): OcTagColor | undefined {
    return STATUS_COLOR[w.status];
  }

  protected typeColor(w: Workflow): string | null {
    return w.requestType ? FLOW_TYPE_COLORS[w.requestType] : null;
  }

  protected readonly date = formatWorkflowDate;

  /** Agent drafts first, then everything else, narrowed by the chosen view. */
  protected readonly rows = computed(() => {
    const all = [...this.agentDrafts(), ...WORKFLOWS];
    switch (this.view()) {
      case 'agent':
        return all.filter((w) => w.agent);
      case 'draft':
        return all.filter((w) => w.status === 'Draft');
      case 'activated':
        return all.filter((w) => w.status === 'Activated');
      default:
        return all;
    }
  });

  protected readonly table = injectTable(() => ({
    features,
    columns: COLUMNS,
    data: this.rows(),
    getRowId: (row: Workflow) => row.id,
    globalFilterFn: 'includesString',
    initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
  }));
}
