import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'listado',
    loadComponent: () => import('./pages/listado/listado.page').then(m => m.ListadoPage)
  },
  {
    path: 'seguimiento',
    loadComponent: () => import('./pages/seguimiento/seguimiento.page').then(m => m.SeguimientoPage)
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./pages/detalle/detalle.page').then(m => m.DetallePage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage)
  }
];