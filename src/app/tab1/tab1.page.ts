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

  // ==========================================
  // DATOS DE LA ORDEN
  // ==========================================

  fotoPrenda: string | null = null;

  coordenadas:
    { lat: number; lng: number } | null = null;

  direccionManual = '';

  mensajeCamara = '';
  mensajeUbicacion = '';
  mensajeBackend = '';

  // Evita solicitar la ubicación varias veces
  private solicitandoUbicacion = false;


  // ==========================================
  // URL DEL BACKEND
  // ==========================================

  private backendUrl =
    'http://192.168.100.83:5001/api/pedidos';


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
  // AL ENTRAR A NUEVA ORDEN
  // OBTENER UBICACIÓN AUTOMÁTICAMENTE
  // ==========================================

  async ionViewDidEnter() {

    if (!this.coordenadas) {

      await this.capturarUbicacion();

    }

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
  // UBICACIÓN GPS
  // ==========================================

  async capturarUbicacion() {

    // Evita ejecutar dos solicitudes
    // al mismo tiempo.

    if (this.solicitandoUbicacion) {

      return;

    }


    this.solicitandoUbicacion = true;


    this.mensajeUbicacion =
      'Obteniendo ubicación GPS...';


    try {

      const resultado =
        await this.nativeService
          .obtenerUbicacionRecogida();


      switch (resultado.estado) {


        // ======================================
        // GPS OBTENIDO
        // ======================================

        case 'concedido':

          if (
            resultado.lat !== undefined &&
            resultado.lng !== undefined
          ) {

            // Guardar coordenadas

            this.coordenadas = {

              lat: resultado.lat,

              lng: resultado.lng

            };


            console.log(
              '[GPS] Coordenadas:',
              this.coordenadas
            );


            this.mensajeUbicacion =
              'Buscando dirección de tu ubicación...';


            // ==================================
            // CONVERTIR GPS EN DIRECCIÓN
            // ==================================

            try {

              const url =
                'https://nominatim.openstreetmap.org/reverse' +
                '?format=jsonv2' +
                '&lat=' + resultado.lat +
                '&lon=' + resultado.lng +
                '&zoom=18' +
                '&addressdetails=1';


              const respuesta: any =
                await this.http
                  .get(url)
                  .toPromise();


              console.log(
                '[DIRECCION] Respuesta:',
                respuesta
              );


              // ================================
              // DIRECCIÓN ENCONTRADA
              // ================================

              if (
                respuesta &&
                respuesta.display_name
              ) {

                this.direccionManual =
                  respuesta.display_name;


                this.mensajeUbicacion =
                  '✓ Ubicación y dirección ' +
                  'obtenidas correctamente.';


                console.log(
                  '[DIRECCION] Dirección:',
                  this.direccionManual
                );

              }


              // ================================
              // NO ENCONTRÓ DIRECCIÓN
              // ================================

              else {

                this.direccionManual = '';


                this.mensajeUbicacion =
                  '✓ Ubicación GPS obtenida. ' +
                  'No se encontró la dirección exacta.';

              }


            } catch (error) {

              console.error(
                '[DIRECCION] Error:',
                error
              );


              // IMPORTANTE:
              // Si falla Internet o Nominatim,
              // no perdemos las coordenadas.

              this.mensajeUbicacion =
                '✓ Ubicación GPS obtenida. ' +
                'No se pudo obtener la dirección ' +
                'automáticamente.';


            }


            // Guardamos coordenadas y dirección

            this.guardarBorradorLocal();


          } else {

            this.coordenadas = null;


            this.mensajeUbicacion =
              '⚠️ No se pudieron obtener ' +
              'las coordenadas GPS.';

          }

          break;



        // ======================================
        // PERMISO DENEGADO
        // ======================================

        case 'denegado':

          this.coordenadas = null;


          this.mensajeUbicacion =
            '⚠️ Debes permitir el acceso ' +
            'a la ubicación para registrar ' +
            'una orden.';

          break;



        // ======================================
        // PERMISO BLOQUEADO
        // ======================================

        case 'denegado-permanente':

          this.coordenadas = null;


          this.mensajeUbicacion =
            '⚠️ El permiso de ubicación está ' +
            'deshabilitado. Actívalo desde los ' +
            'Ajustes del teléfono para registrar ' +
            'una orden.';

          break;



        // ======================================
        // GPS NO DISPONIBLE
        // ======================================

        case 'no-disponible':

          this.coordenadas = null;


          this.mensajeUbicacion =
            '⚠️ No se pudo obtener tu ubicación. ' +
            'Verifica que el GPS del teléfono ' +
            'esté activado.';

          break;



        // ======================================
        // OTRO CASO
        // ======================================

        default:

          this.coordenadas = null;


          this.mensajeUbicacion =
            '⚠️ La ubicación GPS es obligatoria.';

          break;

      }


    } catch (error) {

      console.error(
        '[GPS] Error al obtener ubicación:',
        error
      );


      this.coordenadas = null;


      this.mensajeUbicacion =
        '⚠️ Ocurrió un error al obtener ' +
        'la ubicación GPS.';


    } finally {

      this.solicitandoUbicacion = false;

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
  // ENVIAR ORDEN AL BACKEND
  // ==========================================

  enviarOrden() {


    // ========================================
    // COMPROBAR GPS OBLIGATORIO
    // ========================================

    if (!this.coordenadas) {

      this.mensajeUbicacion =
        '⚠️ Debes obtener tu ubicación GPS ' +
        'antes de registrar la orden.';


      alert(
        'La ubicación es obligatoria. ' +
        'Activa el GPS y pulsa ' +
        '"Obtener mi ubicación".'
      );


      return;

    }


    // ========================================
    // COMPROBAR DIRECCIÓN
    // ========================================

    if (!this.direccionManual.trim()) {

      alert(
        'No se pudo determinar la dirección. ' +
        'Escribe la dirección de recogida.'
      );


      return;

    }


    // ========================================
    // CREAR DATOS PARA EL BACKEND
    // ========================================

    const payload = {

      direccion:
        this.direccionManual.trim(),

      latitud:
        this.coordenadas.lat,

      longitud:
        this.coordenadas.lng,

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


    // ========================================
    // ENVIAR A FLASK
    // ========================================

    this.http.post(

      this.backendUrl,

      payload,

      { headers }

    ).subscribe({


      // ======================================
      // ORDEN REGISTRADA
      // ======================================

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


        localStorage.removeItem(
          'santrix_orden_borrador'
        );


        this.limpiarFormulario();

      },


      // ======================================
      // ERROR DEL BACKEND
      // ======================================

      error: (error) => {

        console.error(
          '[BACKEND] Error:',
          error
        );


        // Guardar respaldo local

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

    this.mensajeBackend = '';


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