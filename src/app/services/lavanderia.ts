import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Lavanderia {
  // Pon aquí la URL de tu API de Node.js/Flask si es diferente
  private apiUrl = 'http://localhost:3000/api/servicios'; 

  constructor(private http: HttpClient) { }

  // Ahora sí devuelve el flujo de datos para el .subscribe()
  getServicios(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}