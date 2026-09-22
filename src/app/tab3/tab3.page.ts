import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { environment } from 'src/environments/environment';

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
    private http: HttpClient
  ) {}

  obtenerReporte() {

    this.cargando = true;
    this.mensajeError = '';

    const inicio = performance.now();

    // environment.apiUrl ya contiene /api
    this.http
      .get(`${environment.apiUrl}/reporte-lavanderia`)
      .subscribe({

        next: (res: any) => {

          const fin = performance.now();

          this.tiempoRespuesta =
            Math.round(fin - inicio);

          this.reporte = res;

          this.cargando = false;

          console.log(
            '[CACHE] Reporte recibido:',
            res
          );

          console.log(
            `[CACHE] Tiempo de respuesta: ${this.tiempoRespuesta} ms`
          );
        },

        error: (err) => {

          console.error(
            '[CACHE] Error al obtener reporte:',
            err
          );

          this.mensajeError =
            'No se pudo consultar el reporte.';

          this.cargando = false;
        }

      });
  }
}