import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Dirección de Flask en tu computadora
  // El celular debe conectarse a la IP de la computadora,
  // no a localhost.
  private apiUrl = 'http://192.168.100.94:5001/api';

  private loggedIn = new BehaviorSubject<boolean>(
    this.hasToken()
  );

  constructor(private http: HttpClient) {}


  // Comprueba si existe un token guardado
  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }


  // Permite observar el estado del inicio de sesión
  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }


  // Devuelve true si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.loggedIn.value;
  }


  // Iniciar sesión
  login(username: string, password?: string): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/login`,
      {
        username: username,
        password: password
      }
    ).pipe(

      tap((response) => {

        console.log('[AUTH] Respuesta del servidor:', response);

        if (response && response.token) {

          // Guardar token
          localStorage.setItem(
            'auth_token',
            response.token
          );

          // Guardar nombre del usuario
          localStorage.setItem(
            'user_name',
            response.usuario
          );

          // Cambiar estado a autenticado
          this.loggedIn.next(true);

        }

      })

    );

  }


  // Cerrar sesión
  logout(): void {

    localStorage.removeItem('auth_token');

    localStorage.removeItem('user_name');

    this.loggedIn.next(false);

  }


  // Obtener nombre del usuario
  getUserName(): string | null {

    return localStorage.getItem('user_name');

  }

}