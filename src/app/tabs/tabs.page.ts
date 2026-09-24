import {
  Component,
  EnvironmentInjector,
  inject
} from '@angular/core';

import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';

import { addIcons } from 'ionicons';

import {
  homeOutline,
  listOutline,
  barChartOutline
} from 'ionicons/icons';

import { AuthService } from '../services/auth';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ]
})

export class TabsPage {

  public environmentInjector =
    inject(EnvironmentInjector);

  rol: string | null = null;

  esAdministrador = false;
  esCliente = false;


  constructor(
    private authService: AuthService
  ) {

    addIcons({
      homeOutline,
      listOutline,
      barChartOutline
    });

    this.cargarRol();

  }


  // ==========================================
  // CARGAR ROL DEL USUARIO
  // ==========================================

  cargarRol() {

    this.rol =
      this.authService.getRol();

    this.esAdministrador =
      this.rol === 'administrador';

    this.esCliente =
      this.rol === 'cliente';


    console.log(
      '[ROL] Usuario conectado como:',
      this.rol
    );

  }

}