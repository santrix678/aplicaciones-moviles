import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LavanderiaService } from '../services/lavanderia';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule] // <-- Agregar aquí
})
export class Tab1Page implements OnInit {
  ordenes: any[] = [];
  cargando: boolean = true;

  constructor(private lavanderiaService: LavanderiaService) {}

  ngOnInit() {
    this.cargarOrdenes();
  }

  cargarOrdenes() {
    this.lavanderiaService.getOrdenes().subscribe({
      next: (data) => {
        this.ordenes = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error conectando a Flask:', err);
        this.cargando = false;
      }
    });
  }
}