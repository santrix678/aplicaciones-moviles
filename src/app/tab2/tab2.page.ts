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

  // READ
  cargarOrdenes() {
    this.cargando = true;
    this.mensajeRespuesta = '';

    this.lavanderiaService.getOrdenes().subscribe({
      next: (res: any) => {
        this.ordenes = Array.isArray(res)
          ? res
          : (res.ordenes || []);

        this.cargando = false;

        console.log('[CRUD] Órdenes recibidas:', this.ordenes);
      },

      error: (err) => {
        this.cargando = false;
        this.mensajeRespuesta =
          'No se pudieron cargar las órdenes.';

        console.error('[CRUD] Error al cargar:', err);
      }
    });
  }

  // DELETE
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

  eliminarOrden(id: number) {

    this.lavanderiaService.eliminarOrden(id).subscribe({

      next: () => {

        this.mensajeRespuesta =
          `Orden #${id} eliminada correctamente.`;

        // Volvemos a consultar la base de datos
        this.cargarOrdenes();

      },

      error: (err) => {

        this.mensajeRespuesta =
          'No se pudo eliminar la orden.';

        console.error('[CRUD] Error al eliminar:', err);

      }

    });
  }
}