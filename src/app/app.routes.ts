import { Routes } from '@angular/router';
import { AppShell } from './shell/app-shell';

export const routes: Routes = [
  {
    path: '',
    component: AppShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'setup' },
      {
        path: 'setup',
        title: 'Setup | Privacy Rights Automation',
        loadComponent: () => import('./pages/setup/setup').then((m) => m.Setup),
      },
      {
        path: 'setup/agent',
        title: 'Privacy Agent | Privacy Rights Automation',
        loadComponent: () => import('./pages/setup/agent/setup-agent').then((m) => m.SetupAgent),
      },
      {
        path: 'command-center',
        title: 'Command center | Privacy Rights Automation',
        loadComponent: () =>
          import('./pages/command-center/command-center').then((m) => m.CommandCenter),
      },
      {
        path: 'chat',
        title: 'Chat | Privacy Rights Automation',
        loadComponent: () => import('./pages/chat/chat-home').then((m) => m.ChatHome),
      },
      // Screens not rebuilt yet render a "not built yet" placeholder.
      {
        path: '**',
        title: 'Privacy Rights Automation',
        loadComponent: () => import('./pages/placeholder').then((m) => m.Placeholder),
      },
    ],
  },
];
