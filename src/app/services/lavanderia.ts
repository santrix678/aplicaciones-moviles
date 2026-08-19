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

  // 1. Obtener lista de órdenes (Consulta optimizada N+1)
  getOrdenes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ordenes`);
  }

  // 2. Crear nueva orden (Procesamiento asíncrono)
  crearOrden(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/nueva-orden`, datos);
  }

  // 3. Obtener reporte financiero (Respuesta en caché)
  getReporte(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reporte-lavanderia`);
  }
}