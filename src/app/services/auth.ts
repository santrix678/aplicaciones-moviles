import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  login(username: string, password: string) {
    // Guarda el token en el almacenamiento local
    localStorage.setItem('token', 'mi_token_simulado');
    return {
      subscribe: (observer: { next: () => void; error: () => void }) => {
        observer.next();
      }
    };
  }

  logout() {
    localStorage.removeItem('token');
  }
}
