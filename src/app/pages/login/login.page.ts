import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  username = 'Admin_Santrix';
  password = '123';

  constructor(private router: Router) {}

  onLogin() {
    // Redirige a /tabs/tab1
    this.router.navigate(['/tabs/tab1']);
  }
}