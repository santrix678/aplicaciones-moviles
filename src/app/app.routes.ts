import { Routes } from '@angular/router';

import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

  // ============================
  // LOGIN
  // ============================
  {
    path: 'login',

    loadComponent: () =>
      import('./pages/login/login.page')
        .then(m => m.LoginPage),
  },

  // ============================
  // REGISTRO DE CLIENTES
  // ============================
  {
    path: 'registro',

    loadComponent: () =>
      import('./pages/registro/registro.page')
        .then(m => m.RegistroPage),
  },

  // ============================
  // APLICACIÓN PROTEGIDA
  // ============================
  {
    path: '',

    canActivate: [authGuard],

    loadChildren: () =>
      import('./tabs/tabs.routes')
        .then(m => m.routes),
  },

  // ============================
  // RUTA NO ENCONTRADA
  // ============================
  {
    path: '**',

    redirectTo: 'login',
  }

];