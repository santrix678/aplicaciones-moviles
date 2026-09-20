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
  IonButton
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
    IonButton
  ]
})


export class LoginPage implements OnInit {

  loginForm!: FormGroup;

  errorMessage: string = '';


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}


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


  onLogin() {

    this.errorMessage = '';

    if (this.loginForm.valid) {

      const {
        username,
        password
      } = this.loginForm.value;

      this.authService
        .login(username, password)
        .subscribe({

          next: () => {

            this.router.navigate([
              '/tabs/tab1'
            ]);

          },

          error: (error) => {

            console.error(
              '[LOGIN] Error:',
              error
            );

            this.errorMessage =
              'Credenciales incorrectas o error de conexión';

          }

        });

    } else {

      this.loginForm.markAllAsTouched();

    }

  }

}