import type { OcIconName } from '@onetrust/onecore/icon';

export interface NavLink {
  label: string;
  path: string;
  icon: OcIconName;
  /** Shows a caret: the item has its own pages (Setup) or opens a secondary menu (Chat). */
  hasMenu?: boolean;
  /** Sub-pages listed under the item when it's expanded (Setup). */
  children?: readonly SubLink[];
}

export interface SubLink {
  label: string;
  path: string;
}

/** Setup's sub-pages, listed under Setup in the main menu. */
export const SETUP_LINKS: readonly SubLink[] = [
  { label: 'Web forms', path: '/setup/web-forms' },
  { label: 'Workflows', path: '/setup/workflows' },
  { label: 'Integrations', path: '/setup/integrations' },
  { label: 'Response templates', path: '/setup/response-templates' },
  { label: 'Subtask templates', path: '/setup/subtask-templates' },
  { label: 'Redaction preferences', path: '/setup/redaction-preferences' },
];

// Left navigation from the DSR 2026 Figma file ("Left Nav - DSAR", node 464:15550).

/** Module pages of Privacy Rights: DSAR. */
export const MODULE_LINKS: readonly NavLink[] = [
  { label: 'Command center', path: '/command-center', icon: 'buildings' },
  { label: 'Reports', path: '/reports', icon: 'area-chart' },
  { label: 'Requests', path: '/requests', icon: 'ticket' },
  { label: 'Subtasks', path: '/subtasks', icon: 'list-check' },
  { label: 'Setup', path: '/setup', icon: 'gear', hasMenu: true, children: SETUP_LINKS },
  { label: 'Settings', path: '/settings', icon: 'sliders' },
];

/**
 * Cross-product workspaces. Chat is not a link: it opens a secondary menu (still to be designed),
 * so it is rendered as a button and has no icon in OneCore's set (its glyph is public/nav/chat.svg).
 */
export const WORKSPACE_LINKS: readonly NavLink[] = [
  { label: 'Search', path: '/search', icon: 'magnifying-glass' },
  { label: 'Inbox', path: '/inbox', icon: 'inbox' },
  { label: 'Tasks', path: '/tasks', icon: 'clipboard-list' },
  { label: 'Notifications', path: '/notifications', icon: 'bell' },
];

/** Pages reached from the Chat workspace menu (labels for the placeholder page). */
const CHAT_LINKS: readonly NavLink[] = [
  { label: 'New chat', path: '/chats/new', icon: 'plus' },
  { label: 'All chats', path: '/chats', icon: 'plus' },
];

// Sub-pages first, so /setup/workflows finds Workflows rather than Setup.
const ALL_LINKS: readonly SubLink[] = [...SETUP_LINKS, ...MODULE_LINKS, ...WORKSPACE_LINKS, ...CHAT_LINKS];

export function findNavLink(url: string): SubLink | undefined {
  return ALL_LINKS.find((l) => url === l.path || url.startsWith(l.path + '/'));
}
