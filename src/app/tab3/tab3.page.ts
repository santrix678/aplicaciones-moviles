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
  imports: [CommonModule, IonicModule]
})
export class Tab3Page {
  reporte: any = null;
  cargando: boolean = false;
  tiempoRespuesta: number = 0;

  constructor(private http: HttpClient) {}

  obtenerReporte() {
    this.cargando = true;
    const inicio = performance.now();

    this.http.get(`${environment.apiUrl}/api/reporte-lavanderia`).subscribe({
      next: (res: any) => {
        const fin = performance.now();
        this.tiempoRespuesta = Math.round(fin - inicio);
        this.reporte = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener reporte:', err);
        this.cargando = false;
      }
    });
  }
}