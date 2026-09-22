import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { LavanderiaService } from '../services/lavanderia';

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

  constructor(
    private lavanderiaService: LavanderiaService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.cargarOrdenes();
  }

  ionViewWillEnter() {
    this.cargarOrdenes();
  }

  // =========================
  // READ - CONSULTAR ÓRDENES
  // =========================
  cargarOrdenes() {

    this.cargando = true;
    this.mensajeRespuesta = '';

    this.lavanderiaService.getOrdenes().subscribe({

      next: (res: any) => {

        this.ordenes = Array.isArray(res)
          ? res
          : (res.ordenes || []);

        this.cargando = false;

        console.log(
          '[CRUD] Órdenes recibidas:',
          this.ordenes
        );
      },

      error: (err) => {

        this.cargando = false;

        this.mensajeRespuesta =
          'No se pudieron cargar las órdenes.';

        console.error(
          '[CRUD] Error al cargar:',
          err
        );
      }

    });
  }


  // =========================
  // UPDATE - EDITAR ORDEN
  // =========================
  async editarOrden(orden: any) {

    const alert = await this.alertController.create({

      header: `Editar orden #${orden.id}`,

      inputs: [
        {
          name: 'direccion',
          type: 'text',
          placeholder: 'Dirección',
          value: orden.direccion || ''
        },
        {
          name: 'estado',
          type: 'text',
          placeholder: 'Estado',
          value: orden.estado || 'Pendiente'
        }
      ],

      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },

        {
          text: 'Guardar',

          handler: (datos) => {

            const datosActualizados = {
              direccion: datos.direccion,
              estado: datos.estado
            };

            this.lavanderiaService
              .actualizarOrden(
                orden.id,
                datosActualizados
              )
              .subscribe({

                next: () => {

                  console.log(
                    `[CRUD] Orden #${orden.id} actualizada correctamente`
                  );

                  this.cargarOrdenes();
                },

                error: (err) => {

                  this.mensajeRespuesta =
                    'No se pudo actualizar la orden.';

                  console.error(
                    '[CRUD] Error al actualizar:',
                    err
                  );
                }

              });
          }
        }
      ]

    });

    await alert.present();
  }


  // =========================
  // DELETE - CONFIRMAR
  // =========================
  async confirmarEliminar(orden: any) {

    const alert = await this.alertController.create({

      header: 'Eliminar orden',

      message:
        `¿Seguro que deseas eliminar la orden #${orden.id}?`,

      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },

        {
          text: 'Eliminar',
          role: 'destructive',

          handler: () => {
            this.eliminarOrden(orden.id);
          }
        }
      ]

    });

    await alert.present();
  }


  // =========================
  // DELETE - ELIMINAR ORDEN
  // =========================
  eliminarOrden(id: number) {

    this.lavanderiaService
      .eliminarOrden(id)
      .subscribe({

        next: () => {

          console.log(
            `[CRUD] Orden #${id} eliminada correctamente`
          );

          this.cargarOrdenes();
        },

        error: (err) => {

          this.mensajeRespuesta =
            'No se pudo eliminar la orden.';

          console.error(
            '[CRUD] Error al eliminar:',
            err
          );
        }

      });
  }

}