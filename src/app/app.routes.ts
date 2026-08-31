import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren:()=>import('./features/hotbar/hotbar.routes').then(m=>m.routes),
  },

];
