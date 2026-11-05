import type { OcIconName } from '@onetrust/onecore/icon';

export interface NavLink {
  label: string;
  path: string;
  icon: OcIconName;
}

// Sidebar of the Privacy Rights Automation module, as in the v0 demo.
export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'gauge' },
  { label: 'Reports', path: '/reports', icon: 'chart-column' },
  { label: 'Subtasks', path: '/subtasks', icon: 'list-check' },
  { label: 'Setup', path: '/setup', icon: 'wrench' },
  { label: 'Settings', path: '/settings', icon: 'gear' },
];

export function findNavLink(url: string): NavLink | undefined {
  return NAV_LINKS.find((l) => url === l.path || url.startsWith(l.path + '/'));
}
