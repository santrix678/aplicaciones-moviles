import { Component, OnInit } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardSubtitle, 
  IonCardTitle, 
  IonCardContent, 
  IonButton, 
  IonIcon, 
  IonSearchbar 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Lavanderia } from '../services/lavanderia';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardSubtitle, 
    IonCardTitle, 
    IonCardContent, 
    IonButton, 
    IonIcon, 
    IonSearchbar
  ]
})
export class Tab1Page implements OnInit {
  servicios: any[] = [];

  constructor(private lavanderiaService: Lavanderia) {}

  ngOnInit() {
    this.lavanderiaService.getServicios().subscribe({
      next: (data: any) => {
        this.servicios = data;
      },
      error: (err) => {
        console.error('Error al cargar servicios', err);
      }
    });
  }
}
