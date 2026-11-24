import { afterNextRender, Component, computed, effect, ElementRef, inject, Injector, input, signal } from '@angular/core';
import { OcBadge } from '@onetrust/onecore/badge';
import { OcIcon } from '@onetrust/onecore/icon';
import { OcProgress } from '@onetrust/onecore/progress';
import { OcSkeleton } from '@onetrust/onecore/skeleton';
import { OcTag } from '@onetrust/onecore/tag';
import {
  OcToggleButtonGroup,
  OcToggleButtonGroupItem,
} from '@onetrust/onecore/toggle-button-group';
import { COMPANY_PROFILE, INTAKE_AGENTS, type UploadedDoc } from '../../../data/meridian';
import {
  DRAFT_SECTIONS,
  type DraftSection,
  FLOW_TYPE_COLORS,
  REGULATIONS,
  REQUEST_TYPE_PURPOSE,
  REQUEST_TYPES,
  type RequestType,
  SYSTEM_ACTIONS,
  WORKFLOW_RULES,
} from '../../../data/workflow-draft';
import { FlowChart } from './flow-chart';

/** The user's answers so far. `null` means the question hasn't been answered yet. */
export interface DraftState {
  regulations: readonly string[] | null;
  documents: readonly UploadedDoc[] | null;
  rules: readonly string[] | null;
  agents: readonly string[] | null;
  systems: readonly string[] | null;
}

interface PathStep {
  label: string;
  detail?: string;
  /** Playbook source that put this step here. */
  source?: string;
  kind: 'stage' | 'system' | 'rule' | 'gap';
}

// The artifact beside the setup conversation: the DSAR intake workflow, drafted section by section
// as the user answers the Privacy Agent. A section shows a skeleton until its answer arrives, and
// is highlighted (and scrolled into view) while it updates.
@Component({
  selector: 'app-workflow-draft',
  imports: [FlowChart, OcBadge, OcIcon, OcProgress, OcSkeleton, OcTag, OcToggleButtonGroup, OcToggleButtonGroupItem],
  templateUrl: './workflow-draft.html',
  styleUrl: './workflow-draft.scss',
})
export class WorkflowDraft {
  readonly state = input.required<DraftState>();
  /** The section being rewritten right now, if any. */
  readonly updating = input<DraftSection | null>(null);
  /** The agent has finished the draft. */
  readonly ready = input(false);
  /** The section the latest answer changed, highlighted in the flow chart. */
  readonly changed = input<DraftSection | null>(null);

  /** Workflow draft (sections) or the same draft as a flow chart. */
  protected readonly view = signal<'draft' | 'flow'>('draft');

  protected setView(values: readonly string[]): void {
    if (values[0] === 'draft' || values[0] === 'flow') this.view.set(values[0]);
  }

  protected readonly sections = DRAFT_SECTIONS;
  protected readonly requestTypes = REQUEST_TYPES;
  protected readonly purpose = REQUEST_TYPE_PURPOSE;
  protected readonly typeColors = FLOW_TYPE_COLORS;
  protected readonly brands = COMPANY_PROFILE.find((r) => r.label === 'Brands')!.values;
  protected readonly countries = COMPANY_PROFILE.find((r) => r.label === 'Customer countries')!.values;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  constructor() {
    // Bring the section being updated into view.
    effect(() => {
      const id = this.updating();
      if (!id || this.view() !== 'draft') return;
      // Scroll only the panel (scrollIntoView would also scroll the page around it).
      afterNextRender(() => {
        const root = this.host.nativeElement;
        const panel = root.querySelector<HTMLElement>('.scroll');
        const section = root.querySelector<HTMLElement>(`#draft-${id}`);
        if (!panel || !section) return;
        const top =
          section.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
        panel.scrollTo({ top: top - 16, behavior: 'smooth' });
      }, { injector: this.injector });
    });
  }

  protected filled(id: DraftSection): boolean {
    const s = this.state();
    const value = {
      scope: s.regulations,
      sources: s.documents,
      rules: s.rules,
      intake: s.agents,
      paths: s.systems,
    }[id];
    return value !== null && this.updating() !== id;
  }

  protected readonly done = computed(
    () => DRAFT_SECTIONS.filter((s) => this.filled(s.id)).length,
  );

  protected readonly pct = computed(() => Math.round((this.done() / DRAFT_SECTIONS.length) * 100));

  protected readonly status = computed(() => {
    if (this.updating()) return { label: 'Updating', color: 'purple' as const };
    if (this.ready()) return { label: 'Ready for review', color: 'success' as const };
    if (this.done() === 0) return { label: 'Not started', color: 'neutral' as const };
    return { label: 'Drafting', color: 'info' as const };
  });

  protected readonly regulations = computed(() =>
    REGULATIONS.filter((r) => this.state().regulations?.includes(r.id)),
  );

  protected readonly rules = computed(() =>
    WORKFLOW_RULES.filter((r) => this.state().rules?.includes(r.id)),
  );

  /** Chosen intake agents, each listing only the regulations kept in scope. */
  protected readonly agents = computed(() => {
    const inScope = new Set(this.regulations().map((r) => r.label));
    return INTAKE_AGENTS.filter((a) => this.state().agents?.includes(a.brand)).map((a) => ({
      ...a,
      regulations: inScope.size ? a.regulations.filter((r) => inScope.has(r)) : a.regulations,
    }));
  });

  protected readonly regulationLabels = computed(() => this.regulations().map((r) => r.label));

  /** One lane per request type, built from the chosen rules and systems. */
  protected readonly paths = computed(() => {
    const s = this.state();
    const rules = new Set(s.rules ?? []);
    const systems = s.systems ?? [];
    const agentCount = s.agents?.length ?? 0;

    return REQUEST_TYPES.map((type) => {
      const steps: PathStep[] = [
        {
          label: 'Intake',
          detail: agentCount ? `${agentCount} intake agent${agentCount === 1 ? '' : 's'}` : 'Web form',
          kind: 'stage',
        },
      ];
      if (rules.has('verify')) {
        steps.push({ label: 'Verify identity', source: 'SOP §2.1', kind: 'rule' });
      }
      const systemSteps = systems
        .filter((name) => SYSTEM_ACTIONS[name]?.[type])
        .map<PathStep>((name) => ({
          label: SYSTEM_ACTIONS[name][type]!,
          detail: name === 'Internal warehouse' ? 'Warehouse · Daniel Okafor' : name,
          kind: 'system',
        }));
      steps.push(
        ...(systemSteps.length
          ? systemSteps
          : [{ label: 'No system selected', detail: 'Choose one in the conversation', kind: 'gap' as const }]),
      );
      if (type === 'Access' && rules.has('redact')) {
        steps.push(
          { label: 'Redact third-party data', source: 'SOP §4.2', kind: 'rule' },
          { label: 'Privacy sign-off', source: 'SOP §4.2', kind: 'rule' },
        );
      }
      if (type === 'Deletion' && rules.has('legal-hold')) {
        steps.push({ label: 'Route disputes to Legal', source: 'SOP §5.3', kind: 'rule' });
      }
      steps.push(
        {
          label: 'Generate response',
          detail: rules.has('voice') ? 'Meridian letter + voice' : undefined,
          source: rules.has('voice') ? 'Brand + Tone Guide' : undefined,
          kind: rules.has('voice') ? 'rule' : 'stage',
        },
        { label: 'Deliver', kind: 'stage' },
      );
      return { type: type as RequestType, steps };
    });
  });
}
