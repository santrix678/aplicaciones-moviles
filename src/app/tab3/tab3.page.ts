import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

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


  // ==========================================
  // URL DIRECTA DEL BACKEND
  // ==========================================

  private readonly urlReporte =
    'http://192.168.100.83:5001/api/reporte-lavanderia';


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // CONSULTAR REPORTE
  // ==========================================

  obtenerReporte() {

    this.cargando = true;

    this.mensajeError = '';

    this.reporte = null;

    this.tiempoRespuesta = 0;


    const inicio = performance.now();


    console.log(
      '[REPORTE] Consultando:',
      this.urlReporte
    );


    // ==========================================
    // PETICIÓN HTTP
    // ==========================================

    this.http
      .get<any>(this.urlReporte)
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
            '[REPORTE] Tiempo de respuesta:',
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
            '========== ERROR REPORTE =========='
          );

          console.error(
            'Error completo:',
            err
          );

          console.error(
            'Status:',
            err?.status
          );

          console.error(
            'StatusText:',
            err?.statusText
          );

          console.error(
            'URL:',
            err?.url
          );

          console.error(
            'Mensaje:',
            err?.message
          );

          console.error(
            'Error interno:',
            err?.error
          );

          console.error(
            '===================================='
          );


          // ====================================
          // MOSTRAR ERROR EN EL CELULAR
          // ====================================

          if (err?.status === 0) {

            this.mensajeError =
              'Status: 0 | No se pudo conectar con: ' +
              this.urlReporte;

          }

          else if (err?.status === 404) {

            this.mensajeError =
              'Error 404: No se encontró la ruta del reporte.';

          }

          else if (err?.status === 500) {

            this.mensajeError =
              'Error 500: El servidor presentó un error.';

          }

          else {

            this.mensajeError =
              'Error ' +
              (err?.status ?? 'desconocido') +
              ': ' +
              (err?.message || 'Sin mensaje');

          }

        }

      });

  }

}