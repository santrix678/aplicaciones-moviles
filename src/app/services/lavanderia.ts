import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LavanderiaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // READ - Obtener todas las órdenes
  getOrdenes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ordenes`);
  }

  // CREATE - Crear nueva orden
  crearOrden(datos: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/nueva-orden`,
      datos
    );
  }

  // UPDATE - Actualizar una orden
  actualizarOrden(id: number, datos: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/ordenes/${id}`,
      datos
    );
  }

  // DELETE - Eliminar una orden
  eliminarOrden(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/ordenes/${id}`
    );
  }

  // Reporte financiero con caché
  getReporte(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/reporte-lavanderia`
    );
  }
}