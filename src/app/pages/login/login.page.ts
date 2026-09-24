import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonText,
  IonButton,
  IonSpinner
} from '@ionic/angular/standalone';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonText,
    IonButton,
    IonSpinner
  ]
})

export class LoginPage implements OnInit {

  loginForm!: FormGroup;

  errorMessage = '';

  cargando = false;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}


  // ==========================================
  // INICIAR FORMULARIO
  // ==========================================

  ngOnInit() {

    this.loginForm = this.fb.group({

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
      ]

    });

  }


  // ==========================================
  // INICIAR SESIÓN
  // ==========================================

  onLogin() {

    this.errorMessage = '';


    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;

    }


    const username =
      this.loginForm.value.username;

    const password =
      this.loginForm.value.password;


    this.cargando = true;


    console.log(
      '[LOGIN] Intentando iniciar sesión:',
      username
    );


    this.authService
      .login(username, password)
      .subscribe({

        // ======================================
        // LOGIN CORRECTO
        // ======================================

        next: (respuesta: any) => {

          this.cargando = false;


          console.log(
            '[LOGIN] Respuesta:',
            respuesta
          );


          if (!respuesta?.token) {

            this.errorMessage =
              'El servidor no devolvió una sesión válida.';

            return;

          }


          const rol =
            respuesta?.rol ||
            this.authService.getRol();


          console.log(
            '[LOGIN] Rol detectado:',
            rol
          );


          // ====================================
          // ADMINISTRADOR
          // ====================================

          if (rol === 'administrador') {

            console.log(
              '[LOGIN] Acceso como administrador'
            );

            this.router.navigate(
              ['/tabs/tab1'],
              {
                replaceUrl: true
              }
            );

            return;

          }


          // ====================================
          // CLIENTE
          // ====================================

          if (rol === 'cliente') {

            console.log(
              '[LOGIN] Acceso como cliente'
            );

            this.router.navigate(
              ['/tabs/tab1'],
              {
                replaceUrl: true
              }
            );

            return;

          }


          // ====================================
          // ROL DESCONOCIDO
          // ====================================

          this.errorMessage =
            'El usuario no tiene un rol válido.';

        },


        // ======================================
        // ERROR DE LOGIN
        // ======================================

        error: (error: any) => {

          this.cargando = false;


          console.error(
            '[LOGIN] Error:',
            error
          );


          if (error?.status === 401) {

            this.errorMessage =
              'Usuario o contraseña incorrectos.';

          }

          else if (error?.status === 0) {

            this.errorMessage =
              'No se pudo conectar con el servidor.';

          }

          else {

            this.errorMessage =
              error?.error?.mensaje ||
              error?.error?.message ||
              'Error al iniciar sesión.';

          }

        }

      });

  }


  // ==========================================
  // IR A REGISTRO
  // ==========================================

  irRegistro() {

    this.router.navigate([
      '/registro'
    ]);

  }

}