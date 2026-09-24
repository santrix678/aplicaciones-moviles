import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonSpinner
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonSpinner
  ]
})

export class RegistroPage implements OnInit {

  registroForm!: FormGroup;

  mensajeError = '';
  mensajeExito = '';

  cargando = false;

  // Backend Flask
  private apiUrl =
    'http://192.168.100.83:5001/api';


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}


  // ==========================================
  // FORMULARIO
  // ==========================================

  ngOnInit() {

    this.registroForm = this.fb.group({

      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(4)
        ]
      ],

      confirmarPassword: [
        '',
        [
          Validators.required
        ]
      ]

    });

  }


  // ==========================================
  // REGISTRAR CLIENTE
  // ==========================================

  registrar() {

    this.mensajeError = '';
    this.mensajeExito = '';


    if (this.registroForm.invalid) {

      this.registroForm.markAllAsTouched();

      return;

    }


    const datosFormulario =
      this.registroForm.value;


    // Verificar contraseñas
    if (
      datosFormulario.password !==
      datosFormulario.confirmarPassword
    ) {

      this.mensajeError =
        'Las contraseñas no coinciden.';

      return;

    }


    // Datos enviados a Flask
    const datos = {

      nombre:
        datosFormulario.nombre.trim(),

      username:
        datosFormulario.username.trim(),

      password:
        datosFormulario.password

      // El rol NO se envía.
      // Flask debe asignar automáticamente:
      // rol = cliente

    };


    this.cargando = true;


    console.log(
      '[REGISTRO] Enviando:',
      datos
    );


    this.http
      .post<any>(
        `${this.apiUrl}/registro`,
        datos
      )
      .subscribe({

        // ======================================
        // REGISTRO CORRECTO
        // ======================================

        next: (respuesta: any) => {

          this.cargando = false;


          console.log(
            '[REGISTRO] Respuesta:',
            respuesta
          );


          this.mensajeExito =
            respuesta?.mensaje ||
            'Cliente registrado correctamente.';


          this.registroForm.reset();


          // Esperar un momento y regresar al login
          setTimeout(() => {

            this.router.navigate(
              ['/login'],
              {
                replaceUrl: true
              }
            );

          }, 1500);

        },


        // ======================================
        // ERROR
        // ======================================

        error: (error: any) => {

          this.cargando = false;


          console.error(
            '[REGISTRO] Error:',
            error
          );


          if (error?.status === 409) {

            this.mensajeError =
              'Ese nombre de usuario ya está registrado.';

          }

          else if (error?.status === 400) {

            this.mensajeError =
              error?.error?.mensaje ||
              'Revisa los datos ingresados.';

          }

          else if (error?.status === 0) {

            this.mensajeError =
              'No se pudo conectar con el servidor Flask.';

          }

          else {

            this.mensajeError =
              error?.error?.mensaje ||
              'No se pudo registrar el cliente.';

          }

        }

      });

  }


  // ==========================================
  // VOLVER AL LOGIN
  // ==========================================

  volverLogin() {

    this.router.navigate(
      ['/login'],
      {
        replaceUrl: true
      }
    );

  }

}