import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // IMPORTANTE:
  // Esta IP debe ser la IPv4 de tu computadora.
  private apiUrl = 'http://192.168.100.94:5001/api';


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

  login(
    username: string,
    password: string
  ) {

    const datos = {

      username: username,

      password: password

    };


    return this.http
      .post<any>(
        `${this.apiUrl}/login`,
        datos
      )
      .pipe(

        tap(respuesta => {

          console.log(
            '[LOGIN] Respuesta del servidor:',
            respuesta
          );


          if (respuesta.token) {

            localStorage.setItem(
              'token',
              respuesta.token
            );

          }


          if (respuesta.usuario) {

            localStorage.setItem(
              'usuario',
              respuesta.usuario
            );

          }

        })

      );

  }


  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  logout() {

    localStorage.removeItem('token');

    localStorage.removeItem('usuario');

  }

}
