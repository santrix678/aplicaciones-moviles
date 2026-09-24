import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ==========================================
  // BACKEND FLASK
  // ==========================================

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

  login(
    username: string,
    password: string
  ): Observable<any> {

    const datos = {

      username: username.trim(),

      password: password

    };


    return this.http
      .post<any>(
        `${this.apiUrl}/login`,
        datos
      )
      .pipe(

        tap((respuesta: any) => {

          console.log(
            '[LOGIN] Respuesta del servidor:',
            respuesta
          );


          if (
            respuesta &&
            respuesta.token
          ) {

            // TOKEN
            localStorage.setItem(
              'token',
              respuesta.token
            );


            // USUARIO
            localStorage.setItem(
              'usuario',
              respuesta.usuario || ''
            );


            // ID DEL USUARIO
            localStorage.setItem(
              'usuario_id',
              String(
                respuesta.usuario_id || ''
              )
            );


            // NOMBRE
            localStorage.setItem(
              'nombre',
              respuesta.nombre || ''
            );


            // ROL
            localStorage.setItem(
              'rol',
              respuesta.rol || 'cliente'
            );


            console.log(
              '[LOGIN] Usuario:',
              respuesta.usuario
            );

            console.log(
              '[LOGIN] Rol:',
              respuesta.rol
            );

          } else {

            this.limpiarSesion();

          }

        })

      );

  }


  // ==========================================
  // REGISTRAR CLIENTE
  // ==========================================

  registrar(
    nombre: string,
    username: string,
    password: string
  ): Observable<any> {

    const datos = {

      nombre: nombre.trim(),

      username: username.trim(),

      password: password

    };


    console.log(
      '[REGISTRO] Enviando:',
      {
        nombre: datos.nombre,
        username: datos.username
      }
    );


    return this.http.post<any>(
      `${this.apiUrl}/registro`,
      datos
    );

  }


  // ==========================================
  // OBTENER TOKEN
  // ==========================================

  getToken(): string | null {

    return localStorage.getItem('token');

  }


  // ==========================================
  // OBTENER USUARIO
  // ==========================================

  getUsuario(): string | null {

    return localStorage.getItem('usuario');

  }


  // ==========================================
  // OBTENER NOMBRE
  // ==========================================

  getNombre(): string | null {

    return localStorage.getItem('nombre');

  }


  // ==========================================
  // OBTENER ID
  // ==========================================

  getUsuarioId(): number | null {

    const id =
      localStorage.getItem('usuario_id');


    if (!id) {

      return null;

    }


    return Number(id);

  }


  // ==========================================
  // OBTENER ROL
  // ==========================================

  getRol(): string | null {

    return localStorage.getItem('rol');

  }


  // ==========================================
  // SABER SI ES ADMINISTRADOR
  // ==========================================

  esAdministrador(): boolean {

    return this.getRol() === 'administrador';

  }


  // ==========================================
  // SABER SI ES CLIENTE
  // ==========================================

  esCliente(): boolean {

    return this.getRol() === 'cliente';

  }


  // ==========================================
  // LIMPIAR SESIÓN
  // ==========================================

  private limpiarSesion(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('usuario');

    localStorage.removeItem('usuario_id');

    localStorage.removeItem('nombre');

    localStorage.removeItem('rol');

  }


  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  logout(): void {

    this.limpiarSesion();

    console.log(
      '[LOGIN] Sesión cerrada.'
    );

  }

}