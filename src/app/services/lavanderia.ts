import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { AuthService } from './auth';


@Injectable({
  providedIn: 'root'
})
export class LavanderiaService {

  // ==========================================
  // URL DEL BACKEND FLASK
  // ==========================================

  private readonly apiUrl =
    'http://192.168.100.83:5001/api';


  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}


  // ==========================================
  // CREAR CABECERAS CON TOKEN
  // ==========================================

  private getHeaders(): HttpHeaders {

    const token =
      this.authService.getToken();

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':
        token
          ? `Bearer ${token}`
          : ''
    });

  }


  // ==========================================
  // READ - OBTENER ÓRDENES
  // ==========================================

  getOrdenes(): Observable<any[]> {

    const url =
      `${this.apiUrl}/ordenes`;

    console.log(
      '[CRUD] Consultando órdenes:',
      url
    );

    return this.http.get<any[]>(
      url,
      {
        headers: this.getHeaders()
      }
    );

  }


  // ==========================================
  // CREATE - CREAR NUEVA ORDEN
  // ==========================================

  crearOrden(
    datos: any
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/nueva-orden`,
      datos,
      {
        headers: this.getHeaders()
      }
    );

  }


  // ==========================================
  // UPDATE - ACTUALIZAR ORDEN
  // SOLO ADMINISTRADOR EN EL BACKEND
  // ==========================================

  actualizarOrden(
    id: number,
    datos: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/ordenes/${id}`,
      datos,
      {
        headers: this.getHeaders()
      }
    );

  }


  // ==========================================
  // DELETE - ELIMINAR ORDEN
  // SOLO ADMINISTRADOR EN EL BACKEND
  // ==========================================

  eliminarOrden(
    id: number
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}/ordenes/${id}`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // ==========================================
  // REPORTE FINANCIERO
  // SOLO ADMINISTRADOR EN EL BACKEND
  // ==========================================

  getReporte(): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/reporte-lavanderia`,
      {
        headers: this.getHeaders()
      }
    );

  }

}