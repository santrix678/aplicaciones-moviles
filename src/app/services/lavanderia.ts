import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LavanderiaService {

  // La URL de tu servidor Flask
  private apiUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) { }

  // Método para el reporte con caché
  getReporte() {
    return this.http.get(`${this.apiUrl}/reporte-lavanderia`);
  }

  // Método para las órdenes optimizadas
  getOrdenes() {
    return this.http.get(`${this.apiUrl}/ordenes-optimizadas`);
  }
}