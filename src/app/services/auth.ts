import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Backend Flask
  private apiUrl = 'http://192.168.100.83:5001/api';

  constructor(
    private http: HttpClient
  ) {}

  // ==========================================
  // COMPROBAR SESIÓN
  // ==========================================
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // ==========================================
  // INICIAR SESIÓN
  // ==========================================
  login(username: string, password: string) {

    const datos = {
      username: username.trim(),
      password: password
    };

    return this.http
      .post<any>(`${this.apiUrl}/login`, datos)
      .pipe(
        tap(respuesta => {

          console.log(
            '[LOGIN] Respuesta del servidor:',
            respuesta
          );

          // Solo guardar sesión si el backend
          // devuelve un token válido
          if (respuesta && respuesta.token) {

            localStorage.setItem(
              'token',
              respuesta.token
            );

            if (respuesta.usuario) {
              localStorage.setItem(
                'usuario',
                respuesta.usuario
              );
            }

          } else {

            // Si no hay token, no debe quedar
            // ninguna sesión anterior guardada
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');

          }

        })
      );
  }

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================
  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

  }

}