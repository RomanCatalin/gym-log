import { Routes } from '@angular/router';
import { HotbarPage } from './hotbar.page';

export const routes: Routes = 
[
  {
    path: '',
    component: HotbarPage, 
    children: [
      {
        path: 'workout',
        loadComponent: () => import('../workout/pages/workout-page/workout-page.page').then(m => m.WorkoutPagePage),
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('../statistics/pages/statistics-page/statistics-page.page').then(m => m.StatisticsPagePage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/pages/settings-page/settings-page.page').then(m => m.SettingsPagePage),
      },
        {
        path: 'settings/workout-templates',
        loadComponent: () =>
          import('../settings/pages/workout-templates-page/workout-templates-page.page').then(m => m.WorkoutTemplatesPagePage),
      },
      {
        path: '',
        redirectTo: 'workout',
        pathMatch: 'full',
      },
    ],
  },
];