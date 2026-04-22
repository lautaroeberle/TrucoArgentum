import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'ranking',
    pathMatch: 'full'
  },
  {
    path: 'ranking',
    loadComponent: () =>
      import('./ranking/ranking/ranking.component').then(m => m.RankingComponent)
  },
  {
    path: 'admin-oculto',
    loadComponent: () =>
      import('../app/admin/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: '**',
    redirectTo: 'ranking'
  }
];