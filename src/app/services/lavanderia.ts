import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LavanderiaService {

  // Limpiamos el doble punto y coma que quedó al final
  private apiUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) { }

  // Cambiado a /reporte para que coincida con Flask
  getReporte() {
    return this.http.get(`${this.apiUrl}/reporte`);
  }

  // Cambiado a /ordenes para que coincida con Flask
  getOrdenes() {
    return this.http.get(`${this.apiUrl}/ordenes`);
  }
}