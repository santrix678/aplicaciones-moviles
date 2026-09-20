import { Injectable } from '@angular/core';

import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';

import {
  Geolocation
} from '@capacitor/geolocation';

import {
  NativeSettings,
  AndroidSettings,
  IOSSettings
} from 'capacitor-native-settings';


export type EstadoFuncionNativa =
  | 'concedido'
  | 'denegado'
  | 'denegado-permanente'
  | 'no-disponible'
  | 'cancelado';


export interface ResultadoFoto {
  estado: EstadoFuncionNativa;
  foto?: string;
}


export interface ResultadoUbicacion {
  estado: EstadoFuncionNativa;
  lat?: number;
  lng?: number;
}


@Injectable({
  providedIn: 'root'
})
export class NativeFeaturesService {

  constructor() {}


  // ==========================================
  // CÁMARA
  // ==========================================

  async tomarFotoPrenda(): Promise<ResultadoFoto> {

    try {

      const estadoInicial =
        await Camera.checkPermissions();

      console.log(
        '[CAMARA] Estado:',
        estadoInicial.camera
      );


      // Si todavía podemos pedir permiso
      if (
        estadoInicial.camera === 'prompt' ||
        estadoInicial.camera === 'prompt-with-rationale'
      ) {

        alert(
          'Lavandería Santrix necesita utilizar la cámara ' +
          'para registrar una fotografía de la prenda.'
        );

        const solicitado =
          await Camera.requestPermissions({
            permissions: ['camera']
          });


        if (solicitado.camera !== 'granted') {

          return {
            estado: 'denegado'
          };

        }
      }


      // Si el permiso está bloqueado
      else if (estadoInicial.camera === 'denied') {

        const abrir = confirm(
          'El permiso de cámara está desactivado.\n\n' +
          'Puedes continuar sin fotografía o habilitar ' +
          'la cámara desde los ajustes.\n\n' +
          '¿Deseas abrir Ajustes?'
        );


        if (abrir) {

          await this.abrirAjustesSistema();

        }


        return {
          estado: 'denegado-permanente'
        };
      }


      // Abrimos cámara
      const imagen =
        await Camera.getPhoto({

          quality: 70,

          allowEditing: false,

          resultType:
            CameraResultType.Base64,

          source:
            CameraSource.Camera

        });


      if (!imagen.base64String) {

        return {
          estado: 'cancelado'
        };

      }


      return {

        estado: 'concedido',

        foto:
          `data:image/jpeg;base64,${imagen.base64String}`

      };


    } catch (error) {

      console.error(
        '[CAMARA] Error:',
        error
      );


      return {
        estado: 'cancelado'
      };

    }
  }



  // ==========================================
  // GEOLOCALIZACIÓN
  // ==========================================

  async obtenerUbicacionRecogida():
    Promise<ResultadoUbicacion> {

    try {

      const estadoInicial =
        await Geolocation.checkPermissions();


      console.log(
        '[GPS] Estado:',
        estadoInicial.location
      );


      // Primera solicitud
      if (
        estadoInicial.location === 'prompt' ||
        estadoInicial.location ===
          'prompt-with-rationale'
      ) {

        alert(
          'Lavandería Santrix necesita tu ubicación ' +
          'para registrar el punto de recogida. ' +
          'Si no deseas compartirla, puedes escribir ' +
          'la dirección manualmente.'
        );


        const solicitado =
          await Geolocation.requestPermissions({
            permissions: ['location']
          });


        if (
          solicitado.location !== 'granted'
        ) {

          return {
            estado: 'denegado'
          };

        }
      }


      // Permiso bloqueado o desactivado
      else if (
        estadoInicial.location === 'denied'
      ) {

        const abrir = confirm(
          'El permiso de ubicación está desactivado.\n\n' +
          'Puedes escribir la dirección manualmente ' +
          'o habilitar la ubicación desde Ajustes.\n\n' +
          '¿Deseas abrir Ajustes?'
        );


        if (abrir) {

          await this.abrirAjustesSistema();

        }


        return {
          estado: 'denegado-permanente'
        };

      }


      // Obtener coordenadas reales
      const posicion =
        await Geolocation.getCurrentPosition({

          enableHighAccuracy: true,

          timeout: 15000,

          maximumAge: 5000

        });


      return {

        estado: 'concedido',

        lat:
          posicion.coords.latitude,

        lng:
          posicion.coords.longitude

      };


    } catch (error) {

      console.error(
        '[GPS] No disponible:',
        error
      );


      return {
        estado: 'no-disponible'
      };

    }
  }



  // ==========================================
  // ABRIR AJUSTES DEL SISTEMA
  // ==========================================

  async abrirAjustesSistema():
    Promise<void> {

    try {

      await NativeSettings.open({

        optionAndroid:
          AndroidSettings.ApplicationDetails,

        optionIOS:
          IOSSettings.App

      });


    } catch (error) {

      console.error(
        '[AJUSTES] Error:',
        error
      );

    }
  }

}
