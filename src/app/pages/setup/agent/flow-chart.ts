import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { OcTag } from '@onetrust/onecore/tag';
import { INTAKE_AGENTS } from '../../../data/meridian';
import {
  type DraftSection,
  FLOW_ORDER,
  FLOW_TYPE_COLORS,
  REGULATIONS,
  REQUEST_TYPE_PURPOSE,
  type RequestType,
  SYSTEM_ACTIONS,
} from '../../../data/workflow-draft';
import type { DraftState } from './workflow-draft';

// Geometry, in chart pixels before zoom (DSR 2026 Figma "workflow for vercel", node 187:3734,
// tightened to fit the artifact panel).
const W = 168; // node width
const H = 60; // node height
const ROW = 12; // gap between stacked nodes
const PAD = 16; // group padding
const BLOCK_GAP = 28; // gap between branch blocks
const X = {
  intake: 0,
  verify: 204,
  label: 412,
  group: 532,
  system: 552,
  rule1: 760,
  rule2: 956,
  single: 956,
  generate: 1184,
  deliver: 1388,
};
const GROUP_RIGHT = X.rule2 + W + 20;
const CHART_W = X.deliver + W + 8;
/** Where the chart sits inside the scrollable canvas (matches .chart in the stylesheet). */
const CHART_LEFT = 48;
const CHART_TOP = 72;
/** Confirm animation: each element springs in this long after the one before it. */
const STAGGER_MS = 110;
const SPRING_MS = 520;

type Tone =
  | 'endpoint'
  | 'core'
  | 'opt-out'
  | 'access'
  | 'redact'
  | 'signoff'
  | 'deletion'
  | 'legal'
  | 'correction'
  | 'gap'
  | 'pending';

interface FlowNode {
  id: string;
  title: string;
  detail?: string;
  x: number;
  y: number;
  tone: Tone;
  /** The draft section whose answer put this node here, for "track changes". */
  section?: DraftSection;
}

interface FlowLabel {
  type: RequestType;
  x: number;
  y: number; // centre line
}

/** A connector, and the nodes at its ends (so it can draw in with them). */
interface FlowEdge {
  d: string;
  ids: readonly string[];
}

interface FlowGroup {
  type: RequestType;
  x: number;
  y: number;
  w: number;
  h: number;
}

const TONE_COLOR: Record<Tone, string> = {
  endpoint: 'var(--oc-supportive-green)',
  core: 'var(--oc-supportive-teal)',
  'opt-out': FLOW_TYPE_COLORS['Opt-out'],
  access: FLOW_TYPE_COLORS.Access,
  redact: 'var(--oc-supportive-purple)',
  signoff: 'var(--oc-supportive-pink)',
  deletion: FLOW_TYPE_COLORS.Deletion,
  legal: 'var(--oc-supportive-orange)',
  correction: FLOW_TYPE_COLORS.Correction,
  gap: 'var(--oc-destructive)',
  pending: 'var(--oc-secondary)',
};

/** An orthogonal connector with rounded elbows, turning at x = xm. */
function elbow(x1: number, y1: number, x2: number, y2: number, xm: number): string {
  if (Math.abs(y1 - y2) < 1) return `M ${x1} ${y1} H ${x2}`;
  const r = Math.min(8, Math.abs(y2 - y1) / 2, Math.abs(xm - x1), Math.abs(x2 - xm));
  const dy = y2 > y1 ? 1 : -1;
  return [
    `M ${x1} ${y1}`,
    `H ${xm - r}`,
    `Q ${xm} ${y1} ${xm} ${y1 + dy * r}`,
    `V ${y2 - dy * r}`,
    `Q ${xm} ${y2} ${xm + r} ${y2}`,
    `H ${x2}`,
  ].join(' ');
}

// The workflow draft as a flow chart (DSR 2026 Figma): Intake → Verify identity → one branch per
// request type → Generate response → Deliver. Every node comes from the setup answers; nodes from
// the latest answer are highlighted so the user can track what changed.
@Component({
  selector: 'app-flow-chart',
  imports: [OcTag],
  templateUrl: './flow-chart.html',
  styleUrl: './flow-chart.scss',
})
export class FlowChart {
  readonly state = input.required<DraftState>();
  /** The section being rewritten right now. */
  readonly updating = input<DraftSection | null>(null);
  /** The section the latest answer changed (stays highlighted until the next answer). */
  readonly changed = input<DraftSection | null>(null);

  protected readonly order = FLOW_ORDER;
  protected readonly typeColors = FLOW_TYPE_COLORS;
  protected readonly purpose = REQUEST_TYPE_PURPOSE;
  protected readonly toneColor = TONE_COLOR;
  protected readonly nodeW = W;
  protected readonly nodeH = H;

  protected readonly scope = computed(() =>
    REGULATIONS.filter((r) => this.state().regulations?.includes(r.id))
      .map((r) => r.label)
      .join(' · '),
  );

  // ---- Zoom and pan
  protected readonly zoom = signal(0.8);
  protected readonly panMode = signal(false);
  protected readonly panning = signal(false);
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  #pan = { x: 0, y: 0, left: 0, top: 0 };

  private readonly injector = inject(Injector);

  // ---- Confirm animation
  /**
   * The section whose answer was just confirmed. Its nodes spring in one after another (left to
   * right, then top to bottom) and the connectors feeding them draw in just before each one.
   */
  protected readonly revealing = signal<DraftSection | null>(null);
  #prevUpdating: DraftSection | null = null;
  #revealTimer: ReturnType<typeof setTimeout> | undefined;

  /** Reveal order of the confirmed section's nodes, by id. */
  protected readonly revealOrder = computed(() => {
    const section = this.revealing();
    const order = new Map<string, number>();
    if (!section) return order;
    this.layout()
      .nodes.filter((n) => n.section === section)
      .sort((a, b) => a.x - b.x || a.y - b.y)
      .forEach((n, i) => order.set(n.id, i));
    return order;
  });

  constructor() {
    // An answer is confirmed when its section stops updating: replay that section's nodes in order.
    effect((onCleanup) => {
      const updating = this.updating();
      const done = this.#prevUpdating;
      this.#prevUpdating = updating;
      if (!done || updating) return;
      untracked(() => {
        const count = this.layout().nodes.filter((n) => n.section === done).length;
        // Scope adds no nodes; its "In scope" pill springs in instead.
        if (!count && done !== 'scope') return;
        this.revealing.set(done);
        clearTimeout(this.#revealTimer);
        this.#revealTimer = setTimeout(() => this.revealing.set(null), SPRING_MS + Math.max(count, 1) * STAGGER_MS + 100);
      });
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.#revealTimer));

    // Start at a readable zoom, scrolled to the vertical middle of the chart.
    afterNextRender(() => {
      const el = this.viewport().nativeElement;
      el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
    });

    // Track changes: pan to the nodes the latest answer changed.
    effect(() => {
      const section = this.updating() ?? this.changed();
      const nodes = this.layout().nodes.filter((n) => n.section && n.section === section);
      const zoom = this.zoom();
      if (!nodes.length) return;
      afterNextRender(
        () => {
          const el = this.viewport().nativeElement;
          const minX = Math.min(...nodes.map((n) => n.x));
          const maxX = Math.max(...nodes.map((n) => n.x + W));
          const minY = Math.min(...nodes.map((n) => n.y));
          const maxY = Math.max(...nodes.map((n) => n.y + H));
          const cx = CHART_LEFT + ((minX + maxX) / 2) * zoom;
          const cy = CHART_TOP + ((minY + maxY) / 2) * zoom;
          el.scrollTo({
            left: Math.max(0, cx - el.clientWidth / 2),
            top: Math.max(0, cy - el.clientHeight / 2),
            behavior: 'smooth',
          });
        },
        { injector: this.injector },
      );
    });
  }

  protected zoomBy(step: number): void {
    this.zoom.update((z) => clampZoom(Math.round((z + step) * 10) / 10));
  }

  protected startPan(e: PointerEvent): void {
    if (!this.panMode()) return;
    const el = this.viewport().nativeElement;
    this.#pan = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    this.panning.set(true);
    el.setPointerCapture(e.pointerId);
  }

  protected movePan(e: PointerEvent): void {
    if (!this.panning()) return;
    const el = this.viewport().nativeElement;
    el.scrollLeft = this.#pan.left - (e.clientX - this.#pan.x);
    el.scrollTop = this.#pan.top - (e.clientY - this.#pan.y);
  }

  protected endPan(): void {
    this.panning.set(false);
  }

  /** A node's place in the reveal sequence, or -1 when it isn't revealing. */
  protected revealIndex(n: FlowNode): number {
    return this.revealOrder().get(n.id) ?? -1;
  }

  /** A connector draws in with the later of its two ends, or -1 when neither is revealing. */
  protected edgeIndex(e: FlowEdge): number {
    const order = this.revealOrder();
    return Math.max(-1, ...e.ids.map((id) => order.get(id) ?? -1));
  }

  protected readonly stagger = STAGGER_MS;

  protected isChanged(n: FlowNode): boolean {
    return !!n.section && (n.section === this.changed() || n.section === this.updating());
  }

  // ---- Layout, recomputed from the answers
  protected readonly layout = computed(() => {
    const s = this.state();
    const rules = new Set(s.rules ?? []);
    const nodes: FlowNode[] = [];
    const labels: FlowLabel[] = [];
    const groups: FlowGroup[] = [];
    const edges: FlowEdge[] = [];
    const edge = (d: string, ...ids: string[]) => edges.push({ d, ids });
    /** Right-edge anchors that feed "Generate response". */
    const ends: { x: number; y: number; id: string }[] = [];

    const systemNodes = (type: RequestType, tone: Tone): FlowNode[] => {
      if (s.systems === null) {
        return [{ id: `${type}-pending`, title: 'Waiting for systems', detail: 'Answer in the conversation', x: 0, y: 0, tone: 'pending' }];
      }
      const picked = s.systems.filter((name) => SYSTEM_ACTIONS[name]?.[type]);
      if (!picked.length) {
        return [{ id: `${type}-gap`, title: 'No system selected', detail: 'Choose one in the conversation', x: 0, y: 0, tone: 'gap', section: 'paths' }];
      }
      return picked.map((name) => ({
        id: `${type}-${name}`,
        title: name === 'Internal warehouse' ? 'Internal warehouse' : SYSTEM_ACTIONS[name][type]!,
        detail: name === 'Internal warehouse' ? 'Owner: Daniel Okafor' : name,
        x: 0,
        y: 0,
        tone,
        section: 'paths' as const,
      }));
    };

    let y = 0;
    for (const type of FLOW_ORDER) {
      if (type === 'Opt-out' || type === 'Correction') {
        // A single step beside the groups. Correction folds its systems into one node.
        let node: FlowNode;
        if (type === 'Opt-out') {
          node = { ...systemNodes('Opt-out', 'opt-out')[0] };
          if (node.tone === 'opt-out') node = { ...node, title: 'Suppress marketing' };
        } else {
          const sys = systemNodes('Correction', 'correction');
          node =
            sys[0].tone === 'correction'
              ? {
                  id: 'correction-update',
                  title: 'Update source records',
                  detail: sys.map((n) => n.detail).join(', '),
                  x: 0,
                  y: 0,
                  tone: 'correction',
                  section: 'paths',
                }
              : { ...sys[0] };
        }
        node.x = X.single;
        node.y = y;
        nodes.push(node);
        labels.push({ type, x: X.label, y: y + H / 2 });
        edge(elbow(X.label + 96, y + H / 2, node.x, y + H / 2, X.label + 112), node.id);
        ends.push({ x: node.x + W, y: y + H / 2, id: node.id });
        y += H + BLOCK_GAP;
        continue;
      }

      // Access and Deletion: a grey group of system steps, then the rule steps.
      const tone: Tone = type === 'Access' ? 'access' : 'deletion';
      const sys = systemNodes(type, tone);
      const groupH = PAD * 2 + sys.length * H + (sys.length - 1) * ROW;
      const mid = y + groupH / 2;
      groups.push({ type, x: X.group, y, w: GROUP_RIGHT - X.group, h: groupH });
      labels.push({ type, x: X.label, y: mid });
      sys.forEach((n, i) => {
        n.x = X.system;
        n.y = y + PAD + i * (H + ROW);
        nodes.push(n);
        edge(elbow(X.label + 96, mid, n.x, n.y + H / 2, X.system - 28), n.id);
      });

      const ruleSteps: FlowNode[] = [];
      if (type === 'Access' && rules.has('redact')) {
        ruleSteps.push(
          { id: 'redact', title: 'Redact third-party data', detail: 'Support transcripts', x: X.rule1, y: mid - H / 2, tone: 'redact', section: 'rules' },
          { id: 'signoff', title: 'Privacy sign-off', detail: 'Redactions', x: X.rule2, y: mid - H / 2, tone: 'signoff', section: 'rules' },
        );
      }
      if (type === 'Deletion' && rules.has('legal-hold')) {
        ruleSteps.push({ id: 'legal', title: 'Route to legal', detail: 'Accounts with open disputes', x: X.rule1 + (X.rule2 - X.rule1) / 2, y: mid - H / 2, tone: 'legal', section: 'rules' });
      }

      if (ruleSteps.length) {
        const first = ruleSteps[0];
        sys.forEach((n) => edge(elbow(n.x + W, n.y + H / 2, first.x, mid, n.x + W + 20), n.id, first.id));
        for (let i = 1; i < ruleSteps.length; i++) {
          edge(elbow(ruleSteps[i - 1].x + W, mid, ruleSteps[i].x, mid, ruleSteps[i].x - 10), ruleSteps[i - 1].id, ruleSteps[i].id);
        }
        nodes.push(...ruleSteps);
        const last = ruleSteps[ruleSteps.length - 1];
        ends.push({ x: last.x + W, y: mid, id: last.id });
      } else {
        sys.forEach((n) => ends.push({ x: n.x + W, y: n.y + H / 2, id: n.id }));
      }
      y += groupH + BLOCK_GAP;
    }

    const chartH = y - BLOCK_GAP;
    const centre = chartH / 2;
    const agentCount = s.agents?.length;

    nodes.push({
      id: 'intake',
      title: 'Intake',
      detail:
        agentCount === undefined
          ? 'Waiting for intake agents'
          : agentCount
            ? `${agentCount} branded intake agent${agentCount === 1 ? '' : 's'}`
            : 'Standard web form',
      x: X.intake,
      y: centre - H / 2,
      tone: agentCount === undefined ? 'pending' : 'endpoint',
      section: 'intake',
    });

    const verify = rules.has('verify');
    if (verify) {
      nodes.push({ id: 'verify', title: 'Verify identity', detail: 'Before any data handling', x: X.verify, y: centre - H / 2, tone: 'core', section: 'rules' });
      edge(elbow(X.intake + W, centre, X.verify, centre, X.verify - 10), 'intake', 'verify');
    }
    // Branch labels fan out from Verify identity, or from Intake when there's no verification.
    const fromX = verify ? X.verify + W : X.intake + W;
    for (const l of labels) edge(elbow(fromX, centre, l.x, l.y, X.label - 24), verify ? 'verify' : 'intake');

    const voice = rules.has('voice');
    nodes.push(
      {
        id: 'generate',
        title: 'Generate response',
        detail: voice ? 'Meridian letter + voice' : undefined,
        x: X.generate,
        y: centre - H / 2,
        tone: 'core',
        section: voice ? 'rules' : undefined,
      },
      { id: 'deliver', title: 'Deliver', x: X.deliver, y: centre - H / 2, tone: 'endpoint' },
    );
    for (const e of ends) edge(elbow(e.x, e.y, X.generate, centre, X.generate - 28), e.id, 'generate');
    edge(elbow(X.generate + W, centre, X.deliver, centre, X.deliver - 10), 'generate', 'deliver');

    return { nodes, labels, groups, edges, width: CHART_W, height: chartH };
  });

  protected readonly agentNames = computed(() =>
    INTAKE_AGENTS.filter((a) => this.state().agents?.includes(a.brand)).map((a) => a.brand),
  );
}

function clampZoom(z: number): number {
  return Math.min(1.2, Math.max(0.4, z));
}
