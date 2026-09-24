import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

import { LavanderiaService } from '../services/lavanderia';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class Tab2Page implements OnInit {

  ordenes: any[] = [];

  cargando = false;

  mensajeRespuesta = '';

  rol: string | null = null;

  esAdministrador = false;

  esCliente = false;


  constructor(
    private lavanderiaService: LavanderiaService,
    private authService: AuthService,
    private toastController: ToastController
  ) {}


  // ==========================================
  // INICIAR
  // ==========================================

  ngOnInit(): void {

    this.cargarRol();

    this.cargarOrdenes();

  }


  // ==========================================
  // AL ENTRAR A LA PESTAÑA
  // ==========================================

  ionViewWillEnter(): void {

    this.cargarRol();

    this.cargarOrdenes();

  }


  // ==========================================
  // CARGAR ROL
  // ==========================================

  cargarRol(): void {

    this.rol =
      this.authService.getRol();

    this.esAdministrador =
      this.rol === 'administrador';

    this.esCliente =
      this.rol === 'cliente';


    console.log(
      '[ROL] Tab2:',
      this.rol
    );

  }


  // ==========================================
  // CARGAR ÓRDENES
  // ==========================================

  cargarOrdenes(): void {

    this.cargando = true;

    this.mensajeRespuesta = '';


    this.lavanderiaService
      .getOrdenes()
      .subscribe({

        next: (res: any) => {

          this.ordenes = Array.isArray(res)
            ? res
            : (res?.ordenes || []);


          this.cargando = false;


          console.log(
            '[CRUD] Órdenes recibidas:',
            this.ordenes
          );

        },


        error: (err: any) => {

          this.cargando = false;


          this.mensajeRespuesta =
            'No se pudieron cargar las órdenes.';


          console.error(
            '[CRUD] Error al cargar órdenes:',
            err
          );

        }

      });

  }


  // ==========================================
  // EDITAR ORDEN
  // SOLO ADMINISTRADOR
  // ==========================================

  async editarOrden(
    orden: any
  ): Promise<void> {

    if (!this.esAdministrador) {

      await this.mostrarMensaje(
        'Solo el administrador puede editar órdenes.',
        'warning'
      );

      return;

    }


    console.log(
      '[CRUD] EDITAR:',
      orden
    );


    const nuevaDireccion =
      window.prompt(
        'Dirección de la orden:',
        orden.direccion || ''
      );


    if (nuevaDireccion === null) {

      return;

    }


    const nuevoEstado =
      window.prompt(
        'Estado de la orden:',
        orden.estado || 'Pendiente'
      );


    if (nuevoEstado === null) {

      return;

    }


    const datosActualizados = {

      direccion:
        nuevaDireccion.trim(),

      estado:
        nuevoEstado.trim() ||
        'Pendiente'

    };


    console.log(
      '[CRUD] Actualizando orden:',
      orden.id,
      datosActualizados
    );


    this.actualizarOrden(
      orden.id,
      datosActualizados
    );

  }


  // ==========================================
  // ACTUALIZAR ORDEN
  // ==========================================

  actualizarOrden(
    id: number,
    datos: any
  ): void {

    if (!this.esAdministrador) {

      return;

    }


    this.lavanderiaService
      .actualizarOrden(
        id,
        datos
      )
      .subscribe({

        next: async (res: any) => {

          console.log(
            '[CRUD] Orden actualizada:',
            res
          );


          await this.mostrarMensaje(
            'Orden actualizada correctamente.'
          );


          this.cargarOrdenes();

        },


        error: async (err: any) => {

          console.error(
            '[CRUD] Error al actualizar:',
            err
          );


          await this.mostrarMensaje(
            'No se pudo actualizar la orden.',
            'danger'
          );

        }

      });

  }


  // ==========================================
  // CONFIRMAR ELIMINACIÓN
  // SOLO ADMINISTRADOR
  // ==========================================

  async confirmarEliminar(
    orden: any
  ): Promise<void> {

    if (!this.esAdministrador) {

      await this.mostrarMensaje(
        'Solo el administrador puede eliminar órdenes.',
        'warning'
      );

      return;

    }


    console.log(
      '[CRUD] ELIMINAR:',
      orden
    );


    const confirmar =
      window.confirm(
        '¿Seguro que deseas eliminar la orden #' +
        orden.id +
        '?'
      );


    if (!confirmar) {

      return;

    }


    this.eliminarOrden(
      orden.id
    );

  }


  // ==========================================
  // ELIMINAR ORDEN
  // ==========================================

  eliminarOrden(
    id: number
  ): void {

    if (!this.esAdministrador) {

      return;

    }


    console.log(
      '[CRUD] Eliminando orden:',
      id
    );


    this.lavanderiaService
      .eliminarOrden(id)
      .subscribe({

        next: async (res: any) => {

          console.log(
            '[CRUD] Orden eliminada:',
            res
          );


          await this.mostrarMensaje(
            'Orden eliminada correctamente.'
          );


          this.cargarOrdenes();

        },


        error: async (err: any) => {

          console.error(
            '[CRUD] Error al eliminar:',
            err
          );


          await this.mostrarMensaje(
            'No se pudo eliminar la orden.',
            'danger'
          );

        }

      });

  }


  // ==========================================
  // MENSAJES
  // ==========================================

  async mostrarMensaje(
    mensaje: string,
    color: string = 'success'
  ): Promise<void> {

    const toast =
      await this.toastController.create({

        message: mensaje,

        duration: 2000,

        position: 'bottom',

        color: color

      });


    await toast.present();

  }

}