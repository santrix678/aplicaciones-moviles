import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { AuthService } from '../services/auth';
import {
  NativeFeaturesService
} from '../services/native-features';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,

  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class Tab1Page {


  fotoPrenda: string | null = null;


  coordenadas:
    { lat: number; lng: number } | null = null;


  direccionManual = '';


  mensajeCamara = '';

  mensajeUbicacion = '';

  mensajeBackend = '';


  // IMPORTANTE:
  // Más adelante comprobaremos esta IP.
  private backendUrl =
    'http://192.168.100.94:5001/api/pedidos';


  constructor(

    private authService: AuthService,

    private router: Router,

    private nativeService:
      NativeFeaturesService,

    private http: HttpClient

  ) {

    this.cargarBorradorLocal();

  }



  // ==========================================
  // TOMAR FOTO
  // ==========================================

  async capturarFoto() {

    this.mensajeCamara =
      'Comprobando permiso de cámara...';


    const resultado =
      await this.nativeService
        .tomarFotoPrenda();


    switch (resultado.estado) {


      case 'concedido':

        this.fotoPrenda =
          resultado.foto || null;

        this.mensajeCamara =
          '✓ Fotografía obtenida correctamente.';

        this.guardarBorradorLocal();

        break;



      case 'denegado':

        this.fotoPrenda = null;

        this.mensajeCamara =
          'Permiso de cámara denegado. ' +
          'Puedes continuar sin fotografía.';

        break;



      case 'denegado-permanente':

        this.fotoPrenda = null;

        this.mensajeCamara =
          'La cámara está deshabilitada. ' +
          'Puedes habilitarla desde Ajustes.';

        break;



      case 'cancelado':

        this.mensajeCamara =
          'La captura fue cancelada.';

        break;



      default:

        this.mensajeCamara =
          'La cámara no está disponible.';

        break;

    }
  }



  // ==========================================
  // UBICACIÓN
  // ==========================================

  async capturarUbicacion() {

    this.mensajeUbicacion =
      'Obteniendo ubicación...';


    const resultado =
      await this.nativeService
        .obtenerUbicacionRecogida();


    switch (resultado.estado) {


      case 'concedido':

        if (
          resultado.lat !== undefined &&
          resultado.lng !== undefined
        ) {

          this.coordenadas = {

            lat: resultado.lat,

            lng: resultado.lng

          };


          this.mensajeUbicacion =
            '✓ Ubicación obtenida correctamente.';


          this.guardarBorradorLocal();

        }

        break;



      case 'denegado':

        this.coordenadas = null;

        this.mensajeUbicacion =
          'Permiso de ubicación denegado. ' +
          'Ingresa la dirección manualmente.';

        break;



      case 'denegado-permanente':

        this.coordenadas = null;

        this.mensajeUbicacion =
          'La ubicación está deshabilitada. ' +
          'Actívala desde Ajustes o escribe ' +
          'la dirección manualmente.';

        break;



      case 'no-disponible':

        this.coordenadas = null;

        this.mensajeUbicacion =
          'No se pudo obtener la ubicación. ' +
          'Verifica que el GPS esté encendido ' +
          'o escribe la dirección manualmente.';

        break;



      default:

        this.coordenadas = null;

        this.mensajeUbicacion =
          'Ubicación no disponible.';

        break;

    }
  }



  // ==========================================
  // ALMACENAMIENTO LOCAL
  // ==========================================

  guardarBorradorLocal() {

    const borrador = {

      tieneFoto:
        !!this.fotoPrenda,

      coordenadas:
        this.coordenadas,

      direccionManual:
        this.direccionManual,

      fecha:
        new Date().toISOString()

    };


    localStorage.setItem(

      'santrix_orden_borrador',

      JSON.stringify(borrador)

    );


    console.log(
      '[LOCAL] Borrador guardado:',
      borrador
    );

  }



  // ==========================================
  // RECUPERAR ALMACENAMIENTO
  // ==========================================

  cargarBorradorLocal() {

    const datos =
      localStorage.getItem(
        'santrix_orden_borrador'
      );


    if (!datos) {

      return;

    }


    try {

      const borrador =
        JSON.parse(datos);


      this.coordenadas =
        borrador.coordenadas || null;


      this.direccionManual =
        borrador.direccionManual || '';


      console.log(
        '[LOCAL] Borrador recuperado:',
        borrador
      );


    } catch (error) {

      console.error(
        '[LOCAL] Error:',
        error
      );


      localStorage.removeItem(
        'santrix_orden_borrador'
      );

    }
  }



  // ==========================================
  // ENVIAR AL BACKEND
  // ==========================================

  enviarOrden() {


    if (
      !this.direccionManual.trim() &&
      !this.coordenadas
    ) {

      alert(
        'Debes ingresar una dirección ' +
        'o permitir obtener tu ubicación.'
      );

      return;

    }


    const payload = {


      direccion:

        this.direccionManual.trim() ||

        'Ubicación obtenida mediante GPS',


      latitud:

        this.coordenadas?.lat ?? null,


      longitud:

        this.coordenadas?.lng ?? null,


      foto_prenda:

        this.fotoPrenda ?? null

    };


    console.log(
      '[BACKEND] Enviando:',
      payload
    );


    this.mensajeBackend =
      'Enviando orden al servidor...';


    const headers =
      new HttpHeaders({

        'Content-Type':
          'application/json'

      });



    this.http.post(

      this.backendUrl,

      payload,

      { headers }

    ).subscribe({


      next: (respuesta: any) => {


        console.log(
          '[BACKEND] Respuesta:',
          respuesta
        );


        this.mensajeBackend =
          '✓ Orden sincronizada con el backend.';


        alert(
          respuesta.mensaje ||
          '¡Orden registrada exitosamente!'
        );


        // Si llegó correctamente al backend,
        // eliminamos el respaldo local.

        localStorage.removeItem(
          'santrix_orden_borrador'
        );


        this.limpiarFormulario();

      },



      error: (error) => {


        console.error(
          '[BACKEND] Error:',
          error
        );


        // Si falla el backend,
        // conservamos los datos localmente.

        this.guardarBorradorLocal();


        this.mensajeBackend =
          'No se pudo conectar con el servidor. ' +
          'Los datos quedaron guardados localmente.';


        alert(
          'No se pudo conectar con el backend. ' +
          'El borrador quedó guardado ' +
          'en el dispositivo.'
        );

      }

    });

  }



  // ==========================================
  // LIMPIAR FORMULARIO
  // ==========================================

  private limpiarFormulario() {

    this.fotoPrenda = null;

    this.coordenadas = null;

    this.direccionManual = '';

    this.mensajeCamara = '';

    this.mensajeUbicacion = '';


    localStorage.removeItem(
      'santrix_orden_borrador'
    );

  }



  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  logout() {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);

  }

}