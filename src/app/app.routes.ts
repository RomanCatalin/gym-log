import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren:()=>import('./features/hotbar/hotbar.routes').then(m=>m.routes),
  },  {
    path: 'preferences',
    loadComponent: () => import('./features/settings/pages/preferences/preferences.page').then( m => m.PreferencesPage)
  },


];
