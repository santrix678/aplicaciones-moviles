import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para que funcionen los *ngIf y *ngFor
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
  IonList, 
  IonItem, 
  IonLabel 
} from '@ionic/angular/standalone'; // Importamos los componentes de Ionic uno por uno
import { LavanderiaService } from '../services/lavanderia';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true, // Le indicamos a Angular que es un componente autónomo
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle, 
    IonCardContent, 
    IonList, 
    IonItem, 
    IonLabel
  ] // Registramos los componentes para que la vista los reconozca
})
export class Tab1Page implements OnInit {

  reporte: any = null;
  ordenes: any[] = [];

  constructor(private lavanderiaService: LavanderiaService) {}

  ngOnInit() {
    this.obtenerReporte();
    this.obtenerOrdenes();
  }

  obtenerReporte() {
    this.lavanderiaService.getReporte().subscribe({
      next: (res: any) => {
        this.reporte = res;
      },
      error: (err: any) => console.error('Error al conectar con Flask:', err)
    });
  }

  obtenerOrdenes() {
    this.lavanderiaService.getOrdenes().subscribe({
      next: (res: any) => {
        this.ordenes = res;
      },
      error: (err: any) => console.error('Error al obtener órdenes:', err)
    });
  }
}