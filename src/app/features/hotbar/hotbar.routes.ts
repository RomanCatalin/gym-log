import { Routes } from '@angular/router';
import { HotbarPage } from './hotbar.page';

export const routes: Routes = [
  {
    path: '',
    component: HotbarPage, 
    children: [
      {
        path: 'workout',
        loadComponent: () => import('../workout/pages/workout/workout.page').then(m => m.WorkoutPage),
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('../statistics/pages/statistics/statistics.page').then(m => m.StatisticsPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/pages/settings/settings.page').then(m => m.SettingsPage),
      },
      {
        path: 'workout-templates',
        loadComponent: () =>
          import('../settings/pages/workout-templates/workout-templates.page').then(m => m.WorkoutTemplatesPage),
      },
      {
        path: 'preferences',
        loadComponent: () =>
          import('../settings/pages/preferences/preferences.page').then(m => m.PreferencesPage),
      },
      {
        path: 'databackup',
        loadComponent: () =>
          import('../settings/pages/databackup/databackup.page').then(m => m.DatabackupPage),
      },
      {
        path: '',
        redirectTo: 'workout',
        pathMatch: 'full',
      },
    ],
  },
];