import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LavanderiaService } from '../services/lavanderia';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonicModule,     // <-- Soluciona todos los errores de 'ion-header', 'ion-button', etc.
    CommonModule,    // <-- Soluciona las advertencias de '*ngIf'
    FormsModule      // <-- Permite el uso de formularios e inputs
  ]
})
export class Tab2Page {
  enviando = false;
  mensajeRespuesta = '';

  constructor(private lavanderiaService: LavanderiaService) {}

  crearNuevaOrden() {
    this.enviando = true;
    this.mensajeRespuesta = '';

    const nuevaOrdenData = {
      servicio: 'Lavado Express de Edredón',
      cliente_id: 1
    };

    this.lavanderiaService.crearOrden(nuevaOrdenData).subscribe({
      next: (res: any) => {
        this.enviando = false;
        this.mensajeRespuesta = res.mensaje || 'Orden enviada con éxito al worker.';
      },
      error: (err) => {
        this.enviando = false;
        this.mensajeRespuesta = 'Error al conectar con la API';
        console.error(err);
      }
    });
  }
}