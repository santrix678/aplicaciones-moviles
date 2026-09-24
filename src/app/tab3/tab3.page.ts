import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LavanderiaService } from '../services/lavanderia';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    IonicModule
  ]
})
export class Tab3Page {

  reporte: any = null;

  cargando = false;

  tiempoRespuesta = 0;

  mensajeError = '';


  constructor(
    private lavanderiaService: LavanderiaService
  ) {}


  // ==========================================
  // CONSULTAR REPORTE
  // ==========================================

  obtenerReporte(): void {

    this.cargando = true;

    this.mensajeError = '';

    this.reporte = null;

    this.tiempoRespuesta = 0;


    const inicio = performance.now();


    console.log(
      '[REPORTE] Consultando reporte...'
    );


    // ==========================================
    // USAR SERVICIO CON TOKEN
    // ==========================================

    this.lavanderiaService
      .getReporte()
      .subscribe({

        // ======================================
        // RESPUESTA CORRECTA
        // ======================================

        next: (res: any) => {

          const fin = performance.now();


          this.tiempoRespuesta =
            Math.round(
              fin - inicio
            );


          this.reporte = res;

          this.cargando = false;

          this.mensajeError = '';


          console.log(
            '[REPORTE] Reporte recibido:',
            res
          );


          console.log(
            '[REPORTE] Tiempo:',
            this.tiempoRespuesta,
            'ms'
          );

        },


        // ======================================
        // ERROR
        // ======================================

        error: (err: any) => {

          this.cargando = false;

          this.reporte = null;


          console.error(
            '[REPORTE] Error:',
            err
          );


          // ====================================
          // SIN CONEXIÓN
          // ====================================

          if (err?.status === 0) {

            this.mensajeError =
              'No se pudo conectar con el servidor.';

            return;
          }


          // ====================================
          // TOKEN INVÁLIDO
          // ====================================

          if (err?.status === 401) {

            this.mensajeError =
              'Sesión no válida. Cierra sesión e inicia nuevamente.';

            return;
          }


          // ====================================
          // NO ES ADMINISTRADOR
          // ====================================

          if (err?.status === 403) {

            this.mensajeError =
              'El reporte financiero está disponible únicamente para el administrador.';

            return;
          }


          // ====================================
          // RUTA NO ENCONTRADA
          // ====================================

          if (err?.status === 404) {

            this.mensajeError =
              'No se encontró la ruta del reporte.';

            return;
          }


          // ====================================
          // ERROR DEL SERVIDOR
          // ====================================

          if (err?.status === 500) {

            this.mensajeError =
              'El servidor presentó un error al generar el reporte.';

            return;
          }


          // ====================================
          // OTRO ERROR
          // ====================================

          this.mensajeError =
            err?.error?.mensaje ||
            err?.error?.message ||
            'No se pudo consultar el reporte.';

        }

      });

  }

}